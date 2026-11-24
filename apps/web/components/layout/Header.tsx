"use client";

import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { Globe2, Map, Maximize2, Search, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const viewMode = useObservatoryStore((s) => s.viewMode);
  const setViewMode = useObservatoryStore((s) => s.setViewMode);
  const lightingMode = useObservatoryStore((s) => s.lightingMode);
  const setLightingMode = useObservatoryStore((s) => s.setLightingMode);
  const setCommandPaletteOpen = useObservatoryStore(
    (s) => s.setCommandPaletteOpen,
  );

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const navLinks = [
    { href: "/", label: "Explore", active: pathname === "/" },
    {
      href: "/composition",
      label: "Composition",
      active: pathname.startsWith("/composition"),
    },
    {
      href: "/regions",
      label: "Regions",
      active: pathname.startsWith("/regions"),
    },
    {
      href: "/samples",
      label: "Samples",
      active: pathname.startsWith("/samples"),
    },
    {
      href: "/missions",
      label: "Missions",
      active: pathname.startsWith("/missions"),
    },
    {
      href: "/compare",
      label: "Compare",
      active: pathname.startsWith("/compare"),
    },
    {
      href: "/research",
      label: "Research",
      active: pathname.startsWith("/research"),
    },
    {
      href: "/methodology",
      label: "Methodology",
      active: pathname.startsWith("/methodology"),
    },
  ];

  return (
    <header className="h-13 bg-[#090B0E]/95 border-b border-[#252A33] px-4 flex items-center justify-between z-30 select-none backdrop-blur-md">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#171B21] to-[#3B4352] border border-[#A9C9E8]/40 flex items-center justify-center shadow-inner group-hover:border-[#A9C9E8] transition-colors">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F1F2F4] opacity-90 shadow-sm" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-widest text-[#F1F2F4] uppercase font-mono">
              Lunar Atlas
            </span>
            <span className="text-[10px] text-[#626B78] font-mono tracking-tight -mt-0.5">
              Geochemical Observatory
            </span>
          </div>
        </Link>
      </div>

      {/* Primary Navigation */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#101318]/70 p-1 rounded-md border border-[#252A33]/80">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              link.active
                ? "bg-[#171B21] text-[#F1F2F4] border border-[#252A33] shadow-sm"
                : "text-[#929AA7] hover:text-[#F1F2F4] hover:bg-[#171B21]/50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Control Actions */}
      <div className="flex items-center gap-2">
        {/* Search Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 bg-[#101318] hover:bg-[#171B21] text-[#929AA7] hover:text-[#F1F2F4] border border-[#252A33] rounded px-2.5 py-1 text-xs transition-colors font-mono"
          title="Search anything (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-block bg-[#090B0E] border border-[#252A33] rounded px-1.5 py-0.2 text-[10px] text-[#626B78]">
            ⌘K
          </kbd>
        </button>

        {/* View Mode Toggle: 3D Globe vs 2D Atlas */}
        <div className="flex items-center bg-[#101318] border border-[#252A33] rounded p-0.5">
          <button
            onClick={() => setViewMode("3d_globe")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "3d_globe"
                ? "bg-[#171B21] text-[#A9C9E8] shadow-sm"
                : "text-[#626B78] hover:text-[#929AA7]"
            }`}
            title="3D Navigable Lunar Globe"
          >
            <Globe2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("2d_equirectangular")}
            className={`p-1.5 rounded transition-colors ${
              viewMode === "2d_equirectangular"
                ? "bg-[#171B21] text-[#A9C9E8] shadow-sm"
                : "text-[#626B78] hover:text-[#929AA7]"
            }`}
            title="2D Equirectangular Lunar Map"
          >
            <Map className="w-4 h-4" />
          </button>
        </div>

        {/* Lighting Mode Toggle */}
        <button
          onClick={() =>
            setLightingMode(
              lightingMode === "scientific_neutral"
                ? "solar_terminator"
                : "scientific_neutral",
            )
          }
          className={`p-1.5 rounded border border-[#252A33] transition-colors ${
            lightingMode === "solar_terminator"
              ? "bg-[#171B21] text-[#D9B674]"
              : "bg-[#101318] text-[#626B78] hover:text-[#929AA7]"
          }`}
          title={
            lightingMode === "scientific_neutral"
              ? "Switch to Solar Terminator Lighting"
              : "Switch to Neutral Scientific Illumination"
          }
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullScreen}
          className="p-1.5 rounded bg-[#101318] hover:bg-[#171B21] text-[#626B78] hover:text-[#F1F2F4] border border-[#252A33] transition-colors hidden sm:block"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
