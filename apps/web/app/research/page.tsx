"use client";

import { Header } from "@/components/layout/Header";
import { fetchOrbitalObservations } from "@/lib/dataClient";
import {
  CHEMICAL_COMPONENTS,
  ChemicalComponentKey,
  OrbitalObservationCell,
} from "@lunar-atlas/scientific-types";
import {
  BarChart2,
  Database,
  Download,
  FlaskConical,
  TrendingUp,
  Triangle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type ResearchTab = "bivariate" | "ternary";
export type TernarySystem = "fe_ti_al" | "mafic_plag_ca";

export default function ResearchLabPage() {
  const [cells, setCells] = useState<OrbitalObservationCell[]>([]);
  const [activeTab, setActiveTab] = useState<ResearchTab>("bivariate");
  const [xAxis, setXAxis] = useState<ChemicalComponentKey>("fe_o");
  const [yAxis, setYAxis] = useState<ChemicalComponentKey>("al2_o3");
  const [ternarySystem, setTernarySystem] = useState<TernarySystem>("fe_ti_al");
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchOrbitalObservations();
      setCells(data);
    }
    load();
  }, []);

  // Compute Pearson Correlation r between selected X and Y components
  const { pearsonR, sampleCount } = useMemo(() => {
    if (cells.length === 0) return { pearsonR: 0, sampleCount: 0 };
    const xs = cells.map((c) => c.abundances[xAxis]);
    const ys = cells.map((c) => c.abundances[yAxis]);
    const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;

    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let i = 0; i < xs.length; i++) {
      const dx = xs[i] - meanX;
      const dy = ys[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const r = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0;
    return { pearsonR: r, sampleCount: cells.length };
  }, [cells, xAxis, yAxis]);

  // Downsample cells for clean SVG scatter plot rendering
  const scatterPoints = useMemo(
    () => cells.filter((_, idx) => idx % 2 === 0),
    [cells],
  );

  const xMeta = CHEMICAL_COMPONENTS[xAxis];
  const yMeta = CHEMICAL_COMPONENTS[yAxis];

  // Scatter SVG Chart Dimensions
  const chartW = 600;
  const chartH = 360;
  const pad = 50;

  // Ternary Chart Geometry
  const tWidth = 540;
  const tHeight = 440;
  const tPad = 40;
  const topVertex = { x: tWidth / 2, y: tPad };
  const leftVertex = { x: tPad + 20, y: tHeight - tPad - 20 };
  const rightVertex = { x: tWidth - tPad - 20, y: tHeight - tPad - 20 };

  // Calculate ternary points
  const ternaryPoints = useMemo(() => {
    return scatterPoints.map((c) => {
      let a = 0;
      let b = 0;
      let d = 0;

      if (ternarySystem === "fe_ti_al") {
        // A: FeO (Top), B: Al2O3 (Bottom-Left), C: TiO2*3 (Bottom-Right, scaled for visibility)
        a = c.abundances.fe_o;
        b = c.abundances.al2_o3;
        d = c.abundances.ti_o2 * 2.5; // scaled factor for geochemical spread
      } else {
        // A: (FeO + MgO) (Top, Mafic), B: Al2O3 (Bottom-Left, Plagioclase), C: CaO (Bottom-Right)
        a = c.abundances.fe_o + c.abundances.mg_o;
        b = c.abundances.al2_o3;
        d = c.abundances.ca_o;
      }

      const sum = a + b + d;
      const fA = sum > 0 ? a / sum : 0.33;
      const fB = sum > 0 ? b / sum : 0.33;
      const fC = sum > 0 ? d / sum : 0.33;

      // Barycentric projection to 2D Cartesian
      const px = fA * topVertex.x + fB * leftVertex.x + fC * rightVertex.x;
      const py = fA * topVertex.y + fB * leftVertex.y + fC * rightVertex.y;

      return {
        pixelId: c.pixelId,
        centerLat: c.centerLat,
        centerLon: c.centerLon,
        px,
        py,
        fA,
        fB,
        fC,
        valA: a,
        valB: b,
        valC: d,
      };
    });
  }, [
    scatterPoints,
    ternarySystem,
    topVertex.x,
    topVertex.y,
    leftVertex.x,
    leftVertex.y,
    rightVertex.x,
    rightVertex.y,
  ]);

  // Export full observations as CSV or JSON
  const exportData = (format: "json" | "csv") => {
    if (format === "json") {
      const payload = {
        metadata: {
          product: "Lunar Atlas Scientific Export",
          release: "LUNAR-ATLAS-2026.1",
          source: "Lunar Prospector GRS Level 5 (Prettyman et al. 2006)",
          coordinateReference: "Planetocentric, East-Positive",
          meanLunarRadiusKm: 1737.4,
          timestamp: new Date().toISOString(),
        },
        observations: cells,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lunar_atlas_grs_observations_${Date.now()}.json`;
      a.click();
    } else {
      let csv =
        "pixel_id,lat_min,lat_max,lon_min,lon_max,center_lat,center_lon,area_km2,th_ppm,fe_o_wt_pct,ti_o2_wt_pct,al2_o3_wt_pct,mg_o_wt_pct,k_ppm,u_ppm\n";
      for (const c of cells) {
        csv += `${c.pixelId},${c.latMin},${c.latMax},${c.lonMin},${c.lonMax},${c.centerLat},${c.centerLon},${c.areaKm2},${c.abundances.th},${c.abundances.fe_o},${c.abundances.ti_o2},${c.abundances.al2_o3},${c.abundances.mg_o},${c.abundances.k},${c.abundances.u}\n`;
      }
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lunar_atlas_grs_observations_${Date.now()}.csv`;
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col select-none">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Hero */}
        <div className="flex flex-col gap-2 border-b border-[#252A33] pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#60C9D2] uppercase tracking-wider font-semibold">
            <FlaskConical className="w-4 h-4" />
            <span>Research Laboratory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F2F4]">
            Planetary Geochemical Analytics
          </h1>
          <p className="text-sm text-[#929AA7] max-w-3xl leading-relaxed">
            Multi-element correlations, bivariate scatter plots, and ternary
            petrogenetic diagrams. Investigate anti-correlations between
            anorthosite crust (Al₂O₃) and basaltic mantle melts (FeO), trace
            KREEP co-enrichment (Th vs. K), and export verified scientific data
            products.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-[#252A33] pb-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab("bivariate")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "bivariate"
                ? "bg-[#171B21] text-[#60C9D2] border border-[#60C9D2]/40 font-semibold"
                : "text-[#929AA7] hover:text-[#F1F2F4]"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Bivariate Scatter Plots</span>
          </button>
          <button
            onClick={() => setActiveTab("ternary")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "ternary"
                ? "bg-[#171B21] text-[#D9B674] border border-[#D9B674]/40 font-semibold"
                : "text-[#929AA7] hover:text-[#F1F2F4]"
            }`}
          >
            <Triangle className="w-3.5 h-3.5" />
            <span>Ternary Rock-Suite Discrimination</span>
          </button>
        </div>

        {activeTab === "bivariate" ? (
          /* Bivariate Scatter Plot Suite */
          <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A33] pb-4">
              <div>
                <h2 className="text-base font-bold font-mono text-[#F1F2F4]">
                  Bivariate Element Correlation
                </h2>
                <p className="text-xs text-[#929AA7] mt-0.5">
                  Observed planetary distributions across 1,652 equal-area
                  measurement cells.
                </p>
              </div>

              {/* Quick Pairs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setXAxis("fe_o");
                    setYAxis("al2_o3");
                  }}
                  className="px-2.5 py-1 rounded bg-[#171B21] border border-[#252A33] text-[11px] font-mono text-[#929AA7] hover:text-[#F1F2F4]"
                >
                  FeO vs. Al₂O₃
                </button>
                <button
                  onClick={() => {
                    setXAxis("th");
                    setYAxis("k");
                  }}
                  className="px-2.5 py-1 rounded bg-[#171B21] border border-[#252A33] text-[11px] font-mono text-[#929AA7] hover:text-[#F1F2F4]"
                >
                  Th vs. K
                </button>
                <button
                  onClick={() => {
                    setXAxis("fe_o");
                    setYAxis("ti_o2");
                  }}
                  className="px-2.5 py-1 rounded bg-[#171B21] border border-[#252A33] text-[11px] font-mono text-[#929AA7] hover:text-[#F1F2F4]"
                >
                  FeO vs. TiO₂
                </button>
              </div>
            </div>

            {/* Axes Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-[#60C9D2] uppercase">
                  X-Axis Variable:
                </label>
                <select
                  value={xAxis}
                  onChange={(e) =>
                    setXAxis(e.target.value as ChemicalComponentKey)
                  }
                  className="bg-[#090B0E] border border-[#252A33] rounded-lg px-3 py-2 text-xs font-mono text-[#F1F2F4] focus:outline-none focus:border-[#60C9D2]"
                >
                  {Object.entries(CHEMICAL_COMPONENTS).map(([k, info]) => (
                    <option key={k} value={k}>
                      {info.formula} — {info.name} ({info.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-[#A599ED] uppercase">
                  Y-Axis Variable:
                </label>
                <select
                  value={yAxis}
                  onChange={(e) =>
                    setYAxis(e.target.value as ChemicalComponentKey)
                  }
                  className="bg-[#090B0E] border border-[#252A33] rounded-lg px-3 py-2 text-xs font-mono text-[#F1F2F4] focus:outline-none focus:border-[#A599ED]"
                >
                  {Object.entries(CHEMICAL_COMPONENTS).map(([k, info]) => (
                    <option key={k} value={k}>
                      {info.formula} — {info.name} ({info.unit})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SVG Scientific Scatter Plot */}
            <div className="w-full flex flex-col items-center justify-center p-3 bg-[#090B0E] border border-[#252A33] rounded-xl overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full max-w-2xl h-auto overflow-visible select-none"
              >
                {/* Axes lines */}
                <line
                  x1={pad}
                  y1={chartH - pad}
                  x2={chartW - pad}
                  y2={chartH - pad}
                  stroke="#252A33"
                  strokeWidth="1.5"
                />
                <line
                  x1={pad}
                  y1={pad}
                  x2={pad}
                  y2={chartH - pad}
                  stroke="#252A33"
                  strokeWidth="1.5"
                />

                {/* Gridlines & Numeric Ticks */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                  const xVal =
                    xMeta.minValid + frac * (xMeta.maxValid - xMeta.minValid);
                  const yVal =
                    yMeta.minValid + frac * (yMeta.maxValid - yMeta.minValid);
                  const gx = pad + frac * (chartW - 2 * pad);
                  const gy = chartH - pad - frac * (chartH - 2 * pad);

                  return (
                    <g key={frac}>
                      <line
                        x1={pad}
                        y1={gy}
                        x2={chartW - pad}
                        y2={gy}
                        stroke="#1c2129"
                        strokeWidth="1"
                        strokeDasharray={
                          frac === 0 || frac === 1 ? "none" : "3 3"
                        }
                      />
                      <text
                        x={pad - 8}
                        y={gy + 3}
                        textAnchor="end"
                        fill="#626B78"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {yAxis === "k" ? Math.round(yVal) : yVal.toFixed(1)}
                      </text>

                      <line
                        x1={gx}
                        y1={pad}
                        x2={gx}
                        y2={chartH - pad}
                        stroke="#1c2129"
                        strokeWidth="1"
                        strokeDasharray={
                          frac === 0 || frac === 1 ? "none" : "3 3"
                        }
                      />
                      <text
                        x={gx}
                        y={chartH - pad + 15}
                        textAnchor="middle"
                        fill="#626B78"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {xAxis === "k" ? Math.round(xVal) : xVal.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Data points */}
                {scatterPoints.map((c) => {
                  const xVal = c.abundances[xAxis];
                  const yVal = c.abundances[yAxis];
                  const nx =
                    (xVal - xMeta.minValid) / (xMeta.maxValid - xMeta.minValid);
                  const ny =
                    (yVal - yMeta.minValid) / (yMeta.maxValid - yMeta.minValid);
                  const cx =
                    pad + Math.max(0, Math.min(1, nx)) * (chartW - 2 * pad);
                  const cy =
                    chartH -
                    pad -
                    Math.max(0, Math.min(1, ny)) * (chartH - 2 * pad);

                  return (
                    <circle
                      key={c.pixelId}
                      cx={cx}
                      cy={cy}
                      r={2.5}
                      fill="#60C9D2"
                      opacity={0.65}
                      className="hover:r-4 hover:fill-[#D9B674] transition-all cursor-pointer"
                    >
                      <title>{`Pixel #${c.pixelId} (${c.centerLat}°, ${c.centerLon}°): ${xMeta.formula}=${xVal}, ${yMeta.formula}=${yVal}`}</title>
                    </circle>
                  );
                })}

                {/* Axis labels */}
                <text
                  x={chartW / 2}
                  y={chartH - 12}
                  textAnchor="middle"
                  fill="#929AA7"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {xMeta.formula} ({xMeta.unit})
                </text>
                <text
                  x={18}
                  y={chartH / 2}
                  textAnchor="middle"
                  transform={`rotate(-90, 18, ${chartH / 2})`}
                  fill="#929AA7"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {yMeta.formula} ({yMeta.unit})
                </text>
              </svg>

              {/* Correlation stat badge */}
              <div className="mt-4 flex items-center justify-between w-full max-w-2xl px-2 text-xs font-mono text-[#929AA7]">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#60C9D2]" />
                  <span>
                    Pearson Correlation (r):{" "}
                    <strong
                      className={
                        pearsonR < 0 ? "text-[#A599ED]" : "text-[#60C9D2]"
                      }
                    >
                      {pearsonR.toFixed(3)}
                    </strong>
                  </span>
                </div>
                <span>Sample Points: {sampleCount.toLocaleString()} cells</span>
              </div>
            </div>
          </div>
        ) : (
          /* Ternary Diagram Suite */
          <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A33] pb-4">
              <div>
                <h2 className="text-base font-bold font-mono text-[#F1F2F4]">
                  Ternary Geochemical Petrogenesis
                </h2>
                <p className="text-xs text-[#929AA7] mt-0.5">
                  Barycentric compositional projection separating mafic mare
                  basalts, feldspathic anorthosite, and refractory titaniferous
                  cumulates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTernarySystem("fe_ti_al")}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    ternarySystem === "fe_ti_al"
                      ? "bg-[#171B21] text-[#D9B674] border border-[#D9B674]/40 font-semibold"
                      : "text-[#929AA7] border border-[#252A33]"
                  }`}
                >
                  FeO - Al₂O₃ - TiO₂
                </button>
                <button
                  onClick={() => setTernarySystem("mafic_plag_ca")}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    ternarySystem === "mafic_plag_ca"
                      ? "bg-[#171B21] text-[#D9B674] border border-[#D9B674]/40 font-semibold"
                      : "text-[#929AA7] border border-[#252A33]"
                  }`}
                >
                  (FeO+MgO) - Al₂O₃ - CaO
                </button>
              </div>
            </div>

            {/* Ternary SVG Canvas */}
            <div className="w-full flex flex-col items-center justify-center p-4 bg-[#090B0E] border border-[#252A33] rounded-xl">
              <svg
                viewBox={`0 0 ${tWidth} ${tHeight}`}
                className="w-full max-w-lg h-auto overflow-visible select-none"
              >
                {/* Triangular Outer Boundary */}
                <polygon
                  points={`${topVertex.x},${topVertex.y} ${leftVertex.x},${leftVertex.y} ${rightVertex.x},${rightVertex.y}`}
                  fill="#101318"
                  stroke="#252A33"
                  strokeWidth="2"
                />

                {/* Interior grid lines (20%, 40%, 60%, 80%) */}
                {[0.2, 0.4, 0.6, 0.8].map((f) => {
                  // Parallel to bottom (constant A)
                  const pA1 = {
                    x: (1 - f) * topVertex.x + f * leftVertex.x,
                    y: (1 - f) * topVertex.y + f * leftVertex.y,
                  };
                  const pA2 = {
                    x: (1 - f) * topVertex.x + f * rightVertex.x,
                    y: (1 - f) * topVertex.y + f * rightVertex.y,
                  };

                  return (
                    <line
                      key={f}
                      x1={pA1.x}
                      y1={pA1.y}
                      x2={pA2.x}
                      y2={pA2.y}
                      stroke="#1c2129"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  );
                })}

                {/* Vertex Labels */}
                <text
                  x={topVertex.x}
                  y={topVertex.y - 12}
                  textAnchor="middle"
                  fill="#D9B674"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {ternarySystem === "fe_ti_al"
                    ? "FeO (wt%) [Mare Mafics]"
                    : "(FeO + MgO) [Total Mafic]"}
                </text>
                <text
                  x={leftVertex.x - 10}
                  y={leftVertex.y + 16}
                  textAnchor="start"
                  fill="#60C9D2"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  Al₂O₃ (wt%) [Anorthosite]
                </text>
                <text
                  x={rightVertex.x + 10}
                  y={rightVertex.y + 16}
                  textAnchor="end"
                  fill="#A599ED"
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {ternarySystem === "fe_ti_al"
                    ? "TiO₂ (wt% × 2.5) [Ilmenite]"
                    : "CaO (wt%) [Plag/Cpx]"}
                </text>

                {/* Data Points */}
                {ternaryPoints.map((pt) => (
                  <circle
                    key={pt.pixelId}
                    cx={pt.px}
                    cy={pt.py}
                    r={2.5}
                    fill={
                      pt.fA > 0.45
                        ? "#D9B674"
                        : pt.fB > 0.5
                          ? "#60C9D2"
                          : "#A599ED"
                    }
                    opacity={0.7}
                    onMouseEnter={() =>
                      setHoveredPoint(
                        `Pixel #${pt.pixelId} (${pt.centerLat}°, ${pt.centerLon}°): A=${(pt.fA * 100).toFixed(1)}%, B=${(pt.fB * 100).toFixed(1)}%, C=${(pt.fC * 100).toFixed(1)}%`,
                      )
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="hover:r-4 transition-all cursor-pointer"
                  />
                ))}
              </svg>

              {/* Hover Caption */}
              <div className="mt-3 text-xs font-mono text-[#929AA7] h-5">
                {hoveredPoint ||
                  "Hover over any data point to inspect normalized barycentric proportions."}
              </div>
            </div>
          </div>
        )}

        {/* Export Data Suite */}
        <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#252A33] pb-3">
            <div>
              <h2 className="text-base font-bold font-mono text-[#F1F2F4] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#A9C9E8]" />
                <span>Scientific Data Export System</span>
              </h2>
              <p className="text-xs text-[#929AA7] mt-0.5">
                Export verified orbital observations and provenance metadata for
                offline research and GIS processing.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => exportData("csv")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#171B21] hover:bg-[#252A33] border border-[#252A33] hover:border-[#60C9D2] text-xs font-mono text-[#F1F2F4] transition-colors"
            >
              <Download className="w-4 h-4 text-[#60C9D2]" />
              <span>Export CSV (All 1,652 Equal-Area Cells)</span>
            </button>
            <button
              onClick={() => exportData("json")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#171B21] hover:bg-[#252A33] border border-[#252A33] hover:border-[#A599ED] text-xs font-mono text-[#F1F2F4] transition-colors"
            >
              <Download className="w-4 h-4 text-[#A599ED]" />
              <span>Export JSON (with Planetary Metadata)</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
