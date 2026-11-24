"use client";

import { findContainingCell } from "@/lib/dataClient";
import { LunarSurfaceShader } from "@/shaders/lunarSurfaceShader";
import { useObservatoryStore } from "@/stores/useObservatoryStore";
import { vector3ToLatLon } from "@lunar-atlas/lunar-geometry";
import {
  LunarMission,
  OrbitalObservationCell,
  ReturnedSample,
} from "@lunar-atlas/scientific-types";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CameraController } from "./CameraController";
import { GeographicGrid } from "./GeographicGrid";
import { MissionMarkers } from "./MissionMarkers";
import { SampleMarkers } from "./SampleMarkers";
import { SelectionMarker } from "./SelectionMarker";
import { TraversePath3D } from "./TraversePath3D";

interface LunarGlobeProps {
  orbitalCells: OrbitalObservationCell[];
  missions: LunarMission[];
  samples: ReturnedSample[];
}

const GLOBE_RADIUS = 2.0;

const GlobeMesh: React.FC<{
  orbitalCells: OrbitalObservationCell[];
}> = ({ orbitalCells }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const activeLayer = useObservatoryStore((s) => s.activeLayer);
  const layerOpacity = useObservatoryStore((s) => s.layerOpacity);
  const lightingMode = useObservatoryStore((s) => s.lightingMode);
  const setSelectedLocation = useObservatoryStore((s) => s.setSelectedLocation);
  const isTraverseActive = useObservatoryStore((s) => s.isTraverseActive);
  const addTraversePoint = useObservatoryStore((s) => s.addTraversePoint);

  const [baseTexture, setBaseTexture] = useState<THREE.Texture | null>(null);
  const [overlayTexture, setOverlayTexture] = useState<THREE.Texture | null>(
    null,
  );

  // Load base texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      "/data/textures/lunar_basemap_2048.jpg",
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        setBaseTexture(tex);
      },
      undefined,
      (err) => console.error("Failed to load base lunar texture:", err),
    );
  }, []);

  // Load overlay texture when activeLayer changes
  useEffect(() => {
    if (activeLayer === "none") {
      setOverlayTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.load(
      `/data/textures/${activeLayer}_viridis_2048.jpg`,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        setOverlayTexture(tex);
      },
      undefined,
      (err) =>
        console.error(
          `Failed to load overlay texture for ${activeLayer}:`,
          err,
        ),
    );
  }, [activeLayer]);

  // Shader material instance
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        overlayTexture: { value: null },
        hasOverlay: { value: 0 },
        overlayOpacity: { value: 0.85 },
        lightingMode: { value: 0 },
        lightDirection: { value: new THREE.Vector3(1.2, 0.3, 1.0).normalize() },
      },
      vertexShader: LunarSurfaceShader.vertexShader,
      fragmentShader: LunarSurfaceShader.fragmentShader,
    });
  }, []);

  // Update uniforms
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.baseTexture.value = baseTexture;
      materialRef.current.uniforms.overlayTexture.value = overlayTexture;
      materialRef.current.uniforms.hasOverlay.value = overlayTexture ? 1 : 0;
      materialRef.current.uniforms.overlayOpacity.value = layerOpacity;
      materialRef.current.uniforms.lightingMode.value =
        lightingMode === "solar_terminator" ? 1 : 0;
      materialRef.current.needsUpdate = true;
    }
  }, [baseTexture, overlayTexture, layerOpacity, lightingMode]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.point || !meshRef.current) return;

    // Inverse transform point to local sphere coordinates
    const localPoint = meshRef.current.worldToLocal(e.point.clone());
    const coords = vector3ToLatLon(localPoint.x, localPoint.y, localPoint.z);

    const cell = findContainingCell(
      coords.latitude,
      coords.longitude,
      orbitalCells,
    );
    setSelectedLocation(coords, cell);

    if (isTraverseActive) {
      addTraversePoint({
        id: `pt_${Date.now()}`,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    }
  };

  return (
    <mesh
      ref={meshRef}
      onPointerDown={handlePointerDown}
      scale={[GLOBE_RADIUS, GLOBE_RADIUS, GLOBE_RADIUS]}
    >
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
};

export const LunarGlobe: React.FC<LunarGlobeProps> = ({
  orbitalCells,
  missions,
  samples,
}) => {
  const isGridVisible = useObservatoryStore((s) => s.isGridVisible);
  const isMissionsVisible = useObservatoryStore((s) => s.isMissionsVisible);
  const isSamplesVisible = useObservatoryStore((s) => s.isSamplesVisible);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#050608]">
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 42 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={["#050608"]} />

        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 2, 4]} intensity={0.7} />

        <GlobeMesh orbitalCells={orbitalCells} />

        <GeographicGrid radius={GLOBE_RADIUS * 1.002} visible={isGridVisible} />
        <SelectionMarker radius={GLOBE_RADIUS * 1.004} />
        <TraversePath3D radius={GLOBE_RADIUS * 1.004} />
        <MissionMarkers
          missions={missions}
          visible={isMissionsVisible}
          radius={GLOBE_RADIUS * 1.004}
        />
        <SampleMarkers
          samples={samples}
          visible={isSamplesVisible}
          radius={GLOBE_RADIUS * 1.003}
        />

        <CameraController />
      </Canvas>
    </div>
  );
};
