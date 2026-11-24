"use client";

import { Header } from "@/components/layout/Header";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import {
  CHEMICAL_COMPONENTS,
  ChemicalComponentKey,
} from "@lunar-atlas/scientific-types";
import { Atom, Globe2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompositionPage() {
  const router = useRouter();
  const setActiveLayer = useObservatoryStore((s) => s.setActiveLayer);

  const categories = [
    {
      title: "Heat-Producing & Incompatible Elements",
      desc: "Elements concentrated in the residual liquid (urKREEP) of the Lunar Magma Ocean.",
      keys: ["th", "k", "u"] as ChemicalComponentKey[],
    },
    {
      title: "Major Rock-Forming Oxides",
      desc: "Principal oxides that discriminate between basaltic mare volcanism and anorthositic highlands crust.",
      keys: [
        "fe_o",
        "ti_o2",
        "al2_o3",
        "mg_o",
        "si_o2",
        "ca_o",
      ] as ChemicalComponentKey[],
    },
  ];

  const exploreElement = (key: ChemicalComponentKey) => {
    setActiveLayer(key);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col select-none">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-8">
        {/* Hero */}
        <div className="flex flex-col gap-2 border-b border-[#252A33] pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#60C9D2] uppercase tracking-wider font-semibold">
            <Atom className="w-4 h-4" />
            <span>Lunar Geochemical Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F2F4]">
            Global Elemental Abundance Layers
          </h1>
          <p className="text-sm text-[#929AA7] max-w-3xl leading-relaxed">
            The chemistry of the lunar surface provides the primary empirical
            test for models of planetary differentiation. Orbital gamma-ray and
            neutron spectroscopy from Lunar Prospector maps the surface
            distribution of refractory, volatile, and radioactive elements
            across both near-side and far-side terranes.
          </p>
        </div>

        {/* Categories */}
        {categories.map((cat) => (
          <div key={cat.title} className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold font-mono text-[#F1F2F4]">
                {cat.title}
              </h2>
              <p className="text-xs text-[#929AA7] mt-0.5">{cat.desc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.keys.map((key) => {
                const info = CHEMICAL_COMPONENTS[key];
                return (
                  <div
                    key={key}
                    className="bg-[#101318] border border-[#252A33] hover:border-[#60C9D2]/50 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all duration-200 group shadow-md"
                  >
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold font-mono text-[#F1F2F4] group-hover:text-[#60C9D2] transition-colors">
                          {info.formula}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#171B21] border border-[#252A33] text-[#929AA7]">
                          {info.unit}
                        </span>
                      </div>

                      <span className="text-xs font-mono text-[#A9C9E8] font-medium">
                        {info.name}
                      </span>

                      <p className="text-xs text-[#929AA7] leading-relaxed line-clamp-3">
                        {info.description}
                      </p>

                      {/* Typical Concentrations */}
                      <div className="mt-2 p-2.5 bg-[#090B0E] rounded-lg border border-[#252A33] flex flex-col gap-1 text-[11px] font-mono text-[#929AA7]">
                        <div className="flex justify-between">
                          <span>Typical Highlands:</span>
                          <span className="text-[#F1F2F4]">
                            {info.typicalHighlands} {info.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Typical Mare:</span>
                          <span className="text-[#F1F2F4]">
                            {info.typicalMare} {info.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Physical Range:</span>
                          <span className="text-[#60C9D2]">
                            {info.minValid} – {info.maxValid} {info.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#252A33]">
                      <span className="text-[10px] font-mono text-[#626B78]">
                        LP GRS Level 5
                      </span>
                      <button
                        onClick={() => exploreElement(key)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#171B21] hover:bg-[#252A33] border border-[#252A33] hover:border-[#60C9D2] text-xs font-mono text-[#60C9D2] transition-colors"
                      >
                        <Globe2 className="w-3.5 h-3.5" />
                        <span>Explore Layer</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
