"use client";

import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { calculateMolarMgNumber } from "@lunar-atlas/lunar-geometry";
import {
  CHEMICAL_COMPONENTS,
  ChemicalComponentKey,
  LunarMission,
  LunarRegion,
  ReturnedSample,
} from "@lunar-atlas/scientific-types";
import { Check, Copy, Info, Plus } from "lucide-react";
import React, { useState } from "react";

interface RegionInspectorProps {
  regions: LunarRegion[];
  missions: LunarMission[];
  samples: ReturnedSample[];
}

export const RegionInspector: React.FC<RegionInspectorProps> = ({
  regions,
  missions,
  samples,
}) => {
  const [copied, setCopied] = useState(false);
  const selectedCoord = useObservatoryStore((s) => s.selectedCoord);
  const selectedCell = useObservatoryStore((s) => s.selectedCell);
  const addToComparison = useObservatoryStore((s) => s.addToComparison);
  const setSelectedMission = useObservatoryStore((s) => s.setSelectedMission);
  const setSelectedSample = useObservatoryStore((s) => s.setSelectedSample);

  if (!selectedCoord) return null;

  const latStr = `${Math.abs(selectedCoord.latitude).toFixed(2)}°${
    selectedCoord.latitude >= 0 ? "N" : "S"
  }`;
  const lonStr = `${Math.abs(selectedCoord.longitude).toFixed(2)}°${
    selectedCoord.longitude >= 0 ? "E" : "W"
  }`;

  const copyCoords = () => {
    navigator.clipboard.writeText(
      `${selectedCoord.latitude.toFixed(4)}, ${selectedCoord.longitude.toFixed(4)}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find nearest landing site if within 250 km (~8 degrees)
  let nearestMission: { mission: LunarMission; distDeg: number } | null = null;
  if (missions) {
    for (const m of missions) {
      const dLat = selectedCoord.latitude - m.landingCoordinates.latitude;
      const dLon = selectedCoord.longitude - m.landingCoordinates.longitude;
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);
      if (dist < 10 && (!nearestMission || dist < nearestMission.distDeg)) {
        nearestMission = { mission: m, distDeg: dist };
      }
    }
  }

  // Find containing or nearest region
  let activeRegion: LunarRegion | null = null;
  if (regions) {
    for (const r of regions) {
      if (
        selectedCoord.latitude >= r.boundingBox.latMin &&
        selectedCoord.latitude <= r.boundingBox.latMax &&
        selectedCoord.longitude >= r.boundingBox.lonMin &&
        selectedCoord.longitude <= r.boundingBox.lonMax
      ) {
        activeRegion = r;
        break;
      }
    }
  }

  // Calculate Molar Mg# if cell exists
  const mgNumber =
    selectedCell &&
    calculateMolarMgNumber(
      selectedCell.abundances.mg_o,
      selectedCell.abundances.fe_o,
    );

  const majorOxides: ChemicalComponentKey[] = [
    "fe_o",
    "ti_o2",
    "al2_o3",
    "mg_o",
    "si_o2",
    "ca_o",
  ];
  const traceElements: ChemicalComponentKey[] = ["th", "k", "u"];

  return (
    <aside className="absolute top-4 right-4 z-20 w-84 max-h-[calc(100vh-6rem)] overflow-y-auto bg-[#101318]/95 border border-[#252A33] rounded-lg shadow-2xl backdrop-blur-md flex flex-col divide-y divide-[#252A33] select-none text-xs">
      {/* Header: Coordinates & Location */}
      <div className="p-3.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#60C9D2] uppercase tracking-wider font-semibold">
            Surface Observation
          </span>
          <button
            onClick={copyCoords}
            className="flex items-center gap-1 text-[10px] font-mono text-[#929AA7] hover:text-[#F1F2F4] transition-colors"
            title="Copy Latitude, Longitude"
          >
            {copied ? (
              <Check className="w-3 h-3 text-[#60C9D2]" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-mono font-bold text-[#F1F2F4]">
            {latStr}, {lonStr}
          </span>
        </div>

        {activeRegion ? (
          <div className="text-xs text-[#A9C9E8] font-medium flex items-center gap-1">
            <span>{activeRegion.name}</span>
            <span className="text-[#626B78] text-[10px]">
              ({activeRegion.type})
            </span>
          </div>
        ) : (
          <div className="text-xs text-[#929AA7]">
            Lunar Terra (Highlands / Mare Margin)
          </div>
        )}

        {nearestMission && (
          <div
            onClick={() => setSelectedMission(nearestMission!.mission)}
            className="mt-1 p-1.5 rounded bg-[#171B21] border border-[#D9B674]/40 hover:border-[#D9B674] cursor-pointer flex items-center justify-between text-[11px] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D9B674]" />
              <span className="font-semibold text-[#F1F2F4]">
                {nearestMission.mission.name}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#D9B674]">
              {nearestMission.distDeg < 1
                ? "At landing site"
                : `~${Math.round(nearestMission.distDeg * 30)} km`}
            </span>
          </div>
        )}
      </div>

      {/* Observation Support & Metadata */}
      <div className="p-3 bg-[#090B0E]/50 flex flex-col gap-1 text-[11px] font-mono text-[#929AA7]">
        <div className="flex justify-between">
          <span>Spatial Support:</span>
          <span className="text-[#F1F2F4]">
            {selectedCell
              ? `5° Equal-Area (Pixel #${selectedCell.pixelId})`
              : "Orbital Footprint"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Cell Footprint Area:</span>
          <span className="text-[#F1F2F4]">
            {selectedCell
              ? `${selectedCell.areaKm2.toLocaleString()} km²`
              : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Data Product:</span>
          <span className="text-[#F1F2F4]">
            LP GRS Level 5 (Prettyman 2006)
          </span>
        </div>
      </div>

      {/* Chemical Abundance Profile */}
      <div className="p-3.5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#929AA7] uppercase tracking-wider">
            Chemical Composition
          </span>
          {mgNumber !== null && (
            <span
              className="text-[10px] font-mono bg-[#171B21] border border-[#60C9D2]/40 text-[#60C9D2] px-1.5 py-0.5 rounded"
              title="Molar Magnesium Number = 100 * [Mg] / ([Mg] + [Fe])"
            >
              Mg# {mgNumber.toFixed(1)}
            </span>
          )}
        </div>

        {selectedCell ? (
          <div className="flex flex-col gap-2">
            {/* Major Oxides */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-[#626B78] uppercase">
                Major Oxides (wt%)
              </span>
              {majorOxides.map((key) => {
                const info = CHEMICAL_COMPONENTS[key];
                const val = selectedCell.abundances[key];
                const unc = selectedCell.uncertainties[key];
                const pct = Math.min(100, (val / info.maxValid) * 100);

                return (
                  <div key={key} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-[#F1F2F4] font-medium">
                        {info.formula}
                      </span>
                      <span className="text-[#F1F2F4]">
                        {val.toFixed(2)}{" "}
                        <span className="text-[#626B78] text-[10px]">
                          ± {unc.toFixed(2)} wt%
                        </span>
                      </span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-[#171B21] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#60C9D2] to-[#A9C9E8] h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trace Elements */}
            <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-[#252A33]">
              <span className="text-[10px] font-mono text-[#626B78] uppercase">
                Trace Elements (ppm)
              </span>
              {traceElements.map((key) => {
                const info = CHEMICAL_COMPONENTS[key];
                const val = selectedCell.abundances[key];
                const unc = selectedCell.uncertainties[key];
                const pct = Math.min(100, (val / info.maxValid) * 100);

                return (
                  <div key={key} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-[#F1F2F4] font-medium">
                        {info.formula}
                      </span>
                      <span className="text-[#F1F2F4]">
                        {key === "k" ? Math.round(val) : val.toFixed(2)}{" "}
                        <span className="text-[#626B78] text-[10px]">
                          ± {key === "k" ? Math.round(unc) : unc.toFixed(2)} ppm
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-[#171B21] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#D9B674] to-[#A599ED] h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {key === "u" && (
                      <span className="text-[9px] text-[#626B78] italic">
                        * Tied to Th using documented lunar Th/U ratio (3.8)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-[#626B78]">
            Click anywhere on the lunar surface to inspect chemistry.
          </div>
        )}
      </div>

      {/* Scientific Limitation Disclosure */}
      <div className="p-3 bg-[#090B0E]/60 text-[10px] text-[#626B78] flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 text-[#626B78] shrink-0 mt-0.5" />
        <p>
          Measurements represent spatial averages across the top ~30-40 cm
          regolith for a 5° footprint (~150 km). Does not imply high-resolution
          point ground truth.
        </p>
      </div>

      {/* Action Footer */}
      {selectedCell && (
        <div className="p-3 flex items-center gap-2">
          <button
            onClick={() =>
              addToComparison({
                coord: selectedCoord,
                cell: selectedCell,
                label: activeRegion
                  ? activeRegion.name
                  : `${latStr}, ${lonStr}`,
              })
            }
            className="flex-1 py-1.5 px-2 rounded bg-[#171B21] hover:bg-[#252A33] border border-[#252A33] hover:border-[#60C9D2] text-[#F1F2F4] text-xs font-mono transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#60C9D2]" />
            <span>Add to Compare</span>
          </button>
        </div>
      )}
    </aside>
  );
};
