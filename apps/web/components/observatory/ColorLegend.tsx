"use client";

import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { CHEMICAL_COMPONENTS } from "@lunar-atlas/scientific-types";
import React from "react";

export const ColorLegend: React.FC = () => {
  const activeLayer = useObservatoryStore((s) => s.activeLayer);
  const selectedCoord = useObservatoryStore((s) => s.selectedCoord);
  const selectedCell = useObservatoryStore((s) => s.selectedCell);

  if (activeLayer === "none") {
    return (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#101318]/90 border border-[#252A33] rounded px-3 py-1.5 shadow-lg backdrop-blur flex items-center gap-3 text-xs font-mono text-[#929AA7]">
        <span>Basemap: LROC WAC Global Grayscale (7 bands)</span>
        <span className="text-[#626B78]">•</span>
        <span>Resolution: 100 m/pixel equivalent</span>
      </div>
    );
  }

  const info = CHEMICAL_COMPONENTS[activeLayer];
  const currentValue = selectedCell
    ? selectedCell.abundances[activeLayer]
    : null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-xl bg-[#101318]/95 border border-[#252A33] rounded-lg p-2.5 shadow-2xl backdrop-blur-md flex flex-col gap-1.5 select-none text-xs">
      {/* Top row: Layer Name & Units */}
      <div className="flex items-center justify-between font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#F1F2F4]">{info.formula}</span>
          <span className="text-[#929AA7]">{info.name}</span>
          <span className="text-[#626B78]">({info.unit})</span>
        </div>
        {currentValue !== null && (
          <div className="text-[#60C9D2] font-semibold">
            Selected:{" "}
            <span>
              {activeLayer === "k"
                ? Math.round(currentValue)
                : currentValue.toFixed(2)}{" "}
              {info.unit}
            </span>
          </div>
        )}
      </div>

      {/* Gradient Bar */}
      <div className="relative w-full h-3 rounded overflow-hidden shadow-inner">
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(to right, #440154, #482878, #3e4a89, #31688e, #26828e, #1f9e89, #35b779, #6ece58, #b5de2b, #fde725)",
          }}
        />
        {/* Needle indicator for current selected cell value */}
        {currentValue !== null && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_4px_white] -translate-x-1/2 transition-all duration-200"
            style={{
              left: `${Math.min(
                100,
                Math.max(
                  0,
                  ((currentValue - info.minValid) /
                    (info.maxValid - info.minValid)) *
                    100,
                ),
              )}%`,
            }}
          />
        )}
      </div>

      {/* Ticks and metadata */}
      <div className="flex items-center justify-between font-mono text-[10px] text-[#626B78]">
        <span>
          {info.minValid} {info.unit}
        </span>
        <span className="hidden sm:inline">
          Typical Highlands: {info.typicalHighlands} {info.unit}
        </span>
        <span className="hidden sm:inline">
          Typical Mare: {info.typicalMare} {info.unit}
        </span>
        <span>
          {info.maxValid} {info.unit}
        </span>
      </div>

      {/* Source & footprint footnote */}
      <div className="flex items-center justify-between text-[9px] font-mono text-[#626B78] pt-1 border-t border-[#252A33]/50">
        <span>Source: LP GRS Level 5 Abundances (Prettyman et al. 2006)</span>
        <span>Native Support: 5° Equal-Area (~150 km)</span>
      </div>
    </div>
  );
};
