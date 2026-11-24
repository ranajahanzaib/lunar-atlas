"use client";

import { Header } from "@/components/layout/Header";
import { fetchReturnedSamples } from "@/lib/dataClient";
import { ReturnedSample } from "@lunar-atlas/scientific-types";
import {
  ChevronRight,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SamplesCatalogPage() {
  const [samples, setSamples] = useState<ReturnedSample[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMission, setSelectedMission] = useState<string>("all");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchReturnedSamples();
      setSamples(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const missionsList = Array.from(
    new Set(samples.map((s) => s.mission)),
  ).sort();
  const materialList = Array.from(
    new Set(samples.map((s) => s.materialType)),
  ).sort();

  const filteredSamples = samples.filter((s) => {
    const matchesSearch =
      s.sampleId.includes(searchQuery) ||
      s.geologicalClassification
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMission =
      selectedMission === "all" || s.mission === selectedMission;
    const matchesMaterial =
      selectedMaterial === "all" || s.materialType === selectedMaterial;
    const matchesVerified =
      !verifiedOnly || s.location.reviewStatus === "verified";
    return (
      matchesSearch && matchesMission && matchesMaterial && matchesVerified
    );
  });

  return (
    <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col select-none">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Page Hero & Scientific Description */}
        <div className="flex flex-col gap-2 border-b border-[#252A33] pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A599ED] uppercase tracking-wider font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Lunar Sample Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F2F4]">
            Returned Lunar Samples Catalog
          </h1>
          <p className="text-sm text-[#929AA7] max-w-3xl leading-relaxed">
            Exploration of authenticated extraterrestrial specimens returned by
            Apollo, Luna, and Chang'e missions. Every sample record links
            laboratory geochemical measurements from Astromat with exact
            collection stations and digital microscopy.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#101318] border border-[#252A33] rounded-xl p-4 flex flex-col md:flex-row items-center gap-3 shadow-md">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#626B78] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sample ID (e.g. 15415, 10084), lithology, or mineralogy..."
              className="w-full bg-[#090B0E] border border-[#252A33] rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-[#F1F2F4] placeholder-[#626B78] focus:outline-none focus:border-[#A599ED]"
            />
          </div>

          {/* Mission Dropdown */}
          <select
            value={selectedMission}
            onChange={(e) => setSelectedMission(e.target.value)}
            className="w-full md:w-44 bg-[#090B0E] border border-[#252A33] rounded-lg px-3 py-2 text-xs font-mono text-[#F1F2F4] focus:outline-none focus:border-[#A599ED]"
          >
            <option value="all">All Missions</option>
            {missionsList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Material Dropdown */}
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="w-full md:w-44 bg-[#090B0E] border border-[#252A33] rounded-lg px-3 py-2 text-xs font-mono text-[#F1F2F4] focus:outline-none focus:border-[#A599ED]"
          >
            <option value="all">All Rock Types</option>
            {materialList.map((mat) => (
              <option key={mat} value={mat}>
                {mat.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>

          {/* Verified Toggle */}
          <label className="flex items-center gap-2 text-xs font-mono text-[#929AA7] cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="accent-[#60C9D2]"
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#60C9D2]" />
              <span>Verified Station</span>
            </span>
          </label>
        </div>

        {/* Specimen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSamples.map((s) => (
            <Link
              key={s.sampleId}
              href={`/samples/${s.sampleId}`}
              className="bg-[#101318] hover:bg-[#171B21] border border-[#252A33] hover:border-[#A599ED]/50 rounded-xl p-4.5 flex flex-col justify-between gap-4 transition-all duration-200 group shadow-md"
            >
              <div className="flex flex-col gap-2.5">
                {/* Card Top: ID and Mission Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-base font-bold text-[#F1F2F4] group-hover:text-[#60C9D2] transition-colors">
                      Sample #{s.sampleId}
                    </span>
                    <div className="text-[11px] font-mono text-[#A599ED] font-medium mt-0.5 truncate">
                      {s.geologicalClassification}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#171B21] border border-[#D9B674]/40 text-[#D9B674] shrink-0 whitespace-nowrap">
                    {s.mission}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#929AA7] line-clamp-3 leading-relaxed">
                  {s.description}
                </p>

                {/* Micrograph preview thumbnail if available */}
                <div className="w-full h-28 rounded-lg overflow-hidden bg-[#050608] border border-[#252A33] relative">
                  <img
                    src={`/data/samples/${s.sampleId}_xpl.jpg`}
                    alt={`Sample ${s.sampleId} thin section`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="absolute bottom-1.5 right-1.5 bg-[#090B0E]/80 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-mono text-[#929AA7] border border-[#252A33]">
                    XPL Micrograph
                  </div>
                </div>

                {/* Provenance Location */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#626B78]">
                  <MapPin className="w-3.5 h-3.5 text-[#D9B674] shrink-0" />
                  <span className="truncate">
                    {s.location.stationName || s.mission}
                  </span>
                </div>
              </div>

              {/* Composition Quick Strip */}
              <div className="pt-3 border-t border-[#252A33] flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-3">
                  {s.bulkComposition.fe_o && (
                    <span className="text-[#929AA7]">
                      FeO{" "}
                      <strong className="text-[#F1F2F4]">
                        {s.bulkComposition.fe_o}%
                      </strong>
                    </span>
                  )}
                  {s.bulkComposition.ti_o2 && (
                    <span className="text-[#929AA7]">
                      TiO₂{" "}
                      <strong className="text-[#F1F2F4]">
                        {s.bulkComposition.ti_o2}%
                      </strong>
                    </span>
                  )}
                  {s.bulkComposition.th && (
                    <span className="text-[#929AA7]">
                      Th{" "}
                      <strong className="text-[#F1F2F4]">
                        {s.bulkComposition.th} ppm
                      </strong>
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-[#626B78] group-hover:text-[#60C9D2] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
