"use client";

import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { latLonToVector3 } from "@lunar-atlas/lunar-geometry";
import { ReturnedSample } from "@lunar-atlas/scientific-types";
import { Html } from "@react-three/drei";
import React, { useState } from "react";

interface SampleMarkersProps {
  samples: ReturnedSample[];
  visible?: boolean;
  radius?: number;
}

export const SampleMarkers: React.FC<SampleMarkersProps> = ({
  samples,
  visible = true,
  radius = 2.006,
}) => {
  const setSelectedSample = useObservatoryStore((s) => s.setSelectedSample);
  const flyTo = useObservatoryStore((s) => s.flyTo);
  const selectedSample = useObservatoryStore((s) => s.selectedSample);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!visible || !samples) return null;

  return (
    <group>
      {samples.map((s) => {
        if (s.location.reviewStatus !== "verified") return null;

        const [x, y, z] = latLonToVector3(
          s.location.latitude,
          s.location.longitude,
          radius,
        );
        const isSelected = selectedSample?.sampleId === s.sampleId;
        const isHovered = hoveredId === s.sampleId;

        return (
          <group key={s.sampleId} position={[x, y, z]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSample(s);
                flyTo(s.location.latitude, s.location.longitude, 3.2);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(s.sampleId);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredId(null);
              }}
            >
              <sphereGeometry args={[isSelected ? 0.022 : 0.015, 12, 12]} />
              <meshBasicMaterial color={isSelected ? "#60C9D2" : "#A599ED"} />
            </mesh>

            {(isSelected || isHovered) && (
              <Html
                center
                distanceFactor={8}
                position={[0, 0.04, 0]}
                style={{
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider border shadow-xl ${
                    isSelected
                      ? "bg-[#101318]/95 text-[#60C9D2] border-[#60C9D2]"
                      : "bg-[#090B0E]/95 text-[#A599ED] border-[#A599ED]/70"
                  }`}
                >
                  #{s.sampleId} · {s.geologicalClassification}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
