import { OrbitalObservationCell } from "@lunar-atlas/scientific-types";
import { describe, expect, it } from "vitest";
import { calculateAreaWeightedStats, findContainingCell } from "./dataClient";

describe("Data Client & Spatial Intersection", () => {
  const mockCells: OrbitalObservationCell[] = [
    {
      pixelId: 1,
      latMin: 0,
      latMax: 5,
      lonMin: 20,
      lonMax: 25,
      centerLat: 2.5,
      centerLon: 22.5,
      areaKm2: 90000,
      abundances: {
        th: 2.5,
        fe_o: 16.5,
        ti_o2: 7.2,
        k: 1200,
        u: Number((2.5 / 3.8).toFixed(2)),
        mg_o: 8.0,
        al2_o3: 12.0,
        si_o2: 45.0,
        ca_o: 10.5,
      },
      uncertainties: {
        th: 0.3,
        fe_o: 1.0,
        ti_o2: 0.5,
        k: 150,
        u: 0.08,
        mg_o: 0.8,
        al2_o3: 1.2,
        si_o2: 1.2,
        ca_o: 0.8,
      },
    },
    {
      pixelId: 2,
      latMin: 0,
      latMax: 5,
      lonMin: 25,
      lonMax: 30,
      centerLat: 2.5,
      centerLon: 27.5,
      areaKm2: 90000,
      abundances: {
        th: 3.0,
        fe_o: 17.0,
        ti_o2: 7.8,
        k: 1300,
        u: Number((3.0 / 3.8).toFixed(2)),
        mg_o: 8.2,
        al2_o3: 11.5,
        si_o2: 44.8,
        ca_o: 10.2,
      },
      uncertainties: {
        th: 0.35,
        fe_o: 1.1,
        ti_o2: 0.55,
        k: 160,
        u: 0.09,
        mg_o: 0.8,
        al2_o3: 1.1,
        si_o2: 1.2,
        ca_o: 0.8,
      },
    },
  ];

  it("correctly identifies containing cell by bounding intersection", () => {
    const found = findContainingCell(2.0, 22.0, mockCells);
    expect(found).not.toBeNull();
    expect(found!.pixelId).toBe(1);
  });

  it("finds nearest cell when outside exact boundaries", () => {
    const found = findContainingCell(6.0, 21.0, mockCells);
    expect(found).not.toBeNull();
    expect(found!.pixelId).toBe(1);
  });

  it("calculates area-weighted mean and statistics accurately", () => {
    const stats = calculateAreaWeightedStats(mockCells, "th");
    expect(stats.cellCount).toBe(2);
    expect(stats.totalAreaKm2).toBe(180000);
    // Equal area cells: (2.5 + 3.0) / 2 = 2.75
    expect(stats.weightedMean).toBeCloseTo(2.75, 2);
    expect(stats.min).toBe(2.5);
    expect(stats.max).toBe(3.0);
  });

  it("verifies uranium to thorium ratio constraint (U = Th / 3.8)", () => {
    for (const cell of mockCells) {
      const expectedU = cell.abundances.th / 3.8;
      expect(cell.abundances.u).toBeCloseTo(expectedU, 2);
    }
  });
});
