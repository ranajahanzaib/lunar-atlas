"use client";

import { Header } from "@/components/layout/Header";
import { fetchLunarRegions } from "@/lib/dataClient";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { LunarRegion } from "@lunar-atlas/scientific-types";
import { Compass, Globe2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegionsDirectoryPage() {
  const router = useRouter();
  const [regions, setRegions] = useState<LunarRegion[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const flyTo = useObservatoryStore((s) => s.flyTo);
  const setSelectedLocation = useObservatoryStore((s) => s.setSelectedLocation);

  useEffect(() => {
    async function load() {
      const data = await fetchLunarRegions();
      setRegions(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredRegions = regions.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.geologicalUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const navigateToRegion = (r: LunarRegion) => {
    flyTo(r.centerCoordinates.latitude, r.centerCoordinates.longitude, 4.0);
    setSelectedLocation(r.centerCoordinates, null);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col select-none">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-[#252A33] pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A9C9E8] uppercase tracking-wider font-semibold">
            <Compass className="w-4 h-4" />
            <span>Lunar Geomorphology & Terranes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F2F4]">
            Major Lunar Regions & Impact Basins
          </h1>
          <p className="text-sm text-[#929AA7] max-w-3xl leading-relaxed">
            The lunar surface is partitioned into distinct geological provinces
            and basins, ranging from the heat-producing Procellarum KREEP
            Terrane to the ancient anorthositic Feldspathic Highlands and the
            giant South Pole–Aitken Basin.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#101318] border border-[#252A33] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#626B78] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search regions by name, basin type, or stratigraphic age..."
              className="w-full bg-[#090B0E] border border-[#252A33] rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-[#F1F2F4] placeholder-[#626B78] focus:outline-none focus:border-[#A9C9E8]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["all", "mare", "basin", "highland_terrane"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors whitespace-nowrap ${
                  filterType === type
                    ? "bg-[#171B21] text-[#A9C9E8] border border-[#A9C9E8]/40 font-semibold"
                    : "text-[#929AA7] hover:bg-[#171B21] hover:text-[#F1F2F4] border border-[#252A33]"
                }`}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Regions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRegions.map((r) => (
            <div
              key={r.id}
              className="bg-[#101318] border border-[#252A33] hover:border-[#A9C9E8]/50 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 group shadow-md"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold font-mono text-[#F1F2F4] group-hover:text-[#A9C9E8] transition-colors">
                      {r.name}
                    </h2>
                    <span className="text-[11px] font-mono text-[#60C9D2] uppercase">
                      {r.type.replace("_", " ")}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#171B21] border border-[#252A33] text-[#929AA7]">
                    {r.approxAreaKm2.toLocaleString()} km²
                  </span>
                </div>

                <p className="text-xs text-[#929AA7] line-clamp-2 leading-relaxed">
                  {r.summary}
                </p>

                {/* Mean Abundances Bar */}
                <div className="p-2.5 bg-[#090B0E] rounded-lg border border-[#252A33] flex flex-col gap-1 text-[11px] font-mono">
                  <div className="text-[10px] text-[#626B78] uppercase mb-0.5">
                    Mean Abundance Profile:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[#626B78] text-[10px]">FeO: </span>
                      <strong className="text-[#F1F2F4]">
                        {r.meanAbundances.fe_o}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#626B78] text-[10px]">TiO₂: </span>
                      <strong className="text-[#F1F2F4]">
                        {r.meanAbundances.ti_o2}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#626B78] text-[10px]">Th: </span>
                      <strong className="text-[#60C9D2]">
                        {r.meanAbundances.th} ppm
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#626B78]">
                  Stratigraphic Age:{" "}
                  <span className="text-[#929AA7]">{r.stratigraphicAge}</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-[#252A33] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#626B78]">
                  Center: {r.centerCoordinates.latitude}°,{" "}
                  {r.centerCoordinates.longitude}°
                </span>
                <button
                  onClick={() => navigateToRegion(r)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#171B21] hover:bg-[#252A33] border border-[#252A33] hover:border-[#A9C9E8] text-xs font-mono text-[#A9C9E8] transition-colors"
                >
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
