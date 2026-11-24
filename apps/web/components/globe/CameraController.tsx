"use client";

import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { latLonToVector3 } from "@lunar-atlas/lunar-geometry";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const cameraTarget = useObservatoryStore((s) => s.cameraTarget);
  const resetCameraTarget = useObservatoryStore((s) => s.resetCameraTarget);

  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (cameraTarget) {
      const zoomDist = cameraTarget.zoom || 4.2;
      const [x, y, z] = latLonToVector3(
        cameraTarget.lat,
        cameraTarget.lon,
        zoomDist,
      );
      targetPosRef.current = new THREE.Vector3(x, y, z);
      isAnimatingRef.current = true;
    }
  }, [cameraTarget]);

  useFrame(() => {
    if (isAnimatingRef.current && targetPosRef.current && controlsRef.current) {
      camera.position.lerp(targetPosRef.current, 0.08);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();

      if (camera.position.distanceTo(targetPosRef.current) < 0.05) {
        camera.position.copy(targetPosRef.current);
        isAnimatingRef.current = false;
        resetCameraTarget();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.06}
      rotateSpeed={0.65}
      zoomSpeed={0.8}
      minDistance={2.3}
      maxDistance={9.0}
    />
  );
};
