"use client";

import { Header } from "@/components/layout/Header";
import { fetchLunarRegions, fetchReturnedSamples } from "@/lib/dataClient";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { calculateMolarMgNumber } from "@lunar-atlas/lunar-geometry";
import {
  CHEMICAL_COMPONENTS,
  ChemicalComponentKey,
  LunarRegion,
  ReturnedSample,
} from "@lunar-atlas/scientific-types";
import { Scale, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ComparePage() {
  const comparedLocations = useObservatoryStore((s) => s.comparedLocations);
  const removeFromComparison = useObservatoryStore(
    (s) => s.removeFromComparison,
  );
  const clearComparison = useObservatoryStore((s) => s.clearComparison);

  const [regions, setRegions] = useState<LunarRegion[]>([]);
  const [samples, setSamples] = useState<ReturnedSample[]>([]);

  // Selection states for preset comparisons
  const [selectedRegionA, setSelectedRegionA] = useState<string>(
    "mare_tranquillitatis",
  );
  const [selectedRegionB, setSelectedRegionB] = useState<string>(
    "feldspathic_highlands_terrane",
  );

  useEffect(() => {
    async function load() {
      const [r, s] = await Promise.all([
        fetchLunarRegions(),
        fetchReturnedSamples(),
      ]);
      setRegions(r);
      setSamples(s);
    }
    load();
  }, []);

  const regA = regions.find((r) => r.id === selectedRegionA);
  const regB = regions.find((r) => r.id === selectedRegionB);

  const elementsToCompare: ChemicalComponentKey[] = [
    "th",
    "fe_o",
    "ti_o2",
    "al2_o3",
    "mg_o",
    "k",
  ];

  return (
    <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col select-none">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2 border-b border-[#252A33] pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#60C9D2] uppercase tracking-wider font-semibold">
            <Scale className="w-4 h-4" />
            <span>Planetary Geochemical Comparison</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F2F4]">
            Compositional Comparison Workspace
          </h1>
          <p className="text-sm text-[#929AA7] max-w-3xl leading-relaxed">
            Quantitatively analyze compositional divergences between lunar
            geological terranes, near side vs. far side, and compare laboratory
            measurements of returned samples against regional orbital
            footprints.
          </p>
        </div>

        {/* Terrane Comparison Module */}
        <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252A33] pb-4">
            <div>
              <h2 className="text-base font-bold font-mono text-[#F1F2F4]">
                Regional & Terrane Comparison
              </h2>
              <p className="text-xs text-[#929AA7] mt-0.5">
                Area-weighted mean chemical profiles derived from Lunar
                Prospector GRS.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedRegionA("mare_tranquillitatis");
                  setSelectedRegionB("feldspathic_highlands_terrane");
                }}
                className="px-2.5 py-1 rounded bg-[#171B21] border border-[#252A33] text-[11px] font-mono text-[#929AA7] hover:text-[#F1F2F4]"
              >
                Mare vs. Highlands
              </button>
              <button
                onClick={() => {
                  setSelectedRegionA("nearside_hemisphere");
                  setSelectedRegionB("farside_hemisphere");
                }}
                className="px-2.5 py-1 rounded bg-[#171B21] border border-[#252A33] text-[11px] font-mono text-[#929AA7] hover:text-[#F1F2F4]"
              >
                Near vs. Far Side
              </button>
              <button
                onClick={() => {
                  setSelectedRegionA("procellarum_kreep_terrane");
                  setSelectedRegionB("south_pole_aitken");
                }}
                className="px-2.5 py-1 rounded bg-[#171B21] border border-[#252A33] text-[11px] font-mono text-[#929AA7] hover:text-[#F1F2F4]"
              >
                PKT vs. SPA
              </button>
            </div>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#60C9D2] uppercase">
                Region / Terrane A:
              </label>
              <select
                value={selectedRegionA}
                onChange={(e) => setSelectedRegionA(e.target.value)}
                className="bg-[#090B0E] border border-[#252A33] rounded-lg px-3 py-2 text-xs font-mono text-[#F1F2F4] focus:outline-none focus:border-[#60C9D2]"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#A599ED] uppercase">
                Region / Terrane B:
              </label>
              <select
                value={selectedRegionB}
                onChange={(e) => setSelectedRegionB(e.target.value)}
                className="bg-[#090B0E] border border-[#252A33] rounded-lg px-3 py-2 text-xs font-mono text-[#F1F2F4] focus:outline-none focus:border-[#A599ED]"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Bar Visualization */}
          {regA && regB && (
            <div className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {elementsToCompare.map((key) => {
                  const meta = CHEMICAL_COMPONENTS[key];
                  const valA = regA.meanAbundances[key];
                  const valB = regB.meanAbundances[key];
                  const maxRange = meta.maxValid;
                  const pctA = Math.min(100, (valA / maxRange) * 100);
                  const pctB = Math.min(100, (valB / maxRange) * 100);
                  const diff = valA - valB;

                  return (
                    <div
                      key={key}
                      className="p-3 bg-[#090B0E] rounded-lg border border-[#252A33] flex flex-col gap-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F1F2F4]">
                          {meta.formula}{" "}
                          <span className="text-[#626B78] font-normal text-[10px]">
                            ({meta.name})
                          </span>
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            diff > 0 ? "text-[#60C9D2]" : "text-[#A599ED]"
                          }`}
                        >
                          Δ {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}{" "}
                          {meta.unit}
                        </span>
                      </div>

                      {/* Region A bar */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#60C9D2] truncate max-w-[160px]">
                            {regA.name}
                          </span>
                          <span className="text-[#F1F2F4]">
                            {key === "k" ? Math.round(valA) : valA.toFixed(2)}{" "}
                            {meta.unit}
                          </span>
                        </div>
                        <div className="w-full bg-[#171B21] h-2 rounded overflow-hidden">
                          <div
                            className="bg-[#60C9D2] h-full rounded"
                            style={{ width: `${pctA}%` }}
                          />
                        </div>
                      </div>

                      {/* Region B bar */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-[#A599ED] truncate max-w-[160px]">
                            {regB.name}
                          </span>
                          <span className="text-[#F1F2F4]">
                            {key === "k" ? Math.round(valB) : valB.toFixed(2)}{" "}
                            {meta.unit}
                          </span>
                        </div>
                        <div className="w-full bg-[#171B21] h-2 rounded overflow-hidden">
                          <div
                            className="bg-[#A599ED] h-full rounded"
                            style={{ width: `${pctB}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Saved Point Observations from Observatory */}
        <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#252A33] pb-3">
            <div>
              <h2 className="text-base font-bold font-mono text-[#F1F2F4]">
                Saved Observatory Observations ({comparedLocations.length})
              </h2>
              <p className="text-xs text-[#929AA7] mt-0.5">
                Pinpointed surface observation cells saved directly from the 3D
                globe.
              </p>
            </div>
            {comparedLocations.length > 0 && (
              <button
                onClick={clearComparison}
                className="text-xs font-mono text-[#626B78] hover:text-[#F1F2F4] flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {comparedLocations.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-[#626B78]">
              No individual locations added yet. Click &quot;Add to
              Compare&quot; in the observatory inspector while exploring the
              Moon.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-[#626B78] text-[10px] uppercase border-b border-[#252A33]">
                    <th className="text-left py-2">Location</th>
                    <th className="text-right py-2">Coordinates</th>
                    <th className="text-right py-2">FeO (wt%)</th>
                    <th className="text-right py-2">TiO₂ (wt%)</th>
                    <th className="text-right py-2">Th (ppm)</th>
                    <th className="text-right py-2">Al₂O₃ (wt%)</th>
                    <th className="text-right py-2">Mg#</th>
                    <th className="text-right py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252A33]/50">
                  {comparedLocations.map((item, idx) => {
                    const mg = calculateMolarMgNumber(
                      item.cell.abundances.mg_o,
                      item.cell.abundances.fe_o,
                    );
                    return (
                      <tr key={idx} className="hover:bg-[#171B21]/50">
                        <td className="py-2.5 font-bold text-[#F1F2F4]">
                          {item.label}
                        </td>
                        <td className="py-2.5 text-right text-[#929AA7]">
                          {item.coord.latitude.toFixed(2)}°,{" "}
                          {item.coord.longitude.toFixed(2)}°
                        </td>
                        <td className="py-2.5 text-right text-[#F1F2F4]">
                          {item.cell.abundances.fe_o.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right text-[#F1F2F4]">
                          {item.cell.abundances.ti_o2.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right text-[#60C9D2] font-semibold">
                          {item.cell.abundances.th.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right text-[#F1F2F4]">
                          {item.cell.abundances.al2_o3.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right text-[#A599ED]">
                          {mg ? mg.toFixed(1) : "—"}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => removeFromComparison(idx)}
                            className="text-[#626B78] hover:text-[#F1F2F4]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
