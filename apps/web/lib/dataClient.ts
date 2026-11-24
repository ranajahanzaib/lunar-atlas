import { clampLatitude, normalizeLongitude } from "@lunar-atlas/lunar-geometry";
import {
  ChemicalComponentKey,
  LunarMission,
  LunarRegion,
  OrbitalObservationCell,
  ReturnedSample,
} from "@lunar-atlas/scientific-types";

let cachedObservations: OrbitalObservationCell[] | null = null;
let cachedRegions: LunarRegion[] | null = null;
let cachedMissions: LunarMission[] | null = null;
let cachedSamples: ReturnedSample[] | null = null;
let cachedManifest: any = null;

export async function fetchManifest(): Promise<any> {
  if (cachedManifest) return cachedManifest;
  try {
    const res = await fetch("/data/manifest.json");
    if (!res.ok) throw new Error("Failed to load manifest");
    cachedManifest = await res.json();
    return cachedManifest;
  } catch (err) {
    console.error("Error fetching manifest:", err);
    return null;
  }
}

export async function fetchOrbitalObservations(): Promise<
  OrbitalObservationCell[]
> {
  if (cachedObservations) return cachedObservations;
  try {
    const res = await fetch("/data/orbital_observations.json");
    if (!res.ok) throw new Error("Failed to load orbital observations");
    cachedObservations = await res.json();
    return cachedObservations || [];
  } catch (err) {
    console.error("Error fetching orbital observations:", err);
    return [];
  }
}

export async function fetchLunarRegions(): Promise<LunarRegion[]> {
  if (cachedRegions) return cachedRegions;
  try {
    const res = await fetch("/data/lunar_regions.json");
    if (!res.ok) throw new Error("Failed to load regions");
    cachedRegions = await res.json();
    return cachedRegions || [];
  } catch (err) {
    console.error("Error fetching regions:", err);
    return [];
  }
}

export async function fetchLunarMissions(): Promise<LunarMission[]> {
  if (cachedMissions) return cachedMissions;
  try {
    const res = await fetch("/data/lunar_missions.json");
    if (!res.ok) throw new Error("Failed to load missions");
    cachedMissions = await res.json();
    return cachedMissions || [];
  } catch (err) {
    console.error("Error fetching missions:", err);
    return [];
  }
}

export async function fetchReturnedSamples(): Promise<ReturnedSample[]> {
  if (cachedSamples) return cachedSamples;
  try {
    const res = await fetch("/data/returned_samples.json");
    if (!res.ok) throw new Error("Failed to load returned samples");
    cachedSamples = await res.json();
    return cachedSamples || [];
  } catch (err) {
    console.error("Error fetching samples:", err);
    return [];
  }
}

/**
 * Finds the native 5-degree equal-area orbital cell containing a given planetocentric coordinate.
 * Performs fast spatial boundary intersection.
 */
export function findContainingCell(
  lat: number,
  lon: number,
  cells: OrbitalObservationCell[],
): OrbitalObservationCell | null {
  if (!cells || cells.length === 0) return null;
  const cLat = clampLatitude(lat);
  const cLon = normalizeLongitude(lon);

  // Direct bounding test
  for (const cell of cells) {
    if (cLat >= cell.latMin && cLat <= cell.latMax) {
      if (cLon >= cell.lonMin && cLon <= cell.lonMax) {
        return cell;
      }
    }
  }

  // Fallback: nearest center coordinate
  let bestCell: OrbitalObservationCell | null = null;
  let minDistSq = Infinity;
  for (const cell of cells) {
    const dLat = cLat - cell.centerLat;
    let dLon = cLon - cell.centerLon;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < minDistSq) {
      minDistSq = distSq;
      bestCell = cell;
    }
  }

  return bestCell;
}

/**
 * Calculates area-weighted statistics across a collection of orbital cells.
 */
export function calculateAreaWeightedStats(
  cells: OrbitalObservationCell[],
  component: ChemicalComponentKey,
): {
  weightedMean: number;
  min: number;
  max: number;
  stdDev: number;
  totalAreaKm2: number;
  cellCount: number;
} {
  if (!cells || cells.length === 0) {
    return {
      weightedMean: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      totalAreaKm2: 0,
      cellCount: 0,
    };
  }

  let totalArea = 0;
  let weightedSum = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const c of cells) {
    const val = c.abundances[component];
    const area = c.areaKm2;
    totalArea += area;
    weightedSum += val * area;
    if (val < min) min = val;
    if (val > max) max = val;
  }

  const weightedMean = totalArea > 0 ? weightedSum / totalArea : 0;

  // Weighted variance
  let weightedVarSum = 0;
  for (const c of cells) {
    const val = c.abundances[component];
    const diff = val - weightedMean;
    weightedVarSum += diff * diff * c.areaKm2;
  }
  const stdDev = totalArea > 0 ? Math.sqrt(weightedVarSum / totalArea) : 0;

  return {
    weightedMean: Number(weightedMean.toFixed(2)),
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    totalAreaKm2: Math.round(totalArea),
    cellCount: cells.length,
  };
}
