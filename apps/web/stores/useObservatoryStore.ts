import {
  ChemicalComponentKey,
  LunarMission,
  LunarRegion,
  OrbitalObservationCell,
  ReturnedSample,
} from "@lunar-atlas/scientific-types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ColormapMode =
  | "viridis"
  | "inferno"
  | "cividis"
  | "magma"
  | "historical";
export type ViewMode = "3d_globe" | "2d_equirectangular" | "split_comparison";
export type LightingMode = "scientific_neutral" | "solar_terminator";

export interface SelectionCoord {
  latitude: number;
  longitude: number;
}

export interface TraversePoint {
  id: string;
  latitude: number;
  longitude: number;
  elevationMeters?: number;
}

interface ObservatoryState {
  // Navigation & View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  lightingMode: LightingMode;
  setLightingMode: (mode: LightingMode) => void;
  isGridVisible: boolean;
  toggleGrid: () => void;
  isMissionsVisible: boolean;
  toggleMissions: () => void;
  isSamplesVisible: boolean;
  toggleSamples: () => void;
  isRegionsVisible: boolean;
  toggleRegions: () => void;

  // Layer State
  activeLayer: ChemicalComponentKey | "none";
  setActiveLayer: (layer: ChemicalComponentKey | "none") => void;
  layerOpacity: number;
  setLayerOpacity: (opacity: number) => void;
  colormap: ColormapMode;
  setColormap: (cmap: ColormapMode) => void;
  displayMode: "native_cells" | "smoothed_field";
  setDisplayMode: (mode: "native_cells" | "smoothed_field") => void;

  // Selected State
  selectedCoord: SelectionCoord | null;
  selectedCell: OrbitalObservationCell | null;
  setSelectedLocation: (
    coord: SelectionCoord | null,
    cell: OrbitalObservationCell | null,
  ) => void;

  // Entities
  selectedRegion: LunarRegion | null;
  setSelectedRegion: (region: LunarRegion | null) => void;
  selectedMission: LunarMission | null;
  setSelectedMission: (mission: LunarMission | null) => void;
  selectedSample: ReturnedSample | null;
  setSelectedSample: (sample: ReturnedSample | null) => void;

  // Camera preset trigger
  cameraTarget: { lat: number; lon: number; zoom?: number } | null;
  flyTo: (lat: number, lon: number, zoom?: number) => void;
  resetCameraTarget: () => void;

  // Traverse / Profile tool
  isTraverseActive: boolean;
  setIsTraverseActive: (active: boolean) => void;
  traversePoints: TraversePoint[];
  addTraversePoint: (pt: TraversePoint) => void;
  clearTraverse: () => void;

  // Comparison Workspace
  comparedLocations: Array<{
    coord: SelectionCoord;
    cell: OrbitalObservationCell;
    label: string;
  }>;
  addToComparison: (item: {
    coord: SelectionCoord;
    cell: OrbitalObservationCell;
    label: string;
  }) => void;
  removeFromComparison: (index: number) => void;
  clearComparison: () => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useObservatoryStore = create<ObservatoryState>()(
  persist(
    (set) => ({
      viewMode: "3d_globe",
      setViewMode: (viewMode) => set({ viewMode }),
      lightingMode: "scientific_neutral",
      setLightingMode: (lightingMode) => set({ lightingMode }),
      isGridVisible: true,
      toggleGrid: () => set((s) => ({ isGridVisible: !s.isGridVisible })),
      isMissionsVisible: true,
      toggleMissions: () =>
        set((s) => ({ isMissionsVisible: !s.isMissionsVisible })),
      isSamplesVisible: true,
      toggleSamples: () =>
        set((s) => ({ isSamplesVisible: !s.isSamplesVisible })),
      isRegionsVisible: true,
      toggleRegions: () =>
        set((s) => ({ isRegionsVisible: !s.isRegionsVisible })),

      activeLayer: "th",
      setActiveLayer: (activeLayer) => set({ activeLayer }),
      layerOpacity: 0.85,
      setLayerOpacity: (layerOpacity) => set({ layerOpacity }),
      colormap: "viridis",
      setColormap: (colormap) => set({ colormap }),
      displayMode: "smoothed_field",
      setDisplayMode: (displayMode) => set({ displayMode }),

      selectedCoord: { latitude: 0.67, longitude: 23.47 }, // Default: Tranquillity Base
      selectedCell: null,
      setSelectedLocation: (selectedCoord, selectedCell) =>
        set({ selectedCoord, selectedCell }),

      selectedRegion: null,
      setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
      selectedMission: null,
      setSelectedMission: (selectedMission) => set({ selectedMission }),
      selectedSample: null,
      setSelectedSample: (selectedSample) => set({ selectedSample }),

      cameraTarget: null,
      flyTo: (lat, lon, zoom) => set({ cameraTarget: { lat, lon, zoom } }),
      resetCameraTarget: () => set({ cameraTarget: null }),

      isTraverseActive: false,
      setIsTraverseActive: (isTraverseActive) => set({ isTraverseActive }),
      traversePoints: [],
      addTraversePoint: (pt) =>
        set((s) => ({ traversePoints: [...s.traversePoints, pt] })),
      clearTraverse: () => set({ traversePoints: [] }),

      comparedLocations: [],
      addToComparison: (item) =>
        set((s) => ({
          comparedLocations: s.comparedLocations.some(
            (x) => x.label === item.label,
          )
            ? s.comparedLocations
            : [...s.comparedLocations, item],
        })),
      removeFromComparison: (index) =>
        set((s) => ({
          comparedLocations: s.comparedLocations.filter((_, i) => i !== index),
        })),
      clearComparison: () => set({ comparedLocations: [] }),

      isCommandPaletteOpen: false,
      setCommandPaletteOpen: (isCommandPaletteOpen) =>
        set({ isCommandPaletteOpen }),
    }),
    {
      name: "lunar-atlas-observatory-storage",
      partialize: (state) => ({
        comparedLocations: state.comparedLocations,
      }),
    },
  ),
);
