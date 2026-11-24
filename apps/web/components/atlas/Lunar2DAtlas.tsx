"use client";

import { findContainingCell } from "@/lib/dataClient";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import {
  clampLatitude,
  latLonToUV,
  normalizeLongitude,
} from "@lunar-atlas/lunar-geometry";
import {
  LunarMission,
  OrbitalObservationCell,
  ReturnedSample,
} from "@lunar-atlas/scientific-types";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface Lunar2DAtlasProps {
  orbitalCells: OrbitalObservationCell[];
  missions: LunarMission[];
  samples: ReturnedSample[];
}

export type AtlasProjection =
  | "equirectangular"
  | "orthographic_near"
  | "orthographic_far"
  | "polar_north"
  | "polar_south";

export const Lunar2DAtlas: React.FC<Lunar2DAtlasProps> = ({
  orbitalCells,
  missions,
  samples,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLayer = useObservatoryStore((s) => s.activeLayer);
  const layerOpacity = useObservatoryStore((s) => s.layerOpacity);
  const isGridVisible = useObservatoryStore((s) => s.isGridVisible);
  const isMissionsVisible = useObservatoryStore((s) => s.isMissionsVisible);
  const isSamplesVisible = useObservatoryStore((s) => s.isSamplesVisible);
  const selectedCoord = useObservatoryStore((s) => s.selectedCoord);
  const setSelectedLocation = useObservatoryStore((s) => s.setSelectedLocation);
  const isTraverseActive = useObservatoryStore((s) => s.isTraverseActive);
  const traversePoints = useObservatoryStore((s) => s.traversePoints);
  const addTraversePoint = useObservatoryStore((s) => s.addTraversePoint);

  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [overlayImg, setOverlayImg] = useState<HTMLImageElement | null>(null);
  const [projection, setProjection] =
    useState<AtlasProjection>("equirectangular");

  // Pan & Zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1.0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load images
  useEffect(() => {
    const bImg = new Image();
    bImg.src = "/data/textures/lunar_basemap_2048.jpg";
    bImg.onload = () => setBaseImg(bImg);
  }, []);

  useEffect(() => {
    if (activeLayer === "none") {
      setOverlayImg(null);
      return;
    }
    const oImg = new Image();
    oImg.src = `/data/textures/${activeLayer}_viridis_2048.jpg`;
    oImg.onload = () => setOverlayImg(oImg);
  }, [activeLayer]);

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050608";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Apply pan and zoom
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    // Fit 2:1 aspect ratio in canvas for equirectangular, or circular disc for orthographic
    const mapW = width;
    const mapH = width / 2;
    const mapX = 0;
    const mapY = (height - mapH) / 2;

    if (projection === "equirectangular") {
      // 1. Draw base mosaic
      if (baseImg) {
        ctx.drawImage(baseImg, mapX, mapY, mapW, mapH);
      }

      // 2. Draw overlay texture
      if (overlayImg && layerOpacity > 0) {
        ctx.globalAlpha = layerOpacity;
        ctx.drawImage(overlayImg, mapX, mapY, mapW, mapH);
        ctx.globalAlpha = 1.0;
      }

      // 3. Draw Geographic Grid
      if (isGridVisible) {
        ctx.strokeStyle = "#A9C9E8";
        ctx.lineWidth = 1 / transform.scale;
        ctx.globalAlpha = 0.25;

        // Parallels every 30 deg
        for (let lat = -60; lat <= 60; lat += 30) {
          const { v } = latLonToUV(lat, 0);
          const y = mapY + v * mapH;
          ctx.beginPath();
          ctx.moveTo(mapX, y);
          ctx.lineTo(mapX + mapW, y);
          ctx.stroke();

          // Label
          ctx.fillStyle = "#A9C9E8";
          ctx.font = `${10 / transform.scale}px monospace`;
          ctx.fillText(
            `${lat > 0 ? "+" : ""}${lat}°`,
            mapX + 8,
            y - 4 / transform.scale,
          );
        }

        // Meridians every 30 deg
        for (let lon = -150; lon <= 180; lon += 30) {
          const { u } = latLonToUV(0, lon);
          const x = mapX + u * mapW;
          ctx.beginPath();
          ctx.moveTo(x, mapY);
          ctx.lineTo(x, mapY + mapH);
          ctx.stroke();

          // Label
          ctx.fillStyle = "#A9C9E8";
          ctx.font = `${10 / transform.scale}px monospace`;
          ctx.fillText(
            `${lon}°`,
            x + 4 / transform.scale,
            mapY + 14 / transform.scale,
          );
        }
        ctx.globalAlpha = 1.0;
      }

      // 4. Draw Traverse Path & Waypoints
      if (traversePoints.length > 0) {
        ctx.strokeStyle = "#60C9D2";
        ctx.lineWidth = 2.5 / transform.scale;
        ctx.beginPath();

        traversePoints.forEach((pt, idx) => {
          const { u, v } = latLonToUV(pt.latitude, pt.longitude);
          const x = mapX + u * mapW;
          const y = mapY + v * mapH;

          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Draw waypoint circles
        traversePoints.forEach((pt, idx) => {
          const { u, v } = latLonToUV(pt.latitude, pt.longitude);
          const x = mapX + u * mapW;
          const y = mapY + v * mapH;

          ctx.fillStyle = idx === 0 ? "#60C9D2" : "#D9B674";
          ctx.beginPath();
          ctx.arc(x, y, 4.5 / transform.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#050608";
          ctx.lineWidth = 1.5 / transform.scale;
          ctx.stroke();
        });
      }

      // 5. Draw Missions
      if (isMissionsVisible) {
        missions.forEach((m) => {
          const { u, v } = latLonToUV(
            m.landingCoordinates.latitude,
            m.landingCoordinates.longitude,
          );
          const x = mapX + u * mapW;
          const y = mapY + v * mapH;

          // Outer beacon
          ctx.fillStyle = "#D9B674";
          ctx.beginPath();
          ctx.arc(x, y, 4 / transform.scale, 0, Math.PI * 2);
          ctx.fill();

          // Inner dot
          ctx.fillStyle = "#050608";
          ctx.beginPath();
          ctx.arc(x, y, 1.5 / transform.scale, 0, Math.PI * 2);
          ctx.fill();

          // Label if zoomed
          if (transform.scale >= 1.5) {
            ctx.fillStyle = "#F1F2F4";
            ctx.font = `bold ${10 / transform.scale}px monospace`;
            ctx.fillText(
              m.name,
              x + 6 / transform.scale,
              y + 3 / transform.scale,
            );
          }
        });
      }

      // 6. Draw Returned Samples
      if (isSamplesVisible) {
        samples.forEach((s) => {
          if (s.location.reviewStatus !== "verified") return;
          const { u, v } = latLonToUV(
            s.location.latitude,
            s.location.longitude,
          );
          const x = mapX + u * mapW;
          const y = mapY + v * mapH;

          ctx.fillStyle = "#A599ED";
          ctx.beginPath();
          ctx.arc(x, y, 2.5 / transform.scale, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 7. Draw Selected Location Crosshair
      if (selectedCoord) {
        const { u, v } = latLonToUV(
          selectedCoord.latitude,
          selectedCoord.longitude,
        );
        const selX = mapX + u * mapW;
        const selY = mapY + v * mapH;

        ctx.strokeStyle = "#60C9D2";
        ctx.lineWidth = 1.5 / transform.scale;

        ctx.beginPath();
        ctx.arc(selX, selY, 8 / transform.scale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#60C9D2";
        ctx.beginPath();
        ctx.arc(selX, selY, 2 / transform.scale, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Orthographic or Polar rendering mode: Render circular hemisphere viewport
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) * 0.42;

      // Draw hemisphere background mask
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      if (baseImg) {
        // Sample corresponding subquadrant
        let sx = 0;
        let sw = baseImg.width / 2;
        if (projection === "orthographic_far") {
          sx = baseImg.width / 2;
        } else if (projection === "polar_north") {
          sx = 0;
          sw = baseImg.width;
        }
        ctx.drawImage(
          baseImg,
          sx,
          0,
          sw,
          baseImg.height,
          cx - r,
          cy - r,
          r * 2,
          r * 2,
        );
      }

      if (overlayImg && layerOpacity > 0) {
        ctx.globalAlpha = layerOpacity;
        let sx = 0;
        let sw = overlayImg.width / 2;
        if (projection === "orthographic_far") {
          sx = overlayImg.width / 2;
        }
        ctx.drawImage(
          overlayImg,
          sx,
          0,
          sw,
          overlayImg.height,
          cx - r,
          cy - r,
          r * 2,
          r * 2,
        );
        ctx.globalAlpha = 1.0;
      }

      ctx.restore();

      // Hemisphere boundary circle
      ctx.strokeStyle = "#A9C9E8";
      ctx.lineWidth = 1.5 / transform.scale;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Center crosshair
      ctx.strokeStyle = "#252A33";
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy + 10);
      ctx.stroke();
    }

    ctx.restore();
  }, [
    baseImg,
    overlayImg,
    layerOpacity,
    isGridVisible,
    isMissionsVisible,
    isSamplesVisible,
    missions,
    samples,
    selectedCoord,
    transform,
    traversePoints,
    projection,
  ]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      render();
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  // Interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.8, Math.min(6.0, prev.scale * zoomFactor)),
    }));
  };

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Untransform click coords
    const canvasX = (clickX - transform.x) / transform.scale;
    const canvasY = (clickY - transform.y) / transform.scale;

    const mapW = canvas.width;
    const mapH = canvas.width / 2;
    const mapX = 0;
    const mapY = (canvas.height - mapH) / 2;

    if (
      canvasX >= mapX &&
      canvasX <= mapX + mapW &&
      canvasY >= mapY &&
      canvasY <= mapY + mapH
    ) {
      const u = (canvasX - mapX) / mapW;
      const v = (canvasY - mapY) / mapH;

      const lon = normalizeLongitude(u * 360.0 - 180.0);
      const lat = clampLatitude(90.0 - v * 180.0);

      const cell = findContainingCell(lat, lon, orbitalCells);
      setSelectedLocation({ latitude: lat, longitude: lon }, cell);

      if (isTraverseActive) {
        addTraversePoint({
          id: `pt_${Date.now()}`,
          latitude: lat,
          longitude: lon,
        });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-[#050608] cursor-crosshair select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        className="w-full h-full block"
      />

      {/* Floating map controls */}
      <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-1.5 bg-[#101318]/90 border border-[#252A33] rounded p-1 shadow-lg backdrop-blur">
        <button
          onClick={() =>
            setTransform((p) => ({
              ...p,
              scale: Math.min(6.0, p.scale * 1.25),
            }))
          }
          className="w-7 h-7 flex items-center justify-center text-[#F1F2F4] hover:bg-[#171B21] rounded text-sm font-mono"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() =>
            setTransform((p) => ({
              ...p,
              scale: Math.max(0.8, p.scale / 1.25),
            }))
          }
          className="w-7 h-7 flex items-center justify-center text-[#F1F2F4] hover:bg-[#171B21] rounded text-sm font-mono"
          title="Zoom out"
        >
          -
        </button>
        <button
          onClick={() => setTransform({ x: 0, y: 0, scale: 1.0 })}
          className="w-7 h-7 flex items-center justify-center text-[#929AA7] hover:text-[#F1F2F4] hover:bg-[#171B21] rounded text-xs font-mono"
          title="Reset View"
        >
          1:1
        </button>
      </div>

      {/* Projection Selector Pill */}
      <div className="absolute bottom-3 left-4 flex items-center gap-2 bg-[#090B0E]/90 px-3 py-1.5 rounded-lg border border-[#252A33] text-[10px] font-mono text-[#929AA7] shadow-lg backdrop-blur">
        <span className="text-[#626B78] uppercase">Projection:</span>
        <select
          value={projection}
          onChange={(e) => setProjection(e.target.value as AtlasProjection)}
          className="bg-[#171B21] border border-[#252A33] text-[#F1F2F4] rounded px-2 py-0.5 focus:outline-none focus:border-[#A9C9E8]"
        >
          <option value="equirectangular">
            Equirectangular (Plate Carrée, -180° to +180°)
          </option>
          <option value="orthographic_near">
            Orthographic (Near-side Centered, 0°)
          </option>
          <option value="orthographic_far">
            Orthographic (Far-side Centered, 180°)
          </option>
          <option value="polar_north">
            Polar Stereographic (North Pole, 90°N)
          </option>
          <option value="polar_south">
            Polar Stereographic (South Pole, 90°S)
          </option>
        </select>
        <span className="text-[#626B78]">Datum: IAU R=1,737.4 km</span>
      </div>
    </div>
  );
};
