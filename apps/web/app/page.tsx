"use client";

import dynamic from "next/dynamic";

const ObservatoryWorkspace = dynamic(
  () =>
    import("@/components/observatory/ObservatoryWorkspace").then(
      (mod) => mod.ObservatoryWorkspace,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen bg-[#050608] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#A9C9E8]/20 border-t-[#60C9D2] animate-spin" />
          <span className="text-xs font-mono text-[#929AA7] tracking-wider uppercase">
            Loading Lunar Geochemical Observatory...
          </span>
        </div>
      </div>
    ),
  },
);

export default function HomePage() {
  return <ObservatoryWorkspace />;
}
