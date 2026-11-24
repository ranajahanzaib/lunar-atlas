"use client";

import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { latLonToVector3 } from "@lunar-atlas/lunar-geometry";
import React, { useMemo } from "react";
import * as THREE from "three";

interface TraversePath3DProps {
  radius: number;
}

export const TraversePath3D: React.FC<TraversePath3DProps> = ({ radius }) => {
  const traversePoints = useObservatoryStore((s) => s.traversePoints);

  const { lineObject, waypointPositions } = useMemo(() => {
    if (traversePoints.length === 0) {
      return { lineObject: null, waypointPositions: [] };
    }

    const waypoints = traversePoints.map((pt) => {
      const [x, y, z] = latLonToVector3(pt.latitude, pt.longitude, radius);
      return new THREE.Vector3(x, y, z);
    });

    if (traversePoints.length < 2) {
      return { lineObject: null, waypointPositions: waypoints };
    }

    // Great circle interpolation
    const curvePoints: THREE.Vector3[] = [];
    const SAMPLES_PER_SEGMENT = 16;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const v1 = waypoints[i].clone().normalize();
      const v2 = waypoints[i + 1].clone().normalize();

      for (let s = 0; s < SAMPLES_PER_SEGMENT; s++) {
        const t = s / SAMPLES_PER_SEGMENT;
        // Spherical linear interpolation (slerp)
        const interpolated = new THREE.Vector3()
          .copy(v1)
          .lerp(v2, t)
          .normalize()
          .multiplyScalar(radius * 1.003);
        curvePoints.push(interpolated);
      }
    }
    // Add final point
    curvePoints.push(
      waypoints[waypoints.length - 1]
        .clone()
        .normalize()
        .multiplyScalar(radius * 1.003),
    );

    const geom = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const mat = new THREE.LineBasicMaterial({ color: "#60C9D2", linewidth: 2 });
    const line = new THREE.Line(geom, mat);

    return { lineObject: line, waypointPositions: waypoints };
  }, [traversePoints, radius]);

  if (traversePoints.length === 0) return null;

  return (
    <group>
      {/* Traverse Path Great Circle Line */}
      {lineObject && <primitive object={lineObject} />}

      {/* Waypoint Markers */}
      {waypointPositions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.018, 16, 16]} />
          <meshBasicMaterial color={idx === 0 ? "#60C9D2" : "#D9B674"} />
        </mesh>
      ))}
    </group>
  );
};
