"use client";

import { Header } from "@/components/layout/Header";
import { fetchLunarMissions } from "@/lib/dataClient";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { LunarMission } from "@lunar-atlas/scientific-types";
import {
  Calendar,
  Clock,
  Globe2,
  MapPin,
  Rocket,
  Scale,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MissionsExplorerPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<LunarMission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const flyTo = useObservatoryStore((s) => s.flyTo);
  const setSelectedMission = useObservatoryStore((s) => s.setSelectedMission);
  const setSelectedLocation = useObservatoryStore((s) => s.setSelectedLocation);

  useEffect(() => {
    async function load() {
      const data = await fetchLunarMissions();
      setMissions(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const navigateToMission = (m: LunarMission) => {
    setSelectedMission(m);
    flyTo(m.landingCoordinates.latitude, m.landingCoordinates.longitude, 3.8);
    setSelectedLocation(m.landingCoordinates, null);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col select-none">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Hero */}
        <div className="flex flex-col gap-2 border-b border-[#252A33] pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#D9B674] uppercase tracking-wider font-semibold">
            <Rocket className="w-4 h-4" />
            <span>Lunar Sample-Return Expeditions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F2F4]">
            Exploration Missions & Landing Sites
          </h1>
          <p className="text-sm text-[#929AA7] max-w-3xl leading-relaxed">
            Ten successful missions have returned physical geologic material
            from the Moon: NASA&apos;s six crewed Apollo expeditions
            (1969–1972), the Soviet robotic Luna drill cores (1970–1976), and
            China&apos;s robotic Chang&apos;e 5 spacecraft (2020).
          </p>
        </div>

        {/* Missions Timeline Cards */}
        <div className="flex flex-col gap-4">
          {missions.map((m) => (
            <div
              key={m.id}
              className="bg-[#101318] border border-[#252A33] hover:border-[#D9B674]/50 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all duration-200 group shadow-md"
            >
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D9B674]" />
                  <h2 className="text-lg font-bold font-mono text-[#F1F2F4] group-hover:text-[#D9B674] transition-colors">
                    {m.name}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171B21] border border-[#252A33] text-[#929AA7]">
                    {m.program} Program
                  </span>
                </div>

                <div className="text-xs font-mono text-[#D9B674] font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{m.landingSiteName}</span>
                </div>

                <p className="text-xs text-[#929AA7] leading-relaxed max-w-2xl">
                  {m.scientificSummary}
                </p>

                {/* Badges strip */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#626B78] mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(m.landingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{m.durationHours} hrs on surface</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>{m.totalMassReturnedKg} kg returned</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#A599ED]" />
                    <span className="text-[#A599ED]">
                      {m.catalogedSamplesCount} cataloged samples
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#252A33]">
                <div className="text-right text-[11px] font-mono text-[#929AA7]">
                  {m.landingCoordinates.latitude.toFixed(4)}°,{" "}
                  {m.landingCoordinates.longitude.toFixed(4)}°
                </div>
                <button
                  onClick={() => navigateToMission(m)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#171B21] hover:bg-[#252A33] border border-[#252A33] hover:border-[#D9B674] text-xs font-mono text-[#D9B674] transition-colors shadow-sm"
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>Locate Site</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
