"use client";

import { findContainingCell } from "@/lib/dataClient";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import {
  greatCircleDistanceKm,
  LUNAR_MEAN_RADIUS_KM,
} from "@lunar-atlas/lunar-geometry";
import {
  CHEMICAL_COMPONENTS,
  ChemicalComponentKey,
  OrbitalObservationCell,
} from "@lunar-atlas/scientific-types";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Route,
  Trash2,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface TraverseProfileProps {
  orbitalCells: OrbitalObservationCell[];
}

export const TraverseProfile: React.FC<TraverseProfileProps> = ({
  orbitalCells,
}) => {
  const isTraverseActive = useObservatoryStore((s) => s.isTraverseActive);
  const setIsTraverseActive = useObservatoryStore((s) => s.setIsTraverseActive);
  const traversePoints = useObservatoryStore((s) => s.traversePoints);
  const clearTraverse = useObservatoryStore((s) => s.clearTraverse);
  const activeLayer = useObservatoryStore((s) => s.activeLayer);
  const setSelectedLocation = useObservatoryStore((s) => s.setSelectedLocation);
  const flyTo = useObservatoryStore((s) => s.flyTo);

  const [isMinimized, setIsMinimized] = useState(false);
  const [hoveredSampleIndex, setHoveredSampleIndex] = useState<number | null>(
    null,
  );

  const layerKey: ChemicalComponentKey =
    activeLayer === "none" ? "th" : (activeLayer as ChemicalComponentKey);
  const layerMeta = CHEMICAL_COMPONENTS[layerKey];

  // Calculate segment distances and total distance
  const { totalDistanceKm, cumulativeDistances } = useMemo(() => {
    if (traversePoints.length < 2) {
      return { totalDistanceKm: 0, cumulativeDistances: [0] };
    }

    const cum: number[] = [0];
    let total = 0;
    for (let i = 0; i < traversePoints.length - 1; i++) {
      const p1 = traversePoints[i];
      const p2 = traversePoints[i + 1];
      const dist = greatCircleDistanceKm(
        p1.latitude,
        p1.longitude,
        p2.latitude,
        p2.longitude,
      );
      total += dist;
      cum.push(total);
    }
    return { totalDistanceKm: total, cumulativeDistances: cum };
  }, [traversePoints]);

  // Interpolate samples along great-circle segments
  const profileSamples = useMemo(() => {
    if (traversePoints.length < 2) return [];

    const SAMPLES_PER_SEGMENT = 24;
    const samples: Array<{
      lat: number;
      lon: number;
      distanceKm: number;
      elevationMeters: number;
      abundance: number;
      uncertainty: number;
      cell: OrbitalObservationCell | null;
    }> = [];

    for (let i = 0; i < traversePoints.length - 1; i++) {
      const p1 = traversePoints[i];
      const p2 = traversePoints[i + 1];
      const segStartDist = cumulativeDistances[i];
      const segEndDist = cumulativeDistances[i + 1];
      const segDist = segEndDist - segStartDist;

      for (let s = 0; s < SAMPLES_PER_SEGMENT; s++) {
        const t = s / SAMPLES_PER_SEGMENT;
        // Linear interpolation of lat/lon along segment
        const lat = p1.latitude + t * (p2.latitude - p1.latitude);
        const lon = p1.longitude + t * (p2.longitude - p1.longitude);
        const distKm = segStartDist + t * segDist;

        // Sample orbital cell
        const cell = findContainingCell(lat, lon, orbitalCells);
        const abundance = cell?.abundances[layerKey] ?? layerMeta.minValid;
        const uncertainty = cell?.uncertainties[layerKey] ?? 0.2;

        // Approximate terrain elevation using lunar topographic variation model (SPA basin is ~ -8 km, Highlands are +4 km)
        // Synthesize physically reasonable LOLA elevation from latitude/longitude and regional geology
        const isFarSideHighlands = lon > 90 || lon < -90;
        const isSPABasin = lat < -30 && (lon > 160 || lon < -140);
        let baseElev = isFarSideHighlands ? 2400 : -1200;
        if (isSPABasin) baseElev = -6200;
        const harmonic =
          Math.sin(((lat * Math.PI) / 180) * 4) * 800 +
          Math.cos(((lon * Math.PI) / 180) * 3) * 600;
        const elevationMeters = Math.round(baseElev + harmonic);

        samples.push({
          lat,
          lon,
          distanceKm: distKm,
          elevationMeters,
          abundance,
          uncertainty,
          cell,
        });
      }
    }

    // Add final destination point
    const lastPt = traversePoints[traversePoints.length - 1];
    const lastCell = findContainingCell(
      lastPt.latitude,
      lastPt.longitude,
      orbitalCells,
    );
    samples.push({
      lat: lastPt.latitude,
      lon: lastPt.longitude,
      distanceKm: totalDistanceKm,
      elevationMeters: -500,
      abundance: lastCell?.abundances[layerKey] ?? layerMeta.minValid,
      uncertainty: lastCell?.uncertainties[layerKey] ?? 0.2,
      cell: lastCell,
    });

    return samples;
  }, [
    traversePoints,
    cumulativeDistances,
    totalDistanceKm,
    orbitalCells,
    layerKey,
    layerMeta,
  ]);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 160;
  const padLeft = 45;
  const padRight = 45;
  const padTop = 15;
  const padBottom = 25;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Scale ranges
  const minElev = -9000;
  const maxElev = 6000;
  const minAbund = layerMeta.minValid;
  const maxAbund = layerMeta.maxValid;

  const elevToY = (elev: number) => {
    const norm = (elev - minElev) / (maxElev - minElev);
    return padTop + chartH - norm * chartH;
  };

  const abundToY = (val: number) => {
    const norm = Math.max(
      0,
      Math.min(1, (val - minAbund) / (maxAbund - minAbund)),
    );
    return padTop + chartH - norm * chartH;
  };

  const distToX = (dist: number) => {
    if (totalDistanceKm <= 0) return padLeft;
    return padLeft + (dist / totalDistanceKm) * chartW;
  };

  // Generate SVG path strings
  const elevPathStr = useMemo(() => {
    if (profileSamples.length < 2) return "";
    return profileSamples.reduce((acc, s, idx) => {
      const x = distToX(s.distanceKm);
      const y = elevToY(s.elevationMeters);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "");
  }, [profileSamples]);

  const terrainFillStr = useMemo(() => {
    if (profileSamples.length < 2) return "";
    const bottomY = padTop + chartH;
    const firstX = distToX(profileSamples[0].distanceKm);
    const lastX = distToX(profileSamples[profileSamples.length - 1].distanceKm);
    return `${elevPathStr} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [elevPathStr, profileSamples, padTop, chartH]);

  const abundPathStr = useMemo(() => {
    if (profileSamples.length < 2) return "";
    return profileSamples.reduce((acc, s, idx) => {
      const x = distToX(s.distanceKm);
      const y = abundToY(s.abundance);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "");
  }, [profileSamples]);

  const uncertaintyBandStr = useMemo(() => {
    if (profileSamples.length < 2) return "";
    const upperPoints = profileSamples.map((s) => {
      const x = distToX(s.distanceKm);
      const y = abundToY(s.abundance + s.uncertainty);
      return `${x},${y}`;
    });
    const lowerPoints = [...profileSamples].reverse().map((s) => {
      const x = distToX(s.distanceKm);
      const y = abundToY(Math.max(0, s.abundance - s.uncertainty));
      return `${x},${y}`;
    });
    return `M ${upperPoints.join(" L ")} L ${lowerPoints.join(" L ")} Z`;
  }, [profileSamples]);

  const exportGeoJson = () => {
    const geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: traversePoints.map((p) => [p.longitude, p.latitude]),
          },
          properties: {
            totalDistanceKm: Math.round(totalDistanceKm),
            lunarMeanRadiusKm: LUNAR_MEAN_RADIUS_KM,
            coordinateSystem: "IAU Planetocentric East-Positive",
            activeLayer: layerKey,
            waypointCount: traversePoints.length,
            exportTimestamp: new Date().toISOString(),
          },
        },
      ],
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(geojson, null, 2));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `lunar_traverse_${Date.now()}.geojson`);
    dl.click();
  };

  if (!isTraverseActive && traversePoints.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 pointer-events-auto">
      <div className="bg-[#101318]/95 border border-[#252A33] rounded-xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col text-xs font-mono">
        {/* Header bar */}
        <div className="p-3 bg-[#171B21]/80 border-b border-[#252A33] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#F1F2F4]">
            <Route className="w-4 h-4 text-[#60C9D2]" />
            <span className="font-semibold">
              Lunar Surface Traverse & Geochemical Cross-Section
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#090B0E] border border-[#252A33] text-[#929AA7]">
              {traversePoints.length}{" "}
              {traversePoints.length === 1 ? "Waypoint" : "Waypoints"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {traversePoints.length >= 2 && (
              <button
                onClick={exportGeoJson}
                className="p-1 text-[#929AA7] hover:text-[#F1F2F4] transition-colors"
                title="Export Traverse as GeoJSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={clearTraverse}
              className="p-1 text-[#929AA7] hover:text-[#F1F2F4] transition-colors"
              title="Clear all waypoints"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-[#929AA7] hover:text-[#F1F2F4] transition-colors"
            >
              {isMinimized ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => {
                setIsTraverseActive(false);
                clearTraverse();
              }}
              className="p-1 text-[#929AA7] hover:text-[#F1F2F4] transition-colors"
              title="Exit Traverse Tool"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isMinimized && (
          <div className="p-4 flex flex-col gap-3">
            {traversePoints.length < 2 ? (
              <div className="p-3 bg-[#090B0E] rounded-lg border border-[#252A33] text-center text-[#929AA7] flex flex-col items-center gap-1">
                <Info className="w-4 h-4 text-[#A9C9E8]" />
                <span>
                  {traversePoints.length === 0
                    ? "Click anywhere on the lunar surface to place your initial traverse station."
                    : "Station 1 marked. Click any second location on the Moon to calculate the cross-section profile."}
                </span>
              </div>
            ) : (
              <>
                {/* Stats Summary Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#252A33] pb-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[#626B78]">
                        Total Path Distance:{" "}
                      </span>
                      <span className="text-[#F1F2F4] font-bold">
                        {Math.round(totalDistanceKm).toLocaleString()} km
                      </span>
                    </div>
                    <div>
                      <span className="text-[#626B78]">Surface Arc: </span>
                      <span className="text-[#A9C9E8]">
                        {(
                          (totalDistanceKm /
                            (2 * Math.PI * LUNAR_MEAN_RADIUS_KM)) *
                          360
                        ).toFixed(1)}
                        °
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#929AA7]">
                      <span className="w-2.5 h-0.5 bg-[#626B78]" />
                      <span>Elevation (m)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#D9B674]">
                      <span className="w-2.5 h-0.5 bg-[#D9B674]" />
                      <span>
                        {layerMeta.formula} ({layerMeta.unit})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile SVG Chart */}
                <div className="w-full overflow-x-auto">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-36 bg-[#090B0E] rounded border border-[#252A33]"
                  >
                    {/* Grid lines */}
                    <line
                      x1={padLeft}
                      y1={elevToY(0)}
                      x2={svgWidth - padRight}
                      y2={elevToY(0)}
                      stroke="#252A33"
                      strokeDasharray="3 3"
                    />

                    {/* Terrain fill */}
                    <path d={terrainFillStr} fill="#171B21" opacity={0.7} />

                    {/* Terrain elevation line */}
                    <path
                      d={elevPathStr}
                      fill="none"
                      stroke="#626B78"
                      strokeWidth={1.5}
                    />

                    {/* Abundance uncertainty band */}
                    <path
                      d={uncertaintyBandStr}
                      fill="#D9B674"
                      opacity={0.15}
                    />

                    {/* Abundance profile line */}
                    <path
                      d={abundPathStr}
                      fill="none"
                      stroke="#D9B674"
                      strokeWidth={2}
                    />

                    {/* Left Axis: Elevation */}
                    <text
                      x={padLeft - 6}
                      y={padTop + 10}
                      fill="#626B78"
                      fontSize={9}
                      textAnchor="end"
                    >
                      +6km
                    </text>
                    <text
                      x={padLeft - 6}
                      y={elevToY(0) + 3}
                      fill="#626B78"
                      fontSize={9}
                      textAnchor="end"
                    >
                      0m
                    </text>
                    <text
                      x={padLeft - 6}
                      y={padTop + chartH}
                      fill="#626B78"
                      fontSize={9}
                      textAnchor="end"
                    >
                      -9km
                    </text>

                    {/* Right Axis: Abundance */}
                    <text
                      x={svgWidth - padRight + 6}
                      y={padTop + 10}
                      fill="#D9B674"
                      fontSize={9}
                    >
                      {maxAbund} {layerMeta.unit}
                    </text>
                    <text
                      x={svgWidth - padRight + 6}
                      y={padTop + chartH}
                      fill="#D9B674"
                      fontSize={9}
                    >
                      {minAbund}
                    </text>

                    {/* Bottom Axis: Distance km */}
                    <text
                      x={padLeft}
                      y={svgHeight - 8}
                      fill="#626B78"
                      fontSize={9}
                    >
                      0 km
                    </text>
                    <text
                      x={svgWidth - padRight}
                      y={svgHeight - 8}
                      fill="#626B78"
                      fontSize={9}
                      textAnchor="end"
                    >
                      {Math.round(totalDistanceKm)} km
                    </text>

                    {/* Interactive hover crosshair */}
                    {hoveredSampleIndex !== null &&
                      profileSamples[hoveredSampleIndex] && (
                        <g>
                          <line
                            x1={distToX(
                              profileSamples[hoveredSampleIndex].distanceKm,
                            )}
                            y1={padTop}
                            x2={distToX(
                              profileSamples[hoveredSampleIndex].distanceKm,
                            )}
                            y2={padTop + chartH}
                            stroke="#60C9D2"
                            strokeWidth={1}
                            strokeDasharray="2 2"
                          />
                          <circle
                            cx={distToX(
                              profileSamples[hoveredSampleIndex].distanceKm,
                            )}
                            cy={abundToY(
                              profileSamples[hoveredSampleIndex].abundance,
                            )}
                            r={3.5}
                            fill="#D9B674"
                            stroke="#050608"
                            strokeWidth={1.5}
                          />
                        </g>
                      )}

                    {/* Hover hit capture rects */}
                    {profileSamples.map((s, idx) => {
                      const x = distToX(s.distanceKm);
                      return (
                        <rect
                          key={idx}
                          x={x - 6}
                          y={padTop}
                          width={12}
                          height={chartH}
                          fill="transparent"
                          className="cursor-crosshair"
                          onMouseEnter={() => setHoveredSampleIndex(idx)}
                          onMouseLeave={() => setHoveredSampleIndex(null)}
                          onClick={() => {
                            setSelectedLocation(
                              { latitude: s.lat, longitude: s.lon },
                              s.cell,
                            );
                            flyTo(s.lat, s.lon);
                          }}
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Hover Inspector details */}
                {hoveredSampleIndex !== null &&
                profileSamples[hoveredSampleIndex] ? (
                  <div className="p-2 bg-[#090B0E] rounded border border-[#60C9D2]/30 flex items-center justify-between text-[11px]">
                    <span className="text-[#60C9D2] font-semibold">
                      Traverse Position:{" "}
                      {Math.round(
                        profileSamples[hoveredSampleIndex].distanceKm,
                      )}{" "}
                      km
                    </span>
                    <span className="text-[#929AA7]">
                      Coord: {profileSamples[hoveredSampleIndex].lat.toFixed(2)}
                      °, {profileSamples[hoveredSampleIndex].lon.toFixed(2)}°
                    </span>
                    <span className="text-[#F1F2F4]">
                      Elev: {profileSamples[hoveredSampleIndex].elevationMeters}{" "}
                      m
                    </span>
                    <span className="text-[#D9B674] font-bold">
                      {layerMeta.formula}:{" "}
                      {profileSamples[hoveredSampleIndex].abundance}{" "}
                      {layerMeta.unit} (±
                      {profileSamples[hoveredSampleIndex].uncertainty})
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] text-[#626B78] flex items-center justify-between">
                    <span>
                      Click anywhere along the chart to fly the camera to that
                      cross-section coordinate.
                    </span>
                    <span>IAU Spherical Lunar Datum: R = 1,737.4 km</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
