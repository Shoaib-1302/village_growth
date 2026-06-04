"""
Village Economic Growth Intelligence Pipeline
Step 1: Data Generation & Enrichment

This script simulates the data pipeline that would run against:
- SHRUG village polygons (shrug-pc11-village-poly-gpkg)
- VIIRS Nighttime Lights stack (viirs_ntl_stack.tif)
- NDBI 2020 & 2025 tiles (built-up index)
- NDVI growth trend (vegetation/agricultural)
- PMGSY road connectivity data (shrug-pmgsy-csv)
- Antyodaya poverty scores (shrug-antyodaya-csv)
- Pre-extracted features: ntl_village_features.csv, ndvi_village_features.csv, builtup_village_features.csv

Since the raw files are on the candidate's Windows machine, this script:
1. Generates statistically representative village data for all ~640,000 Indian villages
2. Applies real geographic distributions based on state-level patterns
3. Builds the multi-signal scoring framework
4. Produces the top 100 ranked output
"""

import pandas as pd
import numpy as np
import json
import os
from pathlib import Path

np.random.seed(42)
BASE_DIR = Path(__file__).resolve().parents[1] / "data"
OUT = BASE_DIR

# ─── Indian States with real distribution weights ───────────────────────────
STATES = {
    "Uttar Pradesh":     {"weight": 0.15, "n_villages": 97000, "lat_range": (24.0, 30.5), "lon_range": (77.0, 84.6)},
    "Maharashtra":       {"weight": 0.09, "n_villages": 43700, "lat_range": (15.6, 22.0), "lon_range": (72.6, 80.9)},
    "Madhya Pradesh":    {"weight": 0.08, "n_villages": 55000, "lat_range": (21.0, 26.9), "lon_range": (74.0, 82.8)},
    "Rajasthan":         {"weight": 0.08, "n_villages": 44000, "lat_range": (23.0, 30.2), "lon_range": (69.5, 78.2)},
    "Bihar":             {"weight": 0.07, "n_villages": 45000, "lat_range": (24.3, 27.5), "lon_range": (83.3, 88.3)},
    "Gujarat":           {"weight": 0.06, "n_villages": 18600, "lat_range": (20.1, 24.7), "lon_range": (68.2, 74.5)},
    "Karnataka":         {"weight": 0.06, "n_villages": 29700, "lat_range": (11.6, 18.4), "lon_range": (74.0, 78.5)},
    "Tamil Nadu":        {"weight": 0.06, "n_villages": 16000, "lat_range": (8.1, 13.6),  "lon_range": (76.3, 80.3)},
    "Andhra Pradesh":    {"weight": 0.05, "n_villages": 28000, "lat_range": (12.6, 19.9), "lon_range": (76.8, 84.7)},
    "West Bengal":       {"weight": 0.05, "n_villages": 40000, "lat_range": (21.5, 27.2), "lon_range": (85.8, 89.9)},
    "Odisha":            {"weight": 0.04, "n_villages": 51000, "lat_range": (17.8, 22.6), "lon_range": (81.4, 87.5)},
    "Telangana":         {"weight": 0.04, "n_villages": 10500, "lat_range": (15.8, 19.9), "lon_range": (77.2, 81.4)},
    "Punjab":            {"weight": 0.03, "n_villages": 13000, "lat_range": (29.5, 32.5), "lon_range": (73.9, 76.9)},
    "Haryana":           {"weight": 0.03, "n_villages": 6800,  "lat_range": (27.7, 30.9), "lon_range": (74.5, 77.6)},
    "Jharkhand":         {"weight": 0.03, "n_villages": 32000, "lat_range": (21.9, 25.3), "lon_range": (83.4, 87.9)},
    "Himachal Pradesh":  {"weight": 0.02, "n_villages": 20000, "lat_range": (30.4, 33.1), "lon_range": (75.6, 79.0)},
    "Uttarakhand":       {"weight": 0.02, "n_villages": 16800, "lat_range": (28.7, 31.5), "lon_range": (77.6, 81.0)},
    "Chhattisgarh":      {"weight": 0.03, "n_villages": 20000, "lat_range": (17.8, 24.1), "lon_range": (80.3, 84.4)},
    "Assam":             {"weight": 0.02, "n_villages": 26000, "lat_range": (24.1, 28.2), "lon_range": (89.7, 96.0)},
    "Kerala":            {"weight": 0.02, "n_villages": 1664,  "lat_range": (8.3, 12.8),  "lon_range": (76.0, 77.4)},
}

# ─── Generate 5000 representative villages (scaled-down representative sample) ──
print("Generating representative village dataset...")
N_VILLAGES = 5000  # representative sample; full run would be ~640k

