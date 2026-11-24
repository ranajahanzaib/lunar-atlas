"use client";

import { Header } from "@/components/layout/Header";
import { DigitalMicroscope } from "@/components/microscopy/DigitalMicroscope";
import { fetchReturnedSamples } from "@/lib/dataClient";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { calculateMolarMgNumber } from "@lunar-atlas/lunar-geometry";
import {
  CHEMICAL_COMPONENTS,
  ChemicalComponentKey,
  ReturnedSample,
} from "@lunar-atlas/scientific-types";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Globe2,
  Microscope,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SampleDetailClient({ sampleId }: { sampleId: string }) {
  const router = useRouter();

  const [sample, setSample] = useState<ReturnedSample | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const flyTo = useObservatoryStore((s) => s.flyTo);
  const setSelectedLocation = useObservatoryStore((s) => s.setSelectedLocation);

  useEffect(() => {
    async function load() {
      const allSamples = await fetchReturnedSamples();
      const match = allSamples.find((s) => s.sampleId === sampleId);
      setSample(match || null);
      setIsLoading(false);
    }
    load();
  }, [sampleId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center text-xs font-mono text-[#929AA7]">
        Loading sample #{sampleId} record...
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="text-base font-mono text-[#F1F2F4]">
            Sample #{sampleId} not found
          </span>
          <Link
            href="/samples"
            className="text-xs font-mono text-[#60C9D2] hover:underline"
          >
            ← Return to Samples Catalog
          </Link>
        </div>
      </div>
    );
  }

  const mgNum =
    sample.bulkComposition.mg_o && sample.bulkComposition.fe_o
      ? calculateMolarMgNumber(
          sample.bulkComposition.mg_o,
          sample.bulkComposition.fe_o,
        )
      : null;

  const navigateToGlobe = () => {
    if (sample.location.reviewStatus === "verified") {
      flyTo(sample.location.latitude, sample.location.longitude, 3.5);
      setSelectedLocation(
        {
          latitude: sample.location.latitude,
          longitude: sample.location.longitude,
        },
        null,
      );
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col select-none">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between border-b border-[#252A33] pb-4">
          <Link
            href="/samples"
            className="flex items-center gap-1.5 text-xs font-mono text-[#929AA7] hover:text-[#F1F2F4] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sample Catalog</span>
          </Link>

          <button
            onClick={navigateToGlobe}
            className="flex items-center gap-1.5 bg-[#101318] hover:bg-[#171B21] border border-[#252A33] hover:border-[#60C9D2] px-3 py-1.5 rounded-lg text-xs font-mono text-[#F1F2F4] transition-colors shadow-sm"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#60C9D2]" />
            <span>Locate on Lunar Globe</span>
          </button>
        </div>

        {/* Specimen Title & Classification */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#A599ED] font-semibold uppercase tracking-wider">
                Digital Specimen Record
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171B21] border border-[#252A33] text-[#929AA7]">
                Canonical ID: {sample.canonicalId}
              </span>
            </div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-[#F1F2F4] mt-1">
              Sample #{sample.sampleId}
            </h1>
            <p className="text-sm font-mono text-[#A9C9E8] mt-0.5">
              {sample.geologicalClassification} ({sample.mission})
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
                Mass
              </div>
              <div className="text-lg font-mono font-bold text-[#F1F2F4]">
                {sample.weightGrams} g
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Digital Microscopy Suite */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <Microscope className="w-4 h-4 text-[#A599ED]" />
              <span>Petrographic Thin-Section Microscopy Suite</span>
            </span>
            <span className="text-[11px] font-mono text-[#626B78]">
              Crossed Nicols (XPL) & Plane Polarized Light (PPL)
            </span>
          </div>

          <DigitalMicroscope sample={sample} />
        </div>

        {/* Two-Column Metadata and Geochemistry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Provenance & Geological Context */}
          <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold border-b border-[#252A33] pb-2">
              Collection Provenance & Context
            </span>

            <div className="flex flex-col gap-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#252A33]/50">
                <span className="text-[#626B78]">Mission:</span>
                <span className="text-[#F1F2F4] font-medium">
                  {sample.mission}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#252A33]/50">
                <span className="text-[#626B78]">Collection Date:</span>
                <span className="text-[#F1F2F4] font-medium">
                  {sample.collectionDate}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#252A33]/50">
                <span className="text-[#626B78]">Collection Station:</span>
                <span className="text-[#D9B674] font-medium">
                  {sample.location.stationName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#252A33]/50">
                <span className="text-[#626B78]">Coordinates:</span>
                <span className="text-[#F1F2F4] font-medium">
                  {sample.location.latitude.toFixed(4)}°,{" "}
                  {sample.location.longitude.toFixed(4)}°
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#252A33]/50">
                <span className="text-[#626B78]">Location Precision:</span>
                <span className="text-[#60C9D2] font-medium uppercase text-[11px]">
                  {sample.location.precision.replace("_", " ")} (±
                  {sample.location.uncertaintyRadiusMeters} m)
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-[#252A33]/50 gap-0.5">
                <span className="text-[#626B78] shrink-0">
                  Curatorial Facility:
                </span>
                <span className="text-[#929AA7] text-[11px] sm:text-right">
                  {sample.curationFacility}
                </span>
              </div>
            </div>

            {/* Geological Description */}
            <div className="mt-2 flex flex-col gap-1.5">
              <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold">
                Petrogenesis & Petrography
              </span>
              <p className="text-xs text-[#929AA7] leading-relaxed">
                {sample.description}
              </p>
            </div>

            {/* Source Reference Links */}
            <div className="mt-3 pt-3 border-t border-[#252A33] flex flex-col gap-2">
              <span className="text-[11px] font-mono text-[#626B78] uppercase">
                Authoritative Compendium Source:
              </span>
              <a
                href={
                  sample.location.sourceUrl ||
                  "https://curator.jsc.nasa.gov/lunar/lsc/"
                }
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-[#60C9D2] hover:underline flex items-center gap-1.5 truncate"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {sample.location.sourceDocument}
                </span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>

          {/* Right Column: Quantitative Bulk Geochemistry */}
          <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold border-b border-[#252A33] pb-2">
              Quantitative Geochemical Composition (Astromat / Compendium)
            </span>

            <div className="flex flex-col gap-2">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-[#626B78] text-[10px] uppercase border-b border-[#252A33]">
                    <th className="text-left py-1.5 font-normal">Component</th>
                    <th className="text-right py-1.5 font-normal">
                      Concentration
                    </th>
                    <th className="text-right py-1.5 font-normal">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252A33]/40">
                  {Object.entries(sample.bulkComposition).map(([key, val]) => {
                    const compKey = key as ChemicalComponentKey;
                    const meta = CHEMICAL_COMPONENTS[compKey];
                    if (!meta || val === undefined) return null;

                    return (
                      <tr key={key} className="hover:bg-[#171B21]/50">
                        <td className="py-2 text-[#F1F2F4] font-medium">
                          {meta.formula}{" "}
                          <span className="text-[#626B78] text-[10px]">
                            ({meta.name})
                          </span>
                        </td>
                        <td className="py-2 text-right font-bold text-[#F1F2F4]">
                          {compKey === "k" ? Math.round(val) : val}
                        </td>
                        <td className="py-2 text-right text-[#929AA7]">
                          {meta.unit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-4 p-3 bg-[#090B0E] rounded-lg border border-[#252A33] flex flex-col gap-1 text-[11px] font-mono text-[#929AA7]">
                <div className="flex justify-between">
                  <span>Astromat Measurements Recorded:</span>
                  <span className="text-[#F1F2F4] font-semibold">
                    {sample.measurementsCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Peer-Reviewed Publications:</span>
                  <span className="text-[#F1F2F4] font-semibold">
                    {sample.publicationsCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
