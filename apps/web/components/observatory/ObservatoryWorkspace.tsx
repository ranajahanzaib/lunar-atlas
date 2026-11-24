"use client";

import { Lunar2DAtlas } from "@/components/atlas/Lunar2DAtlas";
import { LunarGlobe } from "@/components/globe/LunarGlobe";
import { Header } from "@/components/layout/Header";
import { ColorLegend } from "@/components/observatory/ColorLegend";
import { LayerPanel } from "@/components/observatory/LayerPanel";
import { RegionInspector } from "@/components/observatory/RegionInspector";
import { TraverseProfile } from "@/components/observatory/TraverseProfile";
import { CommandPalette } from "@/components/search/CommandPalette";
import {
  fetchLunarMissions,
  fetchLunarRegions,
  fetchOrbitalObservations,
  fetchReturnedSamples,
  findContainingCell,
} from "@/lib/dataClient";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import {
  LunarMission,
  LunarRegion,
  OrbitalObservationCell,
  ReturnedSample,
} from "@lunar-atlas/scientific-types";
import React, { useEffect, useState } from "react";

export const ObservatoryWorkspace: React.FC = () => {
  const viewMode = useObservatoryStore((s) => s.viewMode);
  const selectedCoord = useObservatoryStore((s) => s.selectedCoord);
  const setSelectedLocation = useObservatoryStore((s) => s.setSelectedLocation);

  const [orbitalCells, setOrbitalCells] = useState<OrbitalObservationCell[]>(
    [],
  );
  const [regions, setRegions] = useState<LunarRegion[]>([]);
  const [missions, setMissions] = useState<LunarMission[]>([]);
  const [samples, setSamples] = useState<ReturnedSample[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [c, r, m, s] = await Promise.all([
          fetchOrbitalObservations(),
          fetchLunarRegions(),
          fetchLunarMissions(),
          fetchReturnedSamples(),
        ]);
        setOrbitalCells(c);
        setRegions(r);
        setMissions(m);
        setSamples(s);

        // Initialize selected cell at default (Apollo 11 Tranquillity Base)
        if (c.length > 0) {
          const initialCell = findContainingCell(0.67, 23.47, c);
          setSelectedLocation(
            { latitude: 0.67, longitude: 23.47 },
            initialCell,
          );
        }
      } catch (err) {
        console.error(
          "Failed to initialize observatory scientific datasets:",
          err,
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [setSelectedLocation]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#050608] overflow-hidden select-none">
      {/* Top Observatory Header */}
      <Header />

      {/* Main Viewport Container */}
      <main className="flex-1 relative w-full h-[calc(100vh-3.25rem)] overflow-hidden">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 z-40 bg-[#050608]/90 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#A9C9E8]/20 border-t-[#60C9D2] animate-spin" />
            <span className="text-xs font-mono text-[#929AA7] tracking-wider uppercase">
              Initializing Lunar Geochemical Datasets...
            </span>
          </div>
        )}

        {/* 3D Lunar Globe / 2D Atlas View */}
        <div className="w-full h-full">
          {viewMode === "3d_globe" ? (
            <LunarGlobe
              orbitalCells={orbitalCells}
              missions={missions}
              samples={samples}
            />
          ) : (
            <Lunar2DAtlas
              orbitalCells={orbitalCells}
              missions={missions}
              samples={samples}
            />
          )}
        </div>

        {/* Floating Left Layer Controls */}
        <LayerPanel />

        {/* Floating Right Region / Observation Inspector */}
        <RegionInspector
          regions={regions}
          missions={missions}
          samples={samples}
        />

        {/* Bottom Strip Color Legend */}
        <ColorLegend />

        {/* Interactive Traverse Profile Panel */}
        <TraverseProfile orbitalCells={orbitalCells} />

        {/* Command Palette Modal */}
        <CommandPalette
          regions={regions}
          missions={missions}
          samples={samples}
        />
      </main>
    </div>
  );
};
