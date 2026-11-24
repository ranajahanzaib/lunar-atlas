"use client";

import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { latLonToVector3 } from "@lunar-atlas/lunar-geometry";
import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";

export const SelectionMarker: React.FC<{ radius?: number }> = ({
  radius = 2.008,
}) => {
  const selectedCoord = useObservatoryStore((s) => s.selectedCoord);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const scale = 1.0 + 0.15 * Math.sin(clock.getElapsedTime() * 3.5);
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  if (!selectedCoord) return null;

  const [x, y, z] = latLonToVector3(
    selectedCoord.latitude,
    selectedCoord.longitude,
    radius,
  );
  const normal = new THREE.Vector3(x, y, z).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);

  return (
    <group position={[x, y, z]} quaternion={quaternion}>
      {/* Target reticle ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.035, 0.045, 32]} />
        <meshBasicMaterial
          color="#60C9D2"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Center pinpoint */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color="#F1F2F4" />
      </mesh>
    </group>
  );
};
