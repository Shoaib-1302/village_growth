const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3" × 7.5"
const outputFile = path.join(__dirname, "..", "data", "output", "Village_Economic_Growth_Intelligence.pptx");

// ── Color Palette ──────────────────────────────────────────────────────────
const C = {
  ink:     "0F172A",  // near-black
  dark:    "1E293B",  // dark navy
  mid:     "334155",  // medium slate
  muted:   "64748B",  // muted slate
  border:  "E2E8F0",  // light border
  bg:      "F8FAFC",  // off-white
  white:   "FFFFFF",
  accent:  "2563EB",  // blue
  accent2: "7C3AED",  // purple
  ntl:     "F59E0B",  // amber – nighttime lights
  build:   "EF4444",  // red – built-up
  road:    "3B82F6",  // blue – roads
  agri:    "22C55E",  // green – agriculture
  gold:    "D97706",
};

const makeShadow = () => ({
  type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.10,
});

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.ink };

  // Large background circle
  s.addShape(pres.shapes.OVAL, {
    x: 7.5, y: -1.5, w: 8, h: 8,
    fill: { color: "1E3A5F" }, line: { color: "1E3A5F" },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 9.5, y: 2.5, w: 4, h: 4,
    fill: { color: "1E1B4B", transparency: 40 }, line: { color: "1E1B4B" },
  });

  // Badge
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.7, y: 0.6, w: 3.4, h: 0.38, fill: { color: "312E81", transparency: 20 },
    line: { color: "6366F1", width: 1 }, rectRadius: 0.05,
  });
  s.addText("SATELLITE INTELLIGENCE REPORT · INDIA · 2019–2024", {
    x: 0.7, y: 0.6, w: 3.4, h: 0.38, fontSize: 7, color: "A5B4FC",
    align: "center", valign: "middle", charSpacing: 1, bold: true,
  });

  // Title
  s.addText("Village Economic", {
    x: 0.7, y: 1.3, w: 8, h: 0.9, fontSize: 44, color: C.white,
    fontFace: "Georgia", bold: false,
  });
  s.addText("Growth Intelligence", {
    x: 0.7, y: 2.1, w: 8, h: 0.9, fontSize: 44, color: "93C5FD",
    fontFace: "Georgia", italic: true,
  });

  // Divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 3.15, w: 2.0, h: 0.04, fill: { color: "6366F1" }, line: { color: "6366F1" },
  });

  // Subtitle
  s.addText("Identifying India's Top 100 Economically Growing Villages\nUsing Multi-Signal Satellite & Geospatial Analysis", {
    x: 0.7, y: 3.35, w: 7.5, h: 0.9, fontSize: 13, color: "94A3B8",
    fontFace: "Calibri", lineSpacingMultiple: 1.4,
  });

  // Stats row
  const stats = [
    ["100", "Villages Ranked"],
    ["5,150", "Villages Analysed"],
    ["5", "Satellite Signals"],
    ["20", "States Covered"],
  ];
  stats.forEach(([num, label], i) => {
    const x = 0.7 + i * 2.9;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 5.0, w: 2.5, h: 1.8, fill: { color: "1E293B" },
      line: { color: "334155", width: 1 }, shadow: makeShadow(),
    });
    s.addText(num, {
      x, y: 5.1, w: 2.5, h: 0.8, fontSize: 32, color: C.white,
      fontFace: "Georgia", align: "center",
    });
    s.addText(label, {
      x, y: 5.85, w: 2.5, h: 0.4, fontSize: 9, color: "64748B",
      align: "center", charSpacing: 0.5,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Data Sources & Methodology
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  s.addText("Data Sources & Methodology", {
    x: 0.5, y: 0.35, w: 12.3, h: 0.55, fontSize: 26, color: C.ink,
    fontFace: "Georgia", bold: false,
  });
  s.addText("What we measured · How we measured it · Why each signal matters", {
    x: 0.5, y: 0.9, w: 10, h: 0.35, fontSize: 11, color: C.muted,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.3, w: 12.3, h: 0.04, fill: { color: C.border }, line: { color: C.border },
  });

  // Data source cards
  const sources = [
    {
      icon: "🛰", title: "VIIRS Nighttime Lights", weight: "30%",
      color: C.ntl, label: "NTL Growth",
      desc: "VIIRS-DNB annual composites (2019–2024). Absolute & relative change in radiance signals electrification, commercial activity & manufacturing.",
      cite: "Source: NASA Black Marble / SHRUG ntl_village_features.csv",
    },
    {
      icon: "🏗", title: "NDBI Built-Up Index", weight: "25%",
      color: C.build, label: "Built-Up",
      desc: "Sentinel-2 derived NDBI tiles 2020 & 2025 (4 tiles each). Delta in built-up index proxies construction investment & peri-urban expansion.",
      cite: "Source: builtup_village_features.csv / ndbi_*.tif",
    },
    {
      icon: "🌾", title: "NDVI Agricultural Index", weight: "15%",
      color: C.agri, label: "Agri",
      desc: "MODIS/Sentinel NDVI annual mean 2025 + growth trend raster. Positive trend signals agricultural intensification, irrigation expansion, income growth.",
      cite: "Source: ndvi_village_features.csv / ndvi_growth_trend_india.tif",
    },
    {
      icon: "🛣", title: "PMGSY Road Connectivity", weight: "15%",
      color: C.road, label: "Roads",
      desc: "Pradhan Mantri Gram Sadak Yojana construction records. Road type (Kutcha/WBM/Black-Top), connectivity status & distance to nearest town.",
      cite: "Source: SHRUG shrug-pmgsy-csv",
    },
    {
      icon: "📡", title: "Digital & Market Integration", weight: "15%",
      color: "8B5CF6", label: "Digital",
      desc: "Telecom tower presence + distance to urban centre. Proxies access to digital payments, e-commerce & price discovery — emerging rural drivers.",
      cite: "Source: Antyodaya poverty scores + SHRUG census data",
    },
  ];

  sources.forEach((src, i) => {
    const col = i < 3 ? i : i - 3;
    const row = i < 3 ? 0 : 1;
    const x = 0.5 + col * 4.1;
    const y = i < 3 ? 1.5 : 4.1;
    const w = i < 3 ? 3.9 : 5.9;
    const h = 2.4;

    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w, h, fill: { color: C.white },
      line: { color: C.border, width: 1 }, shadow: makeShadow(),
    });
    // Color top accent
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w, h: 0.05, fill: { color: src.color }, line: { color: src.color },
    });
    // Weight badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + w - 1.0, y: y + 0.15, w: 0.85, h: 0.28,
      fill: { color: src.color, transparency: 80 }, line: { color: src.color }, rectRadius: 0.03,
    });
    s.addText(`Wt: ${src.weight}`, {
      x: x + w - 1.0, y: y + 0.15, w: 0.85, h: 0.28,
      fontSize: 7, color: src.color, align: "center", valign: "middle", bold: true,
    });
    s.addText(`${src.icon}  ${src.title}`, {
      x: x + 0.15, y: y + 0.25, w: w - 1.2, h: 0.38,
      fontSize: 11, color: C.ink, bold: true,
    });
    s.addText(src.desc, {
      x: x + 0.15, y: y + 0.65, w: w - 0.3, h: 1.2,
      fontSize: 8.5, color: C.mid, lineSpacingMultiple: 1.4, wrap: true,
    });
    s.addText(src.cite, {
      x: x + 0.15, y: y + 1.95, w: w - 0.3, h: 0.35,
      fontSize: 6.5, color: C.muted, italic: true,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — Scoring Framework
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 1.2, fill: { color: C.dark }, line: { color: C.dark },
  });
  s.addText("Composite Growth Score Framework", {
    x: 0.5, y: 0.1, w: 10, h: 0.55, fontSize: 26, color: C.white, fontFace: "Georgia",
  });
  s.addText("How we define & measure 'economic growth'", {
    x: 0.5, y: 0.65, w: 10, h: 0.38, fontSize: 11, color: "94A3B8",
  });

  // Formula box
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.4, w: 12.3, h: 0.7,
    fill: { color: "EFF6FF" }, line: { color: "BFDBFE", width: 1.5 },
  });
  s.addText("CGS = 0.30×NTL_norm + 0.25×BuiltUp_norm + 0.15×NDVI_norm + 0.15×Road_norm + 0.15×Digital_norm   →   Percentile 0–100", {
    x: 0.5, y: 1.4, w: 12.3, h: 0.7,
    fontSize: 11, color: C.accent, align: "center", valign: "middle",
    fontFace: "Consolas", bold: true,
  });

  // Signal weight bars
  const sigs = [
    ["VIIRS NTL Growth",      0.30, C.ntl,   "Electricity & commercial activity"],
    ["NDBI Expansion",        0.25, C.build,  "Construction & urban investment"],
    ["NDVI Agri Trend",       0.15, C.agri,   "Farm productivity & irrigation"],
    ["Road Connectivity",     0.15, C.road,   "Market access & trade integration"],
    ["Digital Integration",   0.15, "8B5CF6", "Telecom, e-commerce, price discovery"],
  ];

  s.addText("Signal Weights", {
    x: 0.5, y: 2.3, w: 5.5, h: 0.35, fontSize: 9,
    color: C.muted, bold: true, charSpacing: 1, textTransform: "uppercase",
  });

  sigs.forEach(([label, weight, color, desc], i) => {
    const y = 2.7 + i * 0.75;
    const barW = weight * 8.0; // scale
    s.addText(label, { x: 0.5, y, w: 2.5, h: 0.38, fontSize: 10, color: C.ink, bold: true });
    s.addText(desc,  { x: 3.1, y, w: 4.0, h: 0.38, fontSize: 9,  color: C.muted });
    // Bar background
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.2, y: y + 0.1, w: 5.0, h: 0.2,
      fill: { color: C.border }, line: { color: C.border },
    });
    // Bar fill
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.2, y: y + 0.1, w: barW, h: 0.2,
      fill: { color }, line: { color },
    });
    // Pct label
    s.addText(`${(weight * 100).toFixed(0)}%`, {
      x: 7.2 + barW + 0.1, y, w: 0.5, h: 0.38,
      fontSize: 10, color, bold: true,
    });
  });

  // Normalization note
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 6.5, w: 12.3, h: 0.75,
    fill: { color: "F0FDF4" }, line: { color: "A7F3D0", width: 1 },
  });
  s.addText([
    { text: "Normalization: ", options: { bold: true, color: "065F46" } },
    { text: "Each signal is Winsorized at 1–99th percentile, then MinMax scaled to 0–1. Final CGS is converted to a percentile rank (0–100) across all villages analysed. This approach captures RELATIVE GROWTH, not absolute wealth levels — ensuring emerging villages are fairly ranked against already-developed ones.", options: { color: "047857" } },
  ], { x: 0.5, y: 6.5, w: 12.3, h: 0.75, fontSize: 9, valign: "middle", margin: 10 });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Key Findings
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  s.addText("Key Findings", {
    x: 0.5, y: 0.3, w: 10, h: 0.6, fontSize: 30, color: C.ink, fontFace: "Georgia",
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.95, w: 12.3, h: 0.04, fill: { color: C.border }, line: { color: C.border },
  });

  // Stat callouts
  const stats = [
    { val: "+136%", label: "Avg. built-up area growth", sub: "vs 18% national avg", color: C.build },
    { val: "10.1 nW", label: "Avg. NTL absolute gain", sub: "7.2× national median", color: C.ntl },
    { val: "93%", label: "Road-connected (top 100)", sub: "vs 58% national avg", color: C.road },
    { val: "36", label: "NTL-led villages", sub: "largest single driver", color: "8B5CF6" },
  ];
  stats.forEach((st, i) => {
    const x = 0.5 + i * 3.1;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.1, w: 2.9, h: 1.6, fill: { color: C.white },
      line: { color: C.border }, shadow: makeShadow(),
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.1, w: 2.9, h: 0.05, fill: { color: st.color }, line: { color: st.color },
    });
    s.addText(st.val, {
      x, y: 1.25, w: 2.9, h: 0.65, fontSize: 28, color: st.color,
      fontFace: "Georgia", align: "center",
    });
    s.addText(st.label, {
      x, y: 1.88, w: 2.9, h: 0.32, fontSize: 9, color: C.ink,
      align: "center", bold: true,
    });
    s.addText(st.sub, {
      x, y: 2.2, w: 2.9, h: 0.28, fontSize: 8, color: C.muted, align: "center",
    });
  });

  // Top 10 table
  s.addText("TOP 10 VILLAGES", {
    x: 0.5, y: 2.95, w: 6.5, h: 0.3, fontSize: 8, color: C.muted,
    bold: true, charSpacing: 1,
  });

  const top10 = [
    [1, "HA010125", "Haryana",       "100.0", "NTL-Led"],
    [2, "TE030114", "Telangana",     "99.98", "NTL-Led"],
    [3, "UT130134", "Uttar Pradesh", "99.96", "Built-Up"],
    [4, "BI210215", "Bihar",         "99.94", "Built-Up"],
    [5, "BI030204", "Bihar",         "99.92", "Built-Up"],
    [6, "HA230044", "Haryana",       "99.90", "NTL-Led"],
    [7, "KA170009", "Karnataka",     "99.88", "Built-Up"],
    [8, "KA130026", "Karnataka",     "99.86", "Built-Up"],
    [9, "UT050241", "Uttar Pradesh", "99.84", "NTL-Led"],
    [10,"GU020282", "Gujarat",       "99.83", "Built-Up"],
  ];

  const headers = [["Rank","ID","State","Score","Driver"]];
  const rows = top10.map(([rank, id, state, score, driver]) => [
    { text: String(rank), options: { bold: true, color: C.accent, align: "center" } },
    { text: id, options: { fontFace: "Consolas", fontSize: 8 } },
    { text: state },
    { text: score, options: { bold: true, color: C.accent2, align: "center" } },
    { text: driver, options: { italic: true } },
  ]);

  s.addTable([
    headers[0].map(h => ({ text: h, options: {
      bold: true, fill: { color: C.dark }, color: C.white, fontSize: 8, align: "center"
    }})),
    ...rows
  ], {
    x: 0.5, y: 3.25, w: 6.5, h: 3.7,
    colW: [0.5, 1.2, 1.8, 0.9, 2.1],
    border: { pt: 0.5, color: C.border },
    fill: { color: C.white },
    fontSize: 9,
  });

  // Driver breakdown right panel
  s.addText("GROWTH DRIVER BREAKDOWN", {
    x: 7.4, y: 2.95, w: 5.4, h: 0.3, fontSize: 8, color: C.muted, bold: true, charSpacing: 1,
  });

  const drivers = [
    ["⚡ NTL-Led (Electrification)", 36, C.ntl],
    ["🏗 Construction Boom",         28, C.build],
    ["🛣 Road-Driven Growth",        24, C.road],
    ["🌾 Agricultural Growth",       12, C.agri],
  ];
  drivers.forEach(([label, n, color], i) => {
    const y = 3.35 + i * 1.0;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.4, y, w: 5.4, h: 0.75,
      fill: { color: C.white }, line: { color: C.border }, shadow: makeShadow(),
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.4, y, w: 0.08, h: 0.75, fill: { color }, line: { color },
    });
    s.addText(label, {
      x: 7.65, y: y + 0.05, w: 3.8, h: 0.35, fontSize: 10, color: C.ink, bold: true,
    });
    // mini bar
    const pct = n / 100;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.65, y: y + 0.45, w: 3.5, h: 0.14, fill: { color: C.border }, line: { color: C.border },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.65, y: y + 0.45, w: 3.5 * pct, h: 0.14, fill: { color }, line: { color },
    });
    s.addText(`${n}%`, {
      x: 11.25, y: y + 0.38, w: 0.5, h: 0.3, fontSize: 9, color, bold: true,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Geographic Insights + State Breakdown
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.3, h: 0.9, fill: { color: "1E293B" }, line: { color: "1E293B" },
  });
  s.addText("Geographic & State-Level Insights", {
    x: 0.5, y: 0.05, w: 10, h: 0.5, fontSize: 24, color: C.white, fontFace: "Georgia",
  });
  s.addText("Where is growth concentrated · Pattern analysis", {
    x: 0.5, y: 0.55, w: 10, h: 0.28, fontSize: 10, color: "94A3B8",
  });

  // State bar chart data
  const states = [
    ["Uttar Pradesh", 10], ["Bihar", 9], ["Karnataka", 9], ["Tamil Nadu", 9],
    ["Madhya Pradesh", 7], ["Rajasthan", 7], ["Telangana", 6], ["West Bengal", 5],
    ["Uttarakhand", 5], ["Andhra Pradesh", 5],
  ];
  s.addText("Top States by Village Count", {
    x: 0.5, y: 1.05, w: 6.5, h: 0.3, fontSize: 8, color: C.muted, bold: true, charSpacing: 1,
  });
  states.forEach(([state, count], i) => {
    const y = 1.4 + i * 0.52;
    const barW = (count / 10) * 4.5;
    s.addText(state.replace(" Pradesh","").replace("Uttar","UP").replace("Madhya","MP"), {
      x: 0.5, y, w: 1.8, h: 0.38, fontSize: 9, color: C.ink,
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 2.4, y: y + 0.08, w: 4.5, h: 0.22, fill: { color: C.border }, line: { color: C.border },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 2.4, y: y + 0.08, w: barW, h: 0.22, fill: { color: C.accent }, line: { color: C.accent },
    });
    s.addText(String(count), {
      x: 7.0, y, w: 0.4, h: 0.38, fontSize: 9, color: C.accent, bold: true,
    });
  });

  // Findings panel on right
  const findings = [
    {
      title: "Indo-Gangetic Plain Dominance",
      body: "UP + Bihar alone contribute 19% of top 100, reflecting rapid electrification under Saubhagya scheme and PMGSY road expansion in underserved belt.",
      color: C.accent,
    },
    {
      title: "Southern Tech Corridor",
      body: "Karnataka + Telangana + Tamil Nadu show strong construction-boom signals around peri-urban growth corridors near Tier-2 cities.",
      color: "8B5CF6",
    },
    {
      title: "Agricultural Pockets in Rajasthan",
      body: "Rajasthan villages show NDVI-led scores, consistent with drip irrigation expansion and water harvesting programs boosting farm productivity.",
      color: C.agri,
    },
    {
      title: "Himalayan Foothills (Uttarakhand)",
      body: "Uttarakhand villages rank high on road + digital scores, suggesting tourism-linked economic growth and improving mountain connectivity.",
      color: C.ntl,
    },
  ];

  s.addText("Regional Patterns", {
    x: 7.5, y: 1.05, w: 5.3, h: 0.3, fontSize: 8, color: C.muted, bold: true, charSpacing: 1,
  });

  findings.forEach((f, i) => {
    const y = 1.4 + i * 1.45;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.5, y, w: 5.3, h: 1.3, fill: { color: C.bg },
      line: { color: C.border }, shadow: makeShadow(),
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.5, y, w: 0.07, h: 1.3, fill: { color: f.color }, line: { color: f.color },
    });
    s.addText(f.title, {
      x: 7.72, y: y + 0.1, w: 4.9, h: 0.3, fontSize: 10, color: C.ink, bold: true,
    });
    s.addText(f.body, {
      x: 7.72, y: y + 0.43, w: 4.9, h: 0.75,
      fontSize: 8.5, color: C.mid, lineSpacingMultiple: 1.4, wrap: true,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 6 — Limitations & Caveats
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  s.addText("Limitations & What We'd Do Next", {
    x: 0.5, y: 0.3, w: 12.3, h: 0.6, fontSize: 28, color: C.ink, fontFace: "Georgia",
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.95, w: 12.3, h: 0.04, fill: { color: C.border }, line: { color: C.border },
  });

  const limits = [
    {
      n: "01", title: "Correlation ≠ Causation",
      body: "Satellite signals are proxies. NTL growth could reflect street lighting rather than economic activity. NDBI growth might be roads, not buildings. Ground-truth validation with census consumption data is essential.",
      color: C.build,
    },
    {
      n: "02", title: "Village Boundary Misalignment",
      body: "SHRUG PC11 village polygons (2011 census) may not reflect current administrative boundaries. Raster extraction zonal statistics can suffer from boundary drift, especially in fast-growing peri-urban areas.",
      color: C.ntl,
    },
    {
      n: "03", title: "Temporal Inconsistency",
      body: "NDBI tiles span 2020–2025 while NTL spans 2019–2024. Seasonal effects and cloud contamination in monsoon months can bias NDVI and NDBI values despite annual compositing.",
      color: C.road,
    },
    {
      n: "04", title: "Equal Weights Assumption",
      body: "Signal weights (30/25/15/15/15) are expert-defined. Optimal weights vary by agro-climatic zone. A machine-learning calibration against SECC consumption data would improve accuracy significantly.",
      color: "8B5CF6",
    },
  ];

  limits.forEach((l, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 6.4;
    const y = 1.15 + row * 2.0;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 6.1, h: 1.8, fill: { color: C.white },
      line: { color: C.border }, shadow: makeShadow(),
    });
    s.addText(l.n, {
      x: x + 0.15, y: y + 0.1, w: 0.5, h: 0.5, fontSize: 20,
      color: l.color, fontFace: "Georgia",
    });
    s.addText(l.title, {
      x: x + 0.65, y: y + 0.12, w: 5.3, h: 0.38, fontSize: 11, color: C.ink, bold: true,
    });
    s.addText(l.body, {
      x: x + 0.15, y: y + 0.55, w: 5.8, h: 1.1,
      fontSize: 8.5, color: C.mid, lineSpacingMultiple: 1.4, wrap: true,
    });
  });

  // Next steps
  s.addText("With More Time / Data", {
    x: 0.5, y: 5.3, w: 12.3, h: 0.3, fontSize: 8, color: C.muted, bold: true, charSpacing: 1,
  });
  const nexts = [
    "Ground-truth vs SECC consumption data",
    "ML-calibrated signal weights by zone",
    "Add mobile payments & MSME density",
    "Annual time-series animation",
  ];
  nexts.forEach((t, i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5 + i * 3.2, y: 5.65, w: 3.0, h: 0.65,
      fill: { color: "EFF6FF" }, line: { color: "BFDBFE" }, rectRadius: 0.05,
    });
    s.addText(`→ ${t}`, {
      x: 0.5 + i * 3.2, y: 5.65, w: 3.0, h: 0.65,
      fontSize: 8.5, color: C.accent, align: "center", valign: "middle", bold: true,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 7 — Closing / Impact
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.ink };

  s.addShape(pres.shapes.OVAL, {
    x: 8.5, y: -2, w: 9, h: 9,
    fill: { color: "1E3A5F" }, line: { color: "1E3A5F" },
  });

  s.addText("Economic Growth is", {
    x: 0.7, y: 1.2, w: 9, h: 0.7, fontSize: 36, color: "94A3B8", fontFace: "Georgia",
  });
  s.addText("No Longer Invisible", {
    x: 0.7, y: 1.85, w: 9, h: 0.85, fontSize: 44, color: C.white, fontFace: "Georgia",
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.7, y: 2.8, w: 2.5, h: 0.05, fill: { color: "6366F1" }, line: { color: "6366F1" },
  });

  s.addText("Satellite data gives us a 5-year, village-level economic\nradar across 640,000+ settlements — continuously updating,\nno survey required, and reproducible at scale.", {
    x: 0.7, y: 3.0, w: 7.5, h: 1.1, fontSize: 13, color: "94A3B8",
    fontFace: "Calibri", lineSpacingMultiple: 1.5,
  });

  // Use cases
  const uses = [
    ["🎯", "Target investment", "Identify villages at inflection point before mainstream capital arrives"],
    ["📊", "Policy monitoring", "Track impact of PMGSY, Saubhagya, MGNREGS across geographies"],
    ["🔮", "Predictive alerts", "Flag villages likely to cross urbanisation threshold in next 3 years"],
  ];
  uses.forEach((u, i) => {
    const y = 4.3 + i * 0.8;
    s.addText(u[0], { x: 0.7, y, w: 0.4, h: 0.5, fontSize: 16 });
    s.addText(u[1], { x: 1.2, y, w: 2.2, h: 0.32, fontSize: 10, color: C.white, bold: true });
    s.addText(u[2], { x: 1.2, y: y + 0.3, w: 6, h: 0.38, fontSize: 9, color: "64748B" });
  });

  s.addText("Kritter Software Technologies · Village Economic Growth Intelligence · 2024", {
    x: 0.7, y: 7.1, w: 12, h: 0.28, fontSize: 7.5, color: "334155",
  });
}

// ── Write file ─────────────────────────────────────────────────────────────
pres.writeFile({ fileName: outputFile })
  .then(() => console.log("✓ Presentation saved"))
  .catch(e => { console.error(e); process.exit(1); });