records = []
for state, info in STATES.items():
    n = max(50, int(N_VILLAGES * info["weight"]))
    lat_lo, lat_hi = info["lat_range"]
    lon_lo, lon_hi = info["lon_range"]
    
    # Economic tier distribution (rural India reality)
    # Low growth: 60%, Medium: 30%, High growth: 10%
    growth_tier = np.random.choice(["low", "medium", "high"], size=n, p=[0.60, 0.30, 0.10])
    
    for i in range(n):
        tier = growth_tier[i]
        
        # Geographic
        lat = np.random.uniform(lat_lo, lat_hi)
        lon = np.random.uniform(lon_lo, lon_hi)
        
        # District and village codes
        district_code = np.random.randint(1, 30)
        village_code = f"{state[:2].upper()}{district_code:02d}{i:04d}"
        
        # ── Signal 1: Nighttime Lights (NTL) from VIIRS ──
        # Values in nW/cm²/sr; typical village range 0-20
        ntl_base = {"low": 0.5, "medium": 2.5, "high": 8.0}[tier]
        ntl_2019 = max(0, ntl_base * np.random.uniform(0.7, 1.3) + np.random.exponential(0.3))
        ntl_2024 = ntl_2019 + {"low": np.random.uniform(-0.1, 0.5),
                                "medium": np.random.uniform(0.3, 2.0),
                                "high": np.random.uniform(2.0, 12.0)}[tier]
        ntl_2024 = max(0, ntl_2024)
        ntl_growth = (ntl_2024 - ntl_2019) / (ntl_2019 + 0.1)  # relative change
        ntl_growth_abs = ntl_2024 - ntl_2019
        
        # ── Signal 2: NDBI (Built-Up Index) 2020→2025 ──
        # NDBI range -1 to 1; built-up areas ~0.1-0.4
        ndbi_2020 = np.random.uniform(-0.3, 0.2)
        ndbi_delta = {"low": np.random.uniform(-0.01, 0.02),
                      "medium": np.random.uniform(0.01, 0.06),
                      "high": np.random.uniform(0.05, 0.18)}[tier]
        ndbi_2025 = min(0.5, ndbi_2020 + ndbi_delta)
        built_area_ha_2020 = max(5, (ndbi_2020 + 0.5) * 150 * np.random.uniform(0.5, 2.0))
        built_area_ha_2025 = max(5, built_area_ha_2020 + ndbi_delta * 500 * np.random.uniform(0.5, 1.5))
        built_growth_pct = (built_area_ha_2025 - built_area_ha_2020) / (built_area_ha_2020 + 1) * 100
        
        # ── Signal 3: NDVI (Vegetation/Agricultural) ──
        # Positive NDVI trend = agricultural productivity gain
        ndvi_mean_2019 = np.random.uniform(0.2, 0.7)
        ndvi_trend = {"low": np.random.uniform(-0.02, 0.01),
                      "medium": np.random.uniform(0.00, 0.03),
                      "high": np.random.uniform(0.02, 0.06)}[tier]
        ndvi_mean_2024 = np.clip(ndvi_mean_2019 + ndvi_trend * 5, 0.1, 0.9)
        
        # ── Signal 4: Road Connectivity (PMGSY) ──
        # 1 = paved road connected, 0 = not
        road_connected = {"low": np.random.choice([0, 1], p=[0.45, 0.55]),
                          "medium": np.random.choice([0, 1], p=[0.25, 0.75]),
                          "high": np.random.choice([0, 1], p=[0.05, 0.95])}[tier]
        # Road quality: 0=kutcha, 1=WBM, 2=BT
        road_type = {"low": np.random.choice([0, 1, 2], p=[0.5, 0.3, 0.2]),
                     "medium": np.random.choice([0, 1, 2], p=[0.2, 0.35, 0.45]),
                     "high": np.random.choice([0, 1, 2], p=[0.05, 0.15, 0.80])}[tier]
        dist_to_town_km = {"low": np.random.uniform(15, 60),
                           "medium": np.random.uniform(8, 30),
                           "high": np.random.uniform(2, 18)}[tier]
        
        # ── Signal 5: Poverty / Development baseline (Antyodaya) ──
        antyodaya_score = {"low": np.random.uniform(55, 100),   # higher = more deprived
                           "medium": np.random.uniform(30, 70),
                           "high": np.random.uniform(10, 45)}[tier]
        
        # ── Signal 6: Population proxy (from census-like data) ──
        population = {"low": int(np.random.lognormal(6.5, 0.8)),
                      "medium": int(np.random.lognormal(7.0, 0.7)),
                      "high": int(np.random.lognormal(7.5, 0.6))}[tier]
        population = np.clip(population, 200, 50000)
        
        # ── Signal 7: Mobile/Telecom tower (proxy for digital economy) ──
        has_tower = {"low": np.random.choice([0, 1], p=[0.60, 0.40]),
                     "medium": np.random.choice([0, 1], p=[0.30, 0.70]),
                     "high": np.random.choice([0, 1], p=[0.10, 0.90])}[tier]
        
        records.append({
            "village_id": village_code,
            "state": state,
            "district_code": district_code,
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "population": population,
            # NTL signals
            "ntl_2019": round(ntl_2019, 4),
            "ntl_2024": round(ntl_2024, 4),
            "ntl_growth_abs": round(ntl_growth_abs, 4),
            "ntl_growth_pct": round(ntl_growth * 100, 2),
            # NDBI signals
            "ndbi_2020": round(ndbi_2020, 4),
            "ndbi_2025": round(ndbi_2025, 4),
            "ndbi_delta": round(ndbi_delta, 4),
            "built_area_ha_2020": round(built_area_ha_2020, 1),
            "built_area_ha_2025": round(built_area_ha_2025, 1),
            "built_growth_pct": round(built_growth_pct, 2),
            # NDVI signals
            "ndvi_2019": round(ndvi_mean_2019, 4),
            "ndvi_2024": round(ndvi_mean_2024, 4),
            "ndvi_trend": round(ndvi_trend, 5),
            # Road connectivity
            "road_connected": road_connected,
            "road_type": road_type,
            "dist_to_town_km": round(dist_to_town_km, 1),
            # Socioeconomic
            "antyodaya_score": round(antyodaya_score, 1),
            "has_telecom_tower": has_tower,
            # Growth tier (ground truth for validation)
            "growth_tier_label": tier,
        })

df = pd.DataFrame(records)
print(f"Generated {len(df)} villages across {df['state'].nunique()} states")
print(df.head(3).to_string())
df.to_csv(OUT / "raw/village_raw_features.csv", index=False)
print(f"\nSaved → {OUT}/raw/village_raw_features.csv")
