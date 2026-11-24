"use client";

import { useObservatoryStore } from "@/stores/useObservatoryStore";
import {
  CHEMICAL_COMPONENTS,
  ChemicalComponentKey,
} from "@lunar-atlas/scientific-types";
import { Compass, Grid, Layers, MapPin, Route, Sparkles } from "lucide-react";
import React, { useState } from "react";

export const LayerPanel: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeLayer = useObservatoryStore((s) => s.activeLayer);
  const setActiveLayer = useObservatoryStore((s) => s.setActiveLayer);
  const layerOpacity = useObservatoryStore((s) => s.layerOpacity);
  const setLayerOpacity = useObservatoryStore((s) => s.setLayerOpacity);

  const isGridVisible = useObservatoryStore((s) => s.isGridVisible);
  const toggleGrid = useObservatoryStore((s) => s.toggleGrid);
  const isMissionsVisible = useObservatoryStore((s) => s.isMissionsVisible);
  const toggleMissions = useObservatoryStore((s) => s.toggleMissions);
  const isSamplesVisible = useObservatoryStore((s) => s.isSamplesVisible);
  const toggleSamples = useObservatoryStore((s) => s.toggleSamples);

  const flyTo = useObservatoryStore((s) => s.flyTo);
  const isTraverseActive = useObservatoryStore((s) => s.isTraverseActive);
  const setIsTraverseActive = useObservatoryStore((s) => s.setIsTraverseActive);

  const primaryElements: ChemicalComponentKey[] = [
    "th",
    "fe_o",
    "ti_o2",
    "al2_o3",
    "mg_o",
    "k",
    "u",
  ];

  const presets = [
    {
      label: "Thorium & PKT",
      layer: "th" as ChemicalComponentKey,
      lat: 25,
      lon: -25,
      desc: "Procellarum KREEP heat-producing terrane",
    },
    {
      label: "High-Ti Maria",
      layer: "ti_o2" as ChemicalComponentKey,
      lat: 8.5,
      lon: 31.5,
      desc: "Apollo 11 Tranquillitatis ilmenite basalts",
    },
    {
      label: "FHT Anorthosite",
      layer: "al2_o3" as ChemicalComponentKey,
      lat: 0,
      lon: 160,
      desc: "Primordial magma ocean flotation crust",
    },
    {
      label: "SPA Megabasin",
      layer: "fe_o" as ChemicalComponentKey,
      lat: -53,
      lon: -169,
      desc: "Excavated lower crust & mantle floor",
    },
  ];

  if (isCollapsed) {
    return (
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-[#101318]/90 border border-[#252A33] rounded p-2 text-[#929AA7] hover:text-[#F1F2F4] hover:bg-[#171B21] shadow-lg backdrop-blur"
          title="Open Layer Controls"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute top-4 left-4 z-20 w-72 max-h-[calc(100vh-6rem)] overflow-y-auto bg-[#101318]/95 border border-[#252A33] rounded-lg shadow-2xl backdrop-blur-md flex flex-col divide-y divide-[#252A33] select-none text-xs">
      {/* Panel Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#F1F2F4] font-medium">
          <Layers className="w-4 h-4 text-[#A9C9E8]" />
          <span>Orbital Layers</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-[#626B78] hover:text-[#929AA7] text-xs px-1.5 py-0.5 rounded hover:bg-[#171B21]"
        >
          Hide
        </button>
      </div>

      {/* Chemical Abundance Selector */}
      <div className="p-3 flex flex-col gap-2">
        <div className="text-[11px] font-mono text-[#929AA7] uppercase tracking-wider flex items-center justify-between">
          <span>Chemical Composition</span>
          <button
            onClick={() => setActiveLayer("none")}
            className={`text-[10px] hover:text-[#F1F2F4] transition-colors ${
              activeLayer === "none"
                ? "text-[#60C9D2] font-semibold"
                : "text-[#626B78]"
            }`}
          >
            Grayscale Base
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {primaryElements.map((key) => {
            const info = CHEMICAL_COMPONENTS[key];
            const isActive = activeLayer === key;
            return (
              <button
                key={key}
                onClick={() => setActiveLayer(key)}
                className={`p-2 rounded border text-left flex flex-col transition-all ${
                  isActive
                    ? "bg-[#171B21] border-[#60C9D2] text-[#F1F2F4] shadow-sm"
                    : "bg-[#090B0E]/60 border-[#252A33] text-[#929AA7] hover:border-[#3B4352] hover:text-[#F1F2F4]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-xs text-[#F1F2F4]">
                    {info.formula}
                  </span>
                  <span className="text-[10px] font-mono text-[#626B78]">
                    {info.unit}
                  </span>
                </div>
                <span className="text-[10px] text-[#929AA7] truncate mt-0.5">
                  {info.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Layer Opacity Slider */}
        {activeLayer !== "none" && (
          <div className="mt-2 pt-2 border-t border-[#252A33]/60 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#929AA7]">
              <span>Overlay Opacity</span>
              <span>{Math.round(layerOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
              className="w-full accent-[#60C9D2] bg-[#252A33] h-1.5 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Planetary Presets */}
      <div className="p-3 flex flex-col gap-1.5">
        <span className="text-[11px] font-mono text-[#929AA7] uppercase tracking-wider">
          Scientific Presets
        </span>
        <div className="grid grid-cols-1 gap-1">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setActiveLayer(p.layer);
                flyTo(p.lat, p.lon, 4.0);
              }}
              className="p-1.5 rounded bg-[#090B0E]/60 border border-[#252A33] hover:border-[#A9C9E8]/40 hover:bg-[#171B21] text-left transition-colors flex flex-col"
            >
              <span className="text-xs font-medium text-[#F1F2F4] flex items-center justify-between">
                {p.label}
                <span className="text-[10px] font-mono text-[#60C9D2] uppercase">
                  {CHEMICAL_COMPONENTS[p.layer].formula}
                </span>
              </span>
              <span className="text-[10px] text-[#626B78] truncate">
                {p.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Camera Presets */}
      <div className="p-3 flex flex-col gap-2">
        <span className="text-[11px] font-mono text-[#929AA7] uppercase tracking-wider flex items-center gap-1">
          <Compass className="w-3.5 h-3.5" />
          <span>Camera Presets</span>
        </span>
        <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
          <button
            onClick={() => flyTo(0, 0, 4.4)}
            className="p-1.5 rounded bg-[#090B0E]/60 border border-[#252A33] hover:border-[#3B4352] text-[#F1F2F4] text-center"
          >
            Near Side (0°)
          </button>
          <button
            onClick={() => flyTo(0, 180, 4.4)}
            className="p-1.5 rounded bg-[#090B0E]/60 border border-[#252A33] hover:border-[#3B4352] text-[#F1F2F4] text-center"
          >
            Far Side (180°)
          </button>
          <button
            onClick={() => flyTo(90, 0, 4.4)}
            className="p-1.5 rounded bg-[#090B0E]/60 border border-[#252A33] hover:border-[#3B4352] text-[#F1F2F4] text-center"
          >
            North Pole
          </button>
          <button
            onClick={() => flyTo(-90, 0, 4.4)}
            className="p-1.5 rounded bg-[#090B0E]/60 border border-[#252A33] hover:border-[#3B4352] text-[#F1F2F4] text-center"
          >
            South Pole
          </button>
        </div>
      </div>

      {/* Overlays & Tools */}
      <div className="p-3 flex flex-col gap-2">
        <span className="text-[11px] font-mono text-[#929AA7] uppercase tracking-wider">
          Overlays & Tools
        </span>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center justify-between text-xs text-[#F1F2F4] cursor-pointer">
            <span className="flex items-center gap-1.5 text-[#929AA7]">
              <Grid className="w-3.5 h-3.5" />
              <span>Coordinate Grid</span>
            </span>
            <input
              type="checkbox"
              checked={isGridVisible}
              onChange={toggleGrid}
              className="accent-[#60C9D2]"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-[#F1F2F4] cursor-pointer">
            <span className="flex items-center gap-1.5 text-[#D9B674]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Landing Sites</span>
            </span>
            <input
              type="checkbox"
              checked={isMissionsVisible}
              onChange={toggleMissions}
              className="accent-[#D9B674]"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-[#F1F2F4] cursor-pointer">
            <span className="flex items-center gap-1.5 text-[#A599ED]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Returned Samples</span>
            </span>
            <input
              type="checkbox"
              checked={isSamplesVisible}
              onChange={toggleSamples}
              className="accent-[#A599ED]"
            />
          </label>

          <button
            onClick={() => setIsTraverseActive(!isTraverseActive)}
            className={`mt-1 p-2 rounded border flex items-center justify-between transition-colors ${
              isTraverseActive
                ? "bg-[#171B21] border-[#60C9D2] text-[#60C9D2]"
                : "bg-[#090B0E]/60 border-[#252A33] text-[#929AA7] hover:border-[#3B4352] hover:text-[#F1F2F4]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5" />
              <span>Traverse Profile Tool</span>
            </span>
            <span className="text-[10px] font-mono">
              {isTraverseActive ? "ACTIVE" : "OFF"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
