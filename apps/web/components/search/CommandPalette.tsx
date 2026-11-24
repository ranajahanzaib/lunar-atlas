"use client";

import { useObservatoryStore } from "@/stores/useObservatoryStore";
import {
  CHEMICAL_COMPONENTS,
  ChemicalComponentKey,
  LunarMission,
  LunarRegion,
  ReturnedSample,
} from "@lunar-atlas/scientific-types";
import { Compass, Layers, MapPin, Search, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CommandPaletteProps {
  regions: LunarRegion[];
  missions: LunarMission[];
  samples: ReturnedSample[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  regions,
  missions,
  samples,
}) => {
  const router = useRouter();
  const isOpen = useObservatoryStore((s) => s.isCommandPaletteOpen);
  const setIsOpen = useObservatoryStore((s) => s.setCommandPaletteOpen);
  const flyTo = useObservatoryStore((s) => s.flyTo);
  const setActiveLayer = useObservatoryStore((s) => s.setActiveLayer);
  const setSelectedMission = useObservatoryStore((s) => s.setSelectedMission);
  const setSelectedSample = useObservatoryStore((s) => s.setSelectedSample);

  const [query, setQuery] = useState("");

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter Missions
  const matchedMissions = (missions || []).filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.landingSiteName.toLowerCase().includes(q) ||
      m.program.toLowerCase().includes(q),
  );

  // Filter Samples
  const matchedSamples = (samples || []).filter(
    (s) =>
      s.sampleId.includes(q) ||
      s.materialType.toLowerCase().includes(q) ||
      s.geologicalClassification.toLowerCase().includes(q) ||
      s.mission.toLowerCase().includes(q),
  );

  // Filter Regions
  const matchedRegions = (regions || []).filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.geologicalUnit.toLowerCase().includes(q),
  );

  // Filter Elements
  const matchedElements = Object.entries(CHEMICAL_COMPONENTS).filter(
    ([key, info]) =>
      key.includes(q) ||
      info.formula.toLowerCase().includes(q) ||
      info.name.toLowerCase().includes(q),
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#050608]/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-xl bg-[#101318] border border-[#252A33] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-[#252A33] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#929AA7]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search regions, returned samples, Apollo missions, chemical elements..."
            autoFocus
            className="flex-1 bg-transparent text-[#F1F2F4] text-sm placeholder-[#626B78] focus:outline-none font-mono"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#626B78] hover:text-[#F1F2F4] p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-3 select-none text-xs">
          {/* Elements */}
          {matchedElements.length > 0 && (
            <div>
              <span className="text-[10px] font-mono text-[#626B78] uppercase px-2">
                Chemical Layers
              </span>
              <div className="mt-1 flex flex-col gap-0.5">
                {matchedElements.map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveLayer(key as ChemicalComponentKey);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-[#171B21] flex items-center justify-between text-[#F1F2F4] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#60C9D2]" />
                      <span className="font-mono font-semibold">
                        {info.formula}
                      </span>
                      <span className="text-[#929AA7]">{info.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#626B78]">
                      Activate Overlay →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Missions */}
          {matchedMissions.length > 0 && (
            <div>
              <span className="text-[10px] font-mono text-[#626B78] uppercase px-2">
                Sample-Return Missions
              </span>
              <div className="mt-1 flex flex-col gap-0.5">
                {matchedMissions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMission(m);
                      flyTo(
                        m.landingCoordinates.latitude,
                        m.landingCoordinates.longitude,
                        3.8,
                      );
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-[#171B21] flex items-center justify-between text-[#F1F2F4] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#D9B674]" />
                      <span className="font-semibold">{m.name}</span>
                      <span className="text-[#929AA7] text-[11px] truncate max-w-xs">
                        {m.landingSiteName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#D9B674]">
                      Fly to Landing Site →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Returned Samples */}
          {matchedSamples.length > 0 && (
            <div>
              <span className="text-[10px] font-mono text-[#626B78] uppercase px-2">
                Returned Lunar Samples
              </span>
              <div className="mt-1 flex flex-col gap-0.5">
                {matchedSamples.map((s) => (
                  <button
                    key={s.sampleId}
                    onClick={() => {
                      setSelectedSample(s);
                      if (s.location.reviewStatus === "verified") {
                        flyTo(s.location.latitude, s.location.longitude, 3.5);
                      }
                      setIsOpen(false);
                      router.push(`/samples/${s.sampleId}`);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-[#171B21] flex items-center justify-between text-[#F1F2F4] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#A599ED]" />
                      <span className="font-mono font-bold">
                        Sample #{s.sampleId}
                      </span>
                      <span className="text-[#929AA7] text-[11px] truncate max-w-xs">
                        {s.geologicalClassification} ({s.mission})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#A599ED]">
                      View Specimen →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Regions */}
          {matchedRegions.length > 0 && (
            <div>
              <span className="text-[10px] font-mono text-[#626B78] uppercase px-2">
                Geomorphological Regions
              </span>
              <div className="mt-1 flex flex-col gap-0.5">
                {matchedRegions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      flyTo(
                        r.centerCoordinates.latitude,
                        r.centerCoordinates.longitude,
                        4.0,
                      );
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-[#171B21] flex items-center justify-between text-[#F1F2F4] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#A9C9E8]" />
                      <span className="font-semibold">{r.name}</span>
                      <span className="text-[#626B78] text-[10px]">
                        ({r.type})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#60C9D2]">
                      Navigate Globe →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
