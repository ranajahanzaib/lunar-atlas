"use client";

import { Header } from "@/components/layout/Header";
import {
  fetchLunarMissions,
  fetchLunarRegions,
  fetchReturnedSamples,
} from "@/lib/dataClient";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { calculateMolarMgNumber } from "@lunar-atlas/lunar-geometry";
import {
  CHEMICAL_COMPONENTS,
  ChemicalComponentKey,
  LunarMission,
  LunarRegion,
  ReturnedSample,
} from "@lunar-atlas/scientific-types";
import {
  ArrowLeft,
  Compass,
  Download,
  Globe2,
  Layers,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function RegionDetailClient({ regionId }: { regionId: string }) {
  const router = useRouter();

  const [region, setRegion] = useState<LunarRegion | null>(null);
  const [associatedMissions, setAssociatedMissions] = useState<LunarMission[]>(
    [],
  );
  const [associatedSamples, setAssociatedSamples] = useState<ReturnedSample[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const flyTo = useObservatoryStore((s) => s.flyTo);
  const setSelectedLocation = useObservatoryStore((s) => s.setSelectedLocation);
  const setSelectedRegion = useObservatoryStore((s) => s.setSelectedRegion);

  useEffect(() => {
    async function load() {
      const [allRegions, allMissions, allSamples] = await Promise.all([
        fetchLunarRegions(),
        fetchLunarMissions(),
        fetchReturnedSamples(),
      ]);

      const match = allRegions.find((r) => r.id === regionId);
      setRegion(match || null);

      if (match) {
        const { latMin, latMax, lonMin, lonMax } = match.boundingBox;
        // Filter missions within bounding box
        const matchingMissions = allMissions.filter((m) => {
          const { latitude, longitude } = m.landingCoordinates;
          return (
            latitude >= latMin &&
            latitude <= latMax &&
            longitude >= lonMin &&
            longitude <= lonMax
          );
        });
        setAssociatedMissions(matchingMissions);

        // Filter samples within bounding box
        const matchingSamples = allSamples.filter((s) => {
          const { latitude, longitude } = s.location;
          return (
            latitude >= latMin &&
            latitude <= latMax &&
            longitude >= lonMin &&
            longitude <= lonMax
          );
        });
        setAssociatedSamples(matchingSamples);
      }

      setIsLoading(false);
    }
    load();
  }, [regionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center text-xs font-mono text-[#929AA7]">
        Loading geological record for region {regionId}...
      </div>
    );
  }

  if (!region) {
    return (
      <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="text-base font-mono text-[#F1F2F4]">
            Region {regionId} not found
          </span>
          <Link
            href="/regions"
            className="text-xs font-mono text-[#60C9D2] hover:underline"
          >
            ← Return to Regions Directory
          </Link>
        </div>
      </div>
    );
  }

  const mgNum =
    region.meanAbundances.mg_o && region.meanAbundances.fe_o
      ? calculateMolarMgNumber(
          region.meanAbundances.mg_o,
          region.meanAbundances.fe_o,
        )
      : null;

  const navigateToGlobe = () => {
    setSelectedRegion(region);
    flyTo(
      region.centerCoordinates.latitude,
      region.centerCoordinates.longitude,
      3.8,
    );
    setSelectedLocation(region.centerCoordinates, null);
    router.push("/");
  };

  const exportRegionData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(region, null, 2));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `${region.id}_lunar_region.json`);
    dl.click();
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col select-none">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Navigation bar */}
        <div className="flex items-center justify-between border-b border-[#252A33] pb-4">
          <Link
            href="/regions"
            className="flex items-center gap-1.5 text-xs font-mono text-[#929AA7] hover:text-[#F1F2F4] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Regions Directory</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={exportRegionData}
              className="flex items-center gap-1.5 bg-[#101318] hover:bg-[#171B21] border border-[#252A33] px-3 py-1.5 rounded-lg text-xs font-mono text-[#929AA7] hover:text-[#F1F2F4] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={navigateToGlobe}
              className="flex items-center gap-1.5 bg-[#101318] hover:bg-[#171B21] border border-[#252A33] hover:border-[#60C9D2] px-3 py-1.5 rounded-lg text-xs font-mono text-[#F1F2F4] transition-colors shadow-sm"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#60C9D2]" />
              <span>Navigate on Globe</span>
            </button>
          </div>
        </div>

        {/* Region Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#A9C9E8] uppercase tracking-wider font-semibold">
                Lunar Geomorphology
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171B21] border border-[#252A33] text-[#929AA7] uppercase">
                {region.type.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-[#F1F2F4] mt-1">
              {region.name}
            </h1>
            <p className="text-xs font-mono text-[#D9B674] mt-0.5">
              Stratigraphy: {region.stratigraphicAge}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mgNum !== null && (
              <div className="bg-[#101318] border border-[#60C9D2]/40 rounded-lg px-3 py-2 text-right">
                <div className="text-[10px] font-mono text-[#626B78] uppercase">
                  Molar Mg#
                </div>
                <div className="text-lg font-mono font-bold text-[#60C9D2]">
                  {mgNum.toFixed(1)}
                </div>
              </div>
            )}
            <div className="bg-[#101318] border border-[#252A33] rounded-lg px-3 py-2 text-right">
              <div className="text-[10px] font-mono text-[#626B78] uppercase">
                Approx Area
              </div>
              <div className="text-lg font-mono font-bold text-[#F1F2F4]">
                {(region.approxAreaKm2 / 1000).toLocaleString()}k km²
              </div>
            </div>
          </div>
        </div>

        {/* Region Narrative & Significance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold border-b border-[#252A33] pb-2">
              Geological Setting & Petrogenesis
            </span>
            <p className="text-sm text-[#F1F2F4] leading-relaxed">
              {region.summary}
            </p>
            <div className="p-3 bg-[#090B0E] rounded-lg border border-[#252A33] flex flex-col gap-1">
              <span className="text-[10px] font-mono text-[#A9C9E8] uppercase font-semibold">
                Scientific Significance:
              </span>
              <p className="text-xs text-[#929AA7] leading-relaxed">
                {region.significance}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#626B78]">
              <span className="font-semibold text-[#929AA7]">
                Geologic Unit:
              </span>
              <span>{region.geologicalUnit}</span>
            </div>
          </div>

          {/* Spatial Coordinates Box */}
          <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-3 shadow-sm text-xs font-mono">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold border-b border-[#252A33] pb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#A9C9E8]" />
              <span>Planetocentric Coordinates</span>
            </span>
            <div className="flex justify-between py-1 border-b border-[#252A33]/50">
              <span className="text-[#626B78]">Center Lat:</span>
              <span className="text-[#F1F2F4] font-medium">
                {region.centerCoordinates.latitude}°
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252A33]/50">
              <span className="text-[#626B78]">Center Lon:</span>
              <span className="text-[#F1F2F4] font-medium">
                {region.centerCoordinates.longitude}°
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252A33]/50">
              <span className="text-[#626B78]">Latitude Extent:</span>
              <span className="text-[#929AA7]">
                [{region.boundingBox.latMin}°, {region.boundingBox.latMax}°]
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#252A33]/50">
              <span className="text-[#626B78]">Longitude Extent:</span>
              <span className="text-[#929AA7]">
                [{region.boundingBox.lonMin}°, {region.boundingBox.lonMax}°]
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#626B78] leading-tight">
              IAU Mean Lunar Radius R = 1,737.4 km. Planetocentric East-positive
              longitude [-180°, +180°].
            </div>
          </div>
        </div>

        {/* Area-Weighted Geochemical Composition Grid */}
        <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#252A33] pb-2">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold">
              Orbital Gamma-Ray Mean Abundance Profile (Lunar Prospector)
            </span>
            <span className="text-[11px] font-mono text-[#626B78]">
              Area-Weighted Integrated Spatial Averages
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(region.meanAbundances).map(([key, val]) => {
              const compKey = key as ChemicalComponentKey;
              const meta = CHEMICAL_COMPONENTS[compKey];
              if (!meta || val === undefined) return null;

              return (
                <div
                  key={key}
                  className="bg-[#090B0E] border border-[#252A33] rounded-lg p-3 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#F1F2F4]">
                      {meta.formula}
                    </span>
                    <span className="text-[10px] font-mono text-[#626B78]">
                      {meta.unit}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#929AA7] truncate">
                    {meta.name}
                  </div>
                  <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-[#252A33]/40">
                    <span className="text-base font-mono font-bold text-[#D9B674]">
                      {compKey === "k" ? Math.round(val) : val}
                    </span>
                    <span className="text-[10px] font-mono text-[#626B78]">
                      Valid: {meta.minValid}–{meta.maxValid} {meta.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Associated Expeditions & Returned Samples in this Region */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Associated Missions */}
          <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-3 shadow-sm">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold border-b border-[#252A33] pb-2 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-[#D9B674]" />
              <span>Landing Sites in Region ({associatedMissions.length})</span>
            </span>

            {associatedMissions.length === 0 ? (
              <p className="text-xs font-mono text-[#626B78] italic py-2">
                No returned-sample landing expeditions inside this bounding box.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {associatedMissions.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-[#090B0E] border border-[#252A33] rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-[#F1F2F4]">
                        {m.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#D9B674]">
                        {m.landingSiteName}
                      </div>
                      <div className="text-[10px] font-mono text-[#626B78]">
                        {m.landingCoordinates.latitude}°,{" "}
                        {m.landingCoordinates.longitude}°
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#F1F2F4]">
                        {m.totalMassReturnedKg} kg
                      </div>
                      <div className="text-[10px] font-mono text-[#626B78]">
                        returned
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Associated Samples */}
          <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-3 shadow-sm">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold border-b border-[#252A33] pb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#A599ED]" />
              <span>
                Returned Specimen Records ({associatedSamples.length})
              </span>
            </span>

            {associatedSamples.length === 0 ? (
              <p className="text-xs font-mono text-[#626B78] italic py-2">
                No cataloged returned specimens within this geographic quadrant.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {associatedSamples.map((s) => (
                  <Link
                    key={s.sampleId}
                    href={`/samples/${s.sampleId}`}
                    className="p-3 bg-[#090B0E] hover:bg-[#171B21] border border-[#252A33] hover:border-[#A599ED]/50 rounded-lg flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-[#F1F2F4] group-hover:text-[#A599ED] transition-colors">
                        Sample #{s.sampleId}
                      </div>
                      <div className="text-[11px] font-mono text-[#929AA7]">
                        {s.geologicalClassification}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-[#D9B674]">
                        {s.mission}
                      </div>
                      <div className="text-[10px] font-mono text-[#626B78]">
                        {s.weightGrams} g
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
