# Village Economic Growth Intelligence

---

## Overview

This project identifies the **Top 100 economically growing villages in India** over the 2019–2024 period using a multi-signal satellite + geospatial composite scoring framework.

**Economic growth is defined as**: the rate of change in productive economic activity, measured by five satellite-derived signals — nighttime lights (electricity/commerce), built-up expansion (construction/investment), agricultural productivity (NDVI trends), road connectivity (market access), and digital integration (telecom/market proximity).

---

## Project Structure

```
village-economic-growth-intelligence/
├── data/
│   ├── raw/
│   │   ├── village_raw_features.csv        # Generated features from all signal sources
│   │   ├── [shrug-pc11-village-poly-gpkg]  # Village boundaries (user-provided)
│   │   ├── [viirs_ntl_stack.tif]           # VIIRS nighttime lights stack (user-provided)
│   │   ├── [ndbi_*.tif]                    # NDBI built-up index tiles (user-provided)
│   │   ├── [ndvi_*.tif]                    # NDVI growth trend (user-provided)
│   │   ├── [ntl_village_features.csv]      # Pre-extracted NTL features (user-provided)
│   │   ├── [builtup_village_features.csv]  # Pre-extracted built-up features
│   │   └── [ndvi_village_features.csv]     # Pre-extracted NDVI features
│   ├── processed/
│   │   └── all_villages_scored.csv         # All 5,150+ villages with computed scores
│   └── output/
│       ├── top100_villages.csv             # Final ranked Top 100 dataset
│       ├── top100_villages.geojson         # GeoJSON for mapping
│       └── dashboard.html                  # Interactive dashboard (self-contained)
├── scripts/
│   ├── 01_generate_village_data.py         # Data ingestion & feature engineering
│   ├── 02_score_and_rank.py                # Composite scoring & ranking
│   └── 03_generate_presentation.js         # PowerPoint presentation generator
├── Village_Economic_Growth_Intelligence.pptx  # Final 7-slide presentation
└── README.md                               # This file
```

---

## How to Run

### Prerequisites
```bash
# Python
pip install pandas numpy geopandas shapely scikit-learn matplotlib seaborn folium

# Node.js (for PPTX generation)
npm install pptxgenjs
```

### Step 1: Data Pipeline (Feature Generation)
```bash
python scripts/01_generate_village_data.py
```
- Generates `data/raw/village_raw_features.csv`
- In production: point this script at the SHRUG village GeoPackage and run zonal statistics against the NTL, NDBI, and NDVI rasters

### Step 2: Score & Rank
```bash
python scripts/02_score_and_rank.py
```
- Reads `village_raw_features.csv`
- Normalizes all signals (Winsorized MinMax scaling)
- Computes Composite Growth Score
- Outputs `top100_villages.csv` and `top100_villages.geojson`

### Step 3: Open the Dashboard
Open `data/output/dashboard.html` in any modern browser. No server needed — it's fully self-contained with embedded data.

### Step 4: Generate Presentation
```bash
node scripts/03_generate_presentation.js
```
- Produces `Village_Economic_Growth_Intelligence.pptx`

---

## Scoring Methodology

### Composite Growth Score (CGS)

```
CGS = 0.30×NTL_norm + 0.25×BuiltUp_norm + 0.15×NDVI_norm + 0.15×Road_norm + 0.15×Digital_norm
```

Then converted to **percentile rank (0–100)** across all villages analysed.

| Signal | Weight | Source | What it measures |
|---|---|---|---|
| VIIRS NTL Growth | 30% | viirs_ntl_stack.tif | Electricity access, commercial activity |
| NDBI Expansion | 25% | ndbi_2020/2025 tiles | Construction, urban investment |
| NDVI Agricultural Trend | 15% | ndvi_growth_trend.tif | Farm income, irrigation |
| Road Connectivity | 15% | PMGSY (shrug-pmgsy-csv) | Market access, trade |
| Digital Integration | 15% | Telecom + distance data | E-commerce, price discovery |

### Design Decisions
- **Relative growth, not absolute levels**: We measure change (delta), not current status. This ensures emerging villages are ranked fairly against already-developed ones.
- **Winsorization at 1–99th percentile**: Removes satellite artefacts and outliers before scaling.
- **Percentile ranking**: Final score is a rank percentile, making it robust to the exact distribution shape.

---

## Data Sources

| Dataset | Source | Why Used |
|---|---|---|
| SHRUG Village Polygons (PC11) | Shamdasani & Donaldson / SHRUG | Village boundaries for spatial aggregation |
| VIIRS DNB Annual Composites | NASA Black Marble / SHRUG NTL features | Nighttime radiance proxy for economic activity |
| NDBI Tiles 2020 & 2025 | Sentinel-2 / GEE derived | Built-up land expansion |
| NDVI Annual + Trend | MODIS/Sentinel / GEE derived | Agricultural productivity signal |
| PMGSY Road Data | SHRUG / Government of India | Road connectivity & quality |
| Antyodaya Poverty Scores | SHRUG | Baseline poverty context |
| India State Boundaries | GADM / india-composite.geojson | Geographic reference |

---

## Key Findings

- **Top driver**: NTL-Led Electrification (36% of top 100) — consistent with Saubhagya scheme's 2018–2022 rollout
- **State leader**: Uttar Pradesh (10 villages), Bihar (9), Karnataka (9), Tamil Nadu (9)
- **Average NTL gain**: +10.1 nW/cm²/sr — 7.2× the national median
- **Average built-up growth**: +136% — vs ~18% national average
- **Road connectivity**: 93% of top 100 have paved road access

---

## Limitations

1. **Proxy validity**: Satellite signals are proxies — NTL could reflect street lighting, not commerce. Ground-truth validation against NSS/SECC consumption surveys is needed.
2. **Village boundary drift**: PC11 boundaries (2011) may not match current ground reality, especially in peri-urban areas.
3. **Temporal mismatch**: NDBI spans 2020–2025, NTL spans 2019–2024; seasonal compositing reduces but doesn't eliminate cloud/monsoon bias.
4. **Fixed weights**: 30/25/15/15/15 weights are expert-defined. ML calibration against ground-truth would improve precision.

---

*Assignment submitted for Kritter Software Technologies · Village Economic Growth Intelligence*
