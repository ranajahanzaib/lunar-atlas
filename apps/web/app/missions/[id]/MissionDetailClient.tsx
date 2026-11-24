"use client";

import { Header } from "@/components/layout/Header";
import { fetchLunarMissions, fetchReturnedSamples } from "@/lib/dataClient";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { LunarMission, ReturnedSample } from "@lunar-atlas/scientific-types";
import { ArrowLeft, Globe2, Layers, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function MissionDetailClient({ missionId }: { missionId: string }) {
  const router = useRouter();

  const [mission, setMission] = useState<LunarMission | null>(null);
  const [samples, setSamples] = useState<ReturnedSample[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const flyTo = useObservatoryStore((s) => s.flyTo);
  const setSelectedLocation = useObservatoryStore((s) => s.setSelectedLocation);
  const setSelectedMission = useObservatoryStore((s) => s.setSelectedMission);

  useEffect(() => {
    async function load() {
      const [allMissions, allSamples] = await Promise.all([
        fetchLunarMissions(),
        fetchReturnedSamples(),
      ]);

      const match = allMissions.find((m) => m.id === missionId);
      setMission(match || null);

      if (match) {
        const missionSamples = allSamples.filter(
          (s) =>
            s.mission.toLowerCase().replace(/[^a-z0-9]/g, "") ===
            match.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        );
        setSamples(missionSamples);
      }

      setIsLoading(false);
    }
    load();
  }, [missionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center text-xs font-mono text-[#929AA7]">
        Loading expedition profile for {missionId}...
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="text-base font-mono text-[#F1F2F4]">
            Mission {missionId} not found
          </span>
          <Link
            href="/missions"
            className="text-xs font-mono text-[#60C9D2] hover:underline"
          >
            ← Return to Missions Index
          </Link>
        </div>
      </div>
    );
  }

  const navigateToGlobe = () => {
    setSelectedMission(mission);
    flyTo(
      mission.landingCoordinates.latitude,
      mission.landingCoordinates.longitude,
      3.8,
    );
    setSelectedLocation(mission.landingCoordinates, null);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col select-none">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#252A33] pb-4">
          <Link
            href="/missions"
            className="flex items-center gap-1.5 text-xs font-mono text-[#929AA7] hover:text-[#F1F2F4] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Missions Index</span>
          </Link>

          <button
            onClick={navigateToGlobe}
            className="flex items-center gap-1.5 bg-[#101318] hover:bg-[#171B21] border border-[#252A33] hover:border-[#D9B674] px-3 py-1.5 rounded-lg text-xs font-mono text-[#F1F2F4] transition-colors shadow-sm"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#D9B674]" />
            <span>Fly to Landing Site</span>
          </button>
        </div>

        {/* Mission Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#D9B674] font-semibold uppercase tracking-wider">
                {mission.program} Lunar Exploration
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171B21] border border-[#252A33] text-[#929AA7]">
                ID: {mission.id}
              </span>
            </div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-[#F1F2F4] mt-1">
              {mission.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#D9B674] mt-0.5 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>{mission.landingSiteName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#101318] border border-[#D9B674]/40 rounded-lg px-3 py-2 text-right">
              <div className="text-[10px] font-mono text-[#626B78] uppercase">
                Sample Yield
              </div>
              <div className="text-lg font-mono font-bold text-[#D9B674]">
                {mission.totalMassReturnedKg} kg
              </div>
            </div>
            <div className="bg-[#101318] border border-[#252A33] rounded-lg px-3 py-2 text-right">
              <div className="text-[10px] font-mono text-[#626B78] uppercase">
                Surface Duration
              </div>
              <div className="text-lg font-mono font-bold text-[#F1F2F4]">
                {mission.durationHours} hrs
              </div>
            </div>
          </div>
        </div>

        {/* Mission Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold border-b border-[#252A33] pb-2">
              Expedition Overview & Geologic Goals
            </span>
            <p className="text-sm text-[#F1F2F4] leading-relaxed">
              {mission.scientificSummary}
            </p>

            <div className="mt-2 p-3 bg-[#090B0E] rounded-lg border border-[#252A33] flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-[#D9B674] uppercase font-semibold">
                Geological Context:
              </span>
              <p className="text-xs text-[#929AA7] leading-relaxed">
                {mission.geologicalContext}
              </p>
            </div>

            {mission.primaryScientificGoals &&
              mission.primaryScientificGoals.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold">
                    Primary Scientific Goals
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono text-[#929AA7]">
                    {mission.primaryScientificGoals.map((g, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Landing Site Coordinates */}
          <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-3 shadow-sm text-xs font-mono">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold border-b border-[#252A33] pb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D9B674]" />
              <span>Landing Telemetry</span>
            </span>

            <div className="flex justify-between py-1 border-b border-[#252A33]/50">
              <span className="text-[#626B78]">Latitude:</span>
              <span className="text-[#F1F2F4] font-medium">
                {mission.landingCoordinates.latitude.toFixed(4)}°
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252A33]/50">
              <span className="text-[#626B78]">Longitude:</span>
              <span className="text-[#F1F2F4] font-medium">
                {mission.landingCoordinates.longitude.toFixed(4)}°
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252A33]/50">
              <span className="text-[#626B78]">Landing Date:</span>
              <span className="text-[#F1F2F4]">{mission.landingDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252A33]/50">
              <span className="text-[#626B78]">Program:</span>
              <span className="text-[#D9B674]">{mission.program}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#626B78] leading-tight">
              Coordinate frame: IAU Planetocentric East-positive. Never
              substituted for individual sample station coordinates.
            </div>
          </div>
        </div>

        {/* Returned Samples from this Mission */}
        <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#252A33] pb-2">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#A599ED]" />
              <span>Cataloged Returned Lunar Specimens ({samples.length})</span>
            </span>
            <span className="text-[11px] font-mono text-[#626B78]">
              NASA Lunar Sample Compendium & Astromat
            </span>
          </div>

          {samples.length === 0 ? (
            <p className="text-xs font-mono text-[#626B78] italic py-3">
              No individual specimens currently linked in this verified release.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {samples.map((s) => (
                <Link
                  key={s.sampleId}
                  href={`/samples/${s.sampleId}`}
                  className="p-3 bg-[#090B0E] hover:bg-[#171B21] border border-[#252A33] hover:border-[#A599ED]/50 rounded-lg flex flex-col gap-1 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#F1F2F4] group-hover:text-[#A599ED] transition-colors">
                      Sample #{s.sampleId}
                    </span>
                    <span className="text-[10px] font-mono text-[#D9B674]">
                      {s.weightGrams} g
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#A9C9E8] truncate">
                    {s.geologicalClassification}
                  </div>
                  <div className="text-[10px] font-mono text-[#626B78] flex items-center justify-between mt-1 pt-1 border-t border-[#252A33]/40">
                    <span>{s.location.stationName}</span>
                    <span className="text-[#60C9D2] uppercase">
                      {s.location.precision.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
