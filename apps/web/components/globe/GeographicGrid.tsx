"use client";

import { latLonToVector3 } from "@lunar-atlas/lunar-geometry";
import React, { useMemo } from "react";
import * as THREE from "three";

interface GeographicGridProps {
  radius?: number;
  visible?: boolean;
}

export const GeographicGrid: React.FC<GeographicGridProps> = ({
  radius = 2.003,
  visible = true,
}) => {
  const lineGeometries = useMemo(() => {
    const lines: THREE.BufferGeometry[] = [];

    // Parallels (every 30 degrees from -60 to +60)
    const latitudes = [-60, -30, 0, 30, 60];
    for (const lat of latitudes) {
      const points: THREE.Vector3[] = [];
      for (let lon = -180; lon <= 180; lon += 3) {
        const [x, y, z] = latLonToVector3(lat, lon, radius);
        points.push(new THREE.Vector3(x, y, z));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(geom);
    }

    // Meridians (every 30 degrees)
    for (let lon = -180; lon < 180; lon += 30) {
      const points: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 3) {
        const [x, y, z] = latLonToVector3(lat, lon, radius);
        points.push(new THREE.Vector3(x, y, z));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(geom);
    }

    return lines;
  }, [radius]);

  if (!visible) return null;

  return (
    <group>
      {lineGeometries.map((geom, idx) => (
        <lineLoop key={idx} geometry={geom}>
          <lineBasicMaterial
            color="#A9C9E8"
            transparent
            opacity={idx === 2 ? 0.35 : 0.15} // Equator is slightly brighter
            linewidth={1}
          />
        </lineLoop>
      ))}
    </group>
  );
};
