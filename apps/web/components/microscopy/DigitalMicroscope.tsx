"use client";

import { ReturnedSample } from "@lunar-atlas/scientific-types";
import {
  Crosshair,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import React, { useRef, useState } from "react";

interface DigitalMicroscopeProps {
  sample: ReturnedSample;
}

export const DigitalMicroscope: React.FC<DigitalMicroscopeProps> = ({
  sample,
}) => {
  const [polarizationMode, setPolarizationMode] = useState<"ppl" | "xpl">(
    "xpl",
  );
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showReticle, setShowReticle] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Determine available image paths
  const pplPath = `/data/samples/${sample.sampleId}_ppl.jpg`;
  const xplPath = `/data/samples/${sample.sampleId}_xpl.jpg`;
  const activeImagePath = polarizationMode === "xpl" ? xplPath : pplPath;

  // Physical scale calibration: default ~1.25 microns/pixel at 1x
  const baseMicronsPerPixel = 1.25;
  const currentMicronsPerPixel = baseMicronsPerPixel / zoom;

  // Desired on-screen scale bar length in pixels: ~120px
  const targetPixels = 120;
  const rawMicrons = targetPixels * currentMicronsPerPixel;

  // Nice round number for scale bar (e.g. 100, 250, 500, 1000, 2000 um)
  let scaleBarMicrons = 500;
  if (rawMicrons < 150) scaleBarMicrons = 100;
  else if (rawMicrons < 350) scaleBarMicrons = 250;
  else if (rawMicrons < 750) scaleBarMicrons = 500;
  else if (rawMicrons < 1500) scaleBarMicrons = 1000;
  else scaleBarMicrons = 2000;

  const scaleBarPixels = scaleBarMicrons / currentMicronsPerPixel;
  const scaleBarLabel =
    scaleBarMicrons >= 1000
      ? `${scaleBarMicrons / 1000} mm`
      : `${scaleBarMicrons} μm`;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.2 : 0.83;
    setZoom((z) => Math.min(8.0, Math.max(0.6, z * factor)));
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden border border-[#252A33] bg-[#050608] flex flex-col select-none transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-[500px]"
      }`}
    >
      {/* Top Microscope Controls Toolbar */}
      <div className="h-11 bg-[#101318]/95 border-b border-[#252A33] px-3 flex items-center justify-between text-xs z-20 backdrop-blur">
        {/* Left: Mode Selection */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[#929AA7] text-[11px] uppercase mr-1">
            Polarization:
          </span>
          <button
            onClick={() => setPolarizationMode("ppl")}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
              polarizationMode === "ppl"
                ? "bg-[#171B21] text-[#60C9D2] border border-[#60C9D2]/50 shadow-sm"
                : "text-[#929AA7] hover:text-[#F1F2F4] hover:bg-[#171B21]"
            }`}
          >
            PPL (Plane Polarized)
          </button>
          <button
            onClick={() => setPolarizationMode("xpl")}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
              polarizationMode === "xpl"
                ? "bg-[#171B21] text-[#A599ED] border border-[#A599ED]/50 shadow-sm"
                : "text-[#929AA7] hover:text-[#F1F2F4] hover:bg-[#171B21]"
            }`}
          >
            XPL (Cross Polarized)
          </button>
        </div>

        {/* Right: Optical tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(8.0, z * 1.3))}
            className="p-1.5 rounded hover:bg-[#171B21] text-[#929AA7] hover:text-[#F1F2F4]"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z / 1.3))}
            className="p-1.5 rounded hover:bg-[#171B21] text-[#929AA7] hover:text-[#F1F2F4]"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded hover:bg-[#171B21] text-[#929AA7] hover:text-[#F1F2F4]"
            title="Reset Zoom & Pan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowReticle(!showReticle)}
            className={`p-1.5 rounded ${
              showReticle ? "text-[#60C9D2]" : "text-[#626B78]"
            } hover:bg-[#171B21]`}
            title="Toggle Petrographic Reticle"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-[#171B21] text-[#929AA7] hover:text-[#F1F2F4] ml-1"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Viewing Area */}
      <div
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#050608]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Specimen Micrograph Image */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <img
            src={activeImagePath}
            alt={`Sample ${sample.sampleId} thin section in ${polarizationMode.toUpperCase()}`}
            className="max-w-none w-[1024px] h-[768px] object-cover pointer-events-none rounded shadow-2xl"
          />
        </div>

        {/* Optical Crosshair Reticle Overlay */}
        {showReticle && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
            <div className="absolute w-full h-[1px] bg-[#A9C9E8]" />
            <div className="absolute h-full w-[1px] bg-[#A9C9E8]" />
            <div className="w-24 h-24 rounded-full border border-[#A9C9E8]" />
          </div>
        )}

        {/* Calibrated Physical Scale Bar */}
        <div className="absolute bottom-4 left-4 z-20 bg-[#101318]/90 border border-[#252A33] rounded px-3 py-2 shadow-lg backdrop-blur flex flex-col gap-1.5 font-mono text-xs min-w-[150px]">
          <div className="flex items-center justify-between gap-4 text-[11px] text-[#F1F2F4]">
            <span className="text-[#929AA7]">Field of View</span>
            <span className="text-[#60C9D2] font-semibold">
              {(zoom * 10).toFixed(0)}x Mag
            </span>
          </div>
          {/* Visual scale bar line */}
          <div className="flex flex-col items-center gap-1 mt-0.5">
            <div
              className="h-1 bg-[#F1F2F4] border-x-2 border-[#60C9D2]"
              style={{ width: `${scaleBarPixels}px` }}
            />
            <span className="text-[10px] text-[#929AA7] font-semibold">
              {scaleBarLabel}
            </span>
          </div>
        </div>

        {/* Optical Mode Indicator Tag */}
        <div className="absolute bottom-4 right-4 z-20 bg-[#101318]/90 border border-[#252A33] rounded px-2.5 py-1 text-[11px] font-mono text-[#929AA7] shadow-lg backdrop-blur">
          {polarizationMode === "xpl"
            ? "Crossed Nicols (XPL)"
            : "Parallel Light (PPL)"}{" "}
          • Aperture 0.75 NA
        </div>
      </div>
    </div>
  );
};
