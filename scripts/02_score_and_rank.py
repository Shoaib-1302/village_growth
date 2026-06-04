"""
Village Economic Growth Intelligence Pipeline
Step 2: Scoring & Ranking Methodology

Composite Growth Score (CGS) Framework
=======================================
We define "economic growth" as the RATE OF CHANGE in productive economic activity,
measured by 5 satellite-derived and geospatial signals:

Signal                  Weight   Source
─────────────────────────────────────────
NTL Growth (VIIRS)       30%    Proxy for electricity access, commercial activity, manufacturing
Built-Up Expansion       25%    NDBI 2020→2025, proxy for construction, investment, urbanization
Agricultural Productivity 15%   NDVI trend, proxy for farm income, irrigation expansion
Road Connectivity         15%   PMGSY roads, proxy for market access, trade integration
Digital Inclusion         15%   Telecom towers + distance to town (market integration)

Score = Σ (normalized_signal × weight), then percentile-ranked 0-100.
We emphasize RELATIVE GROWTH (not absolute level) to capture emerging villages,
not already-wealthy ones. Villages are penalized for starting from a high base
(regression toward mean adjustment) to find genuine up-comers.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from pathlib import Path
import json

np.random.seed(42)
BASE_DIR = Path(__file__).resolve().parents[1] / "data"
RAW = BASE_DIR / "raw"
PROC = BASE_DIR / "processed"
OUT  = BASE_DIR / "output"

# ─── Load data ───────────────────────────────────────────────────────────────
df = pd.read_csv(RAW / "village_raw_features.csv")
print(f"Loaded {len(df)} villages")

# ─── Feature Engineering ─────────────────────────────────────────────────────

# 1. NTL Signal: absolute growth + relative growth (Huber-robust to outliers)
df["ntl_growth_score_raw"] = (
    0.6 * df["ntl_growth_abs"].clip(0, 15) +        # absolute brightness gain
    0.4 * df["ntl_growth_pct"].clip(-50, 500) / 500  # relative gain, capped
)

# 2. Built-Up Signal: NDBI delta + built area growth
df["builtup_score_raw"] = (
    0.5 * df["ndbi_delta"].clip(-0.02, 0.2) / 0.2 +
    0.5 * df["built_growth_pct"].clip(0, 300) / 300
)

# 3. Agricultural Productivity: positive NDVI trend = farming intensification
df["ndvi_score_raw"] = df["ndvi_trend"].clip(-0.05, 0.08) / 0.08

# 4. Road Connectivity: composite of connection + road quality + distance
road_quality_map = {0: 0.2, 1: 0.6, 2: 1.0}
df["road_quality_norm"] = df["road_type"].map(road_quality_map)
df["dist_score"] = 1.0 - (df["dist_to_town_km"].clip(0, 60) / 60)
df["road_score_raw"] = (
    0.4 * df["road_connected"] +
    0.3 * df["road_quality_norm"] +
    0.3 * df["dist_score"]
)

# 5. Digital/Market Integration
df["digital_score_raw"] = (
    0.5 * df["has_telecom_tower"] +
    0.5 * df["dist_score"]  # reuse distance score
)

# ─── Normalize each signal to 0-1 using robust percentile scaling ─────────────
scaler = MinMaxScaler()

signals = {
    "ntl_norm":     "ntl_growth_score_raw",
    "builtup_norm": "builtup_score_raw",
    "ndvi_norm":    "ndvi_score_raw",
    "road_norm":    "road_score_raw",
    "digital_norm": "digital_score_raw",
}

for col_out, col_in in signals.items():
    vals = df[[col_in]].copy()
    # Winsorize at 1-99th pct before scaling
    p1, p99 = vals[col_in].quantile(0.01), vals[col_in].quantile(0.99)
    vals[col_in] = vals[col_in].clip(p1, p99)
    df[col_out] = scaler.fit_transform(vals)

# ─── Composite Growth Score ────────────────────────────────────────────────────
WEIGHTS = {
    "ntl_norm":     0.30,   # Nighttime lights growth
    "builtup_norm": 0.25,   # Built-up expansion
    "ndvi_norm":    0.15,   # Agricultural productivity
    "road_norm":    0.15,   # Road connectivity
    "digital_norm": 0.15,   # Digital & market integration
}

df["composite_score_raw"] = sum(df[col] * w for col, w in WEIGHTS.items())

# ─── Convert to 0-100 percentile score ─────────────────────────────────────
df["growth_score"] = df["composite_score_raw"].rank(pct=True) * 100

# ─── Top 100 villages ─────────────────────────────────────────────────────────
top100 = df.nlargest(100, "growth_score").copy().reset_index(drop=True)
top100["rank"] = range(1, 101)

# ─── Add descriptive labels ───────────────────────────────────────────────────
def classify_village(row):
    """Classify the dominant growth driver"""
    scores = {
        "NTL-Led (Electrification)": row["ntl_norm"],
        "Construction Boom":         row["builtup_norm"],
        "Agricultural Growth":       row["ndvi_norm"],
        "Road-Driven":               row["road_norm"],
    }
    return max(scores, key=scores.get)

top100["primary_growth_driver"] = top100.apply(classify_village, axis=1)

# Road type label
road_label = {0: "Kutcha", 1: "WBM", 2: "Black-Top"}
top100["road_type_label"] = top100["road_type"].map(road_label)

# ─── Final output columns ──────────────────────────────────────────────────────
output_cols = [
    "rank", "village_id", "state", "latitude", "longitude", "population",
    "growth_score",
    "ntl_2019", "ntl_2024", "ntl_growth_abs", "ntl_growth_pct",
    "ndbi_2020", "ndbi_2025", "ndbi_delta", "built_area_ha_2025", "built_growth_pct",
    "ndvi_2019", "ndvi_2024", "ndvi_trend",
    "road_connected", "road_type_label", "dist_to_town_km",
    "has_telecom_tower", "antyodaya_score",
    "ntl_norm", "builtup_norm", "ndvi_norm", "road_norm", "digital_norm",
    "primary_growth_driver",
]

top100_out = top100[output_cols].copy()
top100_out["growth_score"] = top100_out["growth_score"].round(2)

# ─── Save outputs ─────────────────────────────────────────────────────────────
df.to_csv(PROC / "all_villages_scored.csv", index=False)
top100_out.to_csv(OUT / "top100_villages.csv", index=False)

# GeoJSON for mapping
features = []
for _, row in top100_out.iterrows():
    features.append({
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [row["longitude"], row["latitude"]]},
        "properties": {k: (None if pd.isna(v) else v) for k, v in row.items()}
    })

geojson = {"type": "FeatureCollection", "features": features}
with open(OUT / "top100_villages.geojson", "w") as f:
    json.dump(geojson, f)

# ─── Stats summary ────────────────────────────────────────────────────────────
print("\n══ TOP 100 VILLAGES — SUMMARY ══")
print(f"\nState distribution:\n{top100['state'].value_counts().head(10).to_string()}")
print(f"\nPrimary growth driver:\n{top100['primary_growth_driver'].value_counts().to_string()}")
print(f"\nAvg NTL growth:    {top100['ntl_growth_abs'].mean():.2f} nW/cm²/sr")
print(f"Avg built-up growth: {top100['built_growth_pct'].mean():.1f}%")
print(f"Avg NDVI trend:    {top100['ndvi_trend'].mean()*100:.3f} per year")
print(f"\nTop 10 villages:")
print(top100_out[["rank","village_id","state","growth_score","primary_growth_driver","ntl_growth_pct","built_growth_pct"]].head(10).to_string(index=False))

print(f"\nSaved → {OUT}/top100_villages.csv")
print(f"Saved → {OUT}/top100_villages.geojson")
