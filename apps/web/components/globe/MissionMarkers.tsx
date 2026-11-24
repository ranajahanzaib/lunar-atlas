"use client";

import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { latLonToVector3 } from "@lunar-atlas/lunar-geometry";
import { LunarMission } from "@lunar-atlas/scientific-types";
import { Html } from "@react-three/drei";
import React, { useState } from "react";

interface MissionMarkersProps {
  missions: LunarMission[];
  visible?: boolean;
  radius?: number;
}

export const MissionMarkers: React.FC<MissionMarkersProps> = ({
  missions,
  visible = true,
  radius = 2.008,
}) => {
  const setSelectedMission = useObservatoryStore((s) => s.setSelectedMission);
  const flyTo = useObservatoryStore((s) => s.flyTo);
  const selectedMission = useObservatoryStore((s) => s.selectedMission);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!visible || !missions) return null;

  return (
    <group>
      {missions.map((m) => {
        const [x, y, z] = latLonToVector3(
          m.landingCoordinates.latitude,
          m.landingCoordinates.longitude,
          radius,
        );
        const isSelected = selectedMission?.id === m.id;
        const isHovered = hoveredId === m.id;

        return (
          <group key={m.id} position={[x, y, z]}>
            {/* 3D Pin Head */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMission(m);
                flyTo(
                  m.landingCoordinates.latitude,
                  m.landingCoordinates.longitude,
                  3.5,
                );
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(m.id);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredId(null);
              }}
            >
              <sphereGeometry args={[isSelected ? 0.028 : 0.02, 16, 16]} />
              <meshBasicMaterial color={isSelected ? "#60C9D2" : "#D9B674"} />
            </mesh>

            {/* Glowing outer ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.024, 0.034, 16]} />
              <meshBasicMaterial
                color="#D9B674"
                transparent
                opacity={isSelected ? 0.9 : 0.45}
              />
            </mesh>

            {/* Tooltip on hover or selection */}
            {(isSelected || isHovered) && (
              <Html
                center
                distanceFactor={10}
                position={[0, 0.05, 0]}
                style={{
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-tight border shadow-xl ${
                    isSelected
                      ? "bg-[#171B21]/95 text-[#60C9D2] border-[#60C9D2]"
                      : "bg-[#101318]/95 text-[#D9B674] border-[#D9B674]/80"
                  }`}
                >
                  {m.name} ({m.program})
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
