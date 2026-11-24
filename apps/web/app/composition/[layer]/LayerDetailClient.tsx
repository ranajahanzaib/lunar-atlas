"use client";

import { Header } from "@/components/layout/Header";
import { fetchOrbitalObservations } from "@/lib/dataClient";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import {
  CHEMICAL_COMPONENTS,
  ChemicalComponentKey,
  OrbitalObservationCell,
} from "@lunar-atlas/scientific-types";
import { ArrowLeft, Globe2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LayerDetailClient({ layerKey }: { layerKey: string }) {
  const router = useRouter();
  const compKey = layerKey as ChemicalComponentKey;
  const meta = CHEMICAL_COMPONENTS[compKey];

  const [, setCells] = useState<OrbitalObservationCell[]>([]);
  const [stats, setStats] = useState<{
    min: number;
    max: number;
    mean: number;
    std: number;
    count: number;
  } | null>(null);

  const setActiveLayer = useObservatoryStore((s) => s.setActiveLayer);

  useEffect(() => {
    async function load() {
      const data = await fetchOrbitalObservations();
      setCells(data);

      const values = data
        .map((c) => c.abundances[compKey])
        .filter((v): v is number => v !== undefined && !isNaN(v));

      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;
        const variance =
          values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) /
          values.length;
        const std = Math.sqrt(variance);

        setStats({
          min,
          max,
          mean,
          std,
          count: values.length,
        });
      }
    }
    load();
  }, [compKey]);

  if (!meta) {
    return (
      <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="text-base font-mono text-[#F1F2F4]">
            Elemental layer &apos;{layerKey}&apos; not found
          </span>
          <Link
            href="/composition"
            className="text-xs font-mono text-[#60C9D2] hover:underline"
          >
            ← Return to Composition Explorer
          </Link>
        </div>
      </div>
    );
  }

  const navigateToGlobeWithLayer = () => {
    setActiveLayer(compKey);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col select-none">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-[#252A33] pb-4">
          <Link
            href="/composition"
            className="flex items-center gap-1.5 text-xs font-mono text-[#929AA7] hover:text-[#F1F2F4] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Composition Explorer</span>
          </Link>

          <button
            onClick={navigateToGlobeWithLayer}
            className="flex items-center gap-1.5 bg-[#101318] hover:bg-[#171B21] border border-[#252A33] hover:border-[#60C9D2] px-3 py-1.5 rounded-lg text-xs font-mono text-[#F1F2F4] transition-colors shadow-sm"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#60C9D2]" />
            <span>View Layer on 3D Globe</span>
          </button>
        </div>

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#60C9D2] font-semibold uppercase tracking-wider">
                Orbital Geochemical Layer
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171B21] border border-[#252A33] text-[#929AA7]">
                Product: LP-L-GRS-5-ELEM-ABUNDANCE-V1.0
              </span>
            </div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-[#F1F2F4] mt-1">
              {meta.formula} — {meta.name}
            </h1>
            <p className="text-sm font-mono text-[#A9C9E8] mt-0.5">
              Native Display Unit: {meta.unit} (
              {meta.category.replace("_", " ")})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#101318] border border-[#252A33] rounded-lg px-3 py-2 text-right">
              <div className="text-[10px] font-mono text-[#626B78] uppercase">
                Valid Range
              </div>
              <div className="text-lg font-mono font-bold text-[#F1F2F4]">
                {meta.minValid} – {meta.maxValid} {meta.unit}
              </div>
            </div>
            <div className="bg-[#101318] border border-[#60C9D2]/40 rounded-lg px-3 py-2 text-right">
              <div className="text-[10px] font-mono text-[#626B78] uppercase">
                Valid Cells
              </div>
              <div className="text-lg font-mono font-bold text-[#60C9D2]">
                {stats ? stats.count.toLocaleString() : "1,652"}
              </div>
            </div>
          </div>
        </div>

        {/* Scientific Disclosure Box for Uranium / Ratios */}
        {compKey === "u" && (
          <div className="bg-[#D9B674]/10 border border-[#D9B674]/30 rounded-xl p-4 flex items-start gap-3 text-xs font-mono text-[#F1F2F4]">
            <ShieldAlert className="w-5 h-5 text-[#D9B674] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[#D9B674] uppercase tracking-wider">
                Mandatory Planetary Science Protocol Disclosure: Uranium
                Abundance Constraint
              </span>
              <p className="text-[#929AA7] leading-relaxed">
                In Lunar Prospector Level 5 elemental abundance products,
                gamma-ray emissions from natural uranium decay daughter isotopes
                (Bi-214) are constrained to thorium using the canonical lunar
                geochemical ratio: <strong>U = Th / 3.8</strong>. This
                constraint must be explicitly disclosed when citing orbital
                uranium estimates.
              </p>
            </div>
          </div>
        )}

        {/* Planetary Geochemistry & Petrology */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold border-b border-[#252A33] pb-2">
              Planetary Petrology & Significance
            </span>
            <p className="text-sm text-[#F1F2F4] leading-relaxed">
              {meta.description}
            </p>

            <div className="p-3 bg-[#090B0E] rounded-lg border border-[#252A33] flex flex-col gap-1.5 text-xs font-mono">
              <span className="text-[#60C9D2] font-semibold uppercase text-[11px]">
                Analytical Instrument & Ingestion Specification
              </span>
              <p className="text-[#929AA7] leading-relaxed">
                Measured by the Lunar Prospector Gamma-Ray Spectrometer
                (Prettyman et al., 2006). Observations integrate over
                ~100–10,000 km² footprints to an effective sampling depth of
                approximately 30–40 cm in the upper regolith.
              </p>
            </div>
          </div>

          {/* Statistical Distribution Card */}
          <div className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-3 shadow-sm text-xs font-mono">
            <span className="text-xs font-mono text-[#929AA7] uppercase tracking-wider font-semibold border-b border-[#252A33] pb-2">
              Global Equal-Area Statistics
            </span>

            {stats ? (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between py-1 border-b border-[#252A33]/50">
                  <span className="text-[#626B78]">Global Mean:</span>
                  <span className="text-[#F1F2F4] font-bold">
                    {stats.mean.toFixed(2)} {meta.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252A33]/50">
                  <span className="text-[#626B78]">Std Deviation (1σ):</span>
                  <span className="text-[#929AA7]">
                    ±{stats.std.toFixed(2)} {meta.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252A33]/50">
                  <span className="text-[#626B78]">Observed Min:</span>
                  <span className="text-[#929AA7]">
                    {stats.min.toFixed(2)} {meta.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#252A33]/50">
                  <span className="text-[#626B78]">Observed Max:</span>
                  <span className="text-[#D9B674] font-bold">
                    {stats.max.toFixed(2)} {meta.unit}
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-[#626B78]">
                  Derived from 1,652 5° equal-area pixels on IAU lunar sphere.
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#626B78] italic">
                Computing distribution metrics...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
