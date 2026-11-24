import { describe, expect, it } from "vitest";
import {
  calculateMolarMgNumber,
  clampLatitude,
  greatCircleDistanceKm,
  latLonToUV,
  latLonToVector3,
  LUNAR_MEAN_RADIUS_KM,
  normalizeLongitude,
  propagateRatioUncertainty,
  uvToLatLon,
  vector3ToLatLon,
} from "./index";

describe("Lunar Geometry & Physical Constants", () => {
  it("strictly adheres to IAU mean lunar radius of 1737.4 km", () => {
    expect(LUNAR_MEAN_RADIUS_KM).toBe(1737.4);
  });

  it("normalizes longitudes accurately within [-180, 180)", () => {
    expect(normalizeLongitude(0)).toBe(0);
    expect(normalizeLongitude(180)).toBe(-180);
    expect(normalizeLongitude(-180)).toBe(-180);
    expect(normalizeLongitude(190)).toBe(-170);
    expect(normalizeLongitude(-190)).toBe(170);
    expect(normalizeLongitude(540)).toBe(-180);
  });

  it("clamps latitude to [-90, 90]", () => {
    expect(clampLatitude(0)).toBe(0);
    expect(clampLatitude(95)).toBe(90);
    expect(clampLatitude(-120)).toBe(-90);
  });

  it("performs accurate 3D vector round trips", () => {
    const testPoints = [
      { lat: 0, lon: 0 },
      { lat: 90, lon: 0 },
      { lat: -90, lon: 0 },
      { lat: 0, lon: 90 },
      { lat: 0, lon: -90 },
      { lat: 34.5, lon: -17.2 },
      { lat: -53.2, lon: 168.4 },
    ];

    for (const pt of testPoints) {
      const [x, y, z] = latLonToVector3(pt.lat, pt.lon, 1.0);
      const converted = vector3ToLatLon(x, y, z);
      expect(converted.latitude).toBeCloseTo(pt.lat, 4);
      if (Math.abs(pt.lat) < 89.9) {
        expect(converted.longitude).toBeCloseTo(pt.lon, 4);
      }
    }
  });

  it("computes correct lunar great-circle distances", () => {
    // Pole-to-pole distance: PI * R = 3.14159265 * 1737.4 ≈ 5458.2 km
    const poleToPole = greatCircleDistanceKm(90, 0, -90, 0);
    expect(poleToPole).toBeCloseTo(Math.PI * 1737.4, 1);

    // Quarter circumference (90 degrees along equator): PI/2 * R ≈ 2729.1 km
    const quarterEq = greatCircleDistanceKm(0, 0, 0, 90);
    expect(quarterEq).toBeCloseTo((Math.PI / 2) * 1737.4, 1);

    // Distance between Apollo 11 (0.67°N, 23.47°E) and Apollo 12 (3.01°S, 23.42°W)
    const dist11to12 = greatCircleDistanceKm(0.674, 23.473, -3.012, -23.422);
    // Angular separation approx 47 degrees -> ~1425 km
    expect(dist11to12).toBeGreaterThan(1400);
    expect(dist11to12).toBeLessThan(1450);
  });

  it("calculates molar Mg# (Magnesium Number) rigorously", () => {
    // Apollo 15 Green Glass 15426: MgO = 17.5 wt%, FeO = 19.8 wt%
    // mol Mg = 17.5 / 40.3044 = 0.434195
    // mol Fe = 19.8 / 71.8444 = 0.275595
    // Mg# = 100 * (0.434195 / 0.70979) ≈ 61.17
    const mgNum = calculateMolarMgNumber(17.5, 19.8);
    expect(mgNum).not.toBeNull();
    expect(mgNum!).toBeCloseTo(61.17, 1);

    // Negative or zero handling
    expect(calculateMolarMgNumber(-5, 10)).toBeNull();
    expect(calculateMolarMgNumber(10, 0)).toBeNull();
  });

  it("propagates ratio uncertainty with and without covariance", () => {
    // Independent variables: R = 10 / 2 = 5, uncA = 1 (10%), uncB = 0.2 (10%)
    // RelVar = 0.01 + 0.01 = 0.02 -> sqrt(0.02) ≈ 0.14142 -> uncR = 5 * 0.14142 = 0.7071
    const resIndep = propagateRatioUncertainty(10, 1, 2, 0.2, 0);
    expect(resIndep).not.toBeNull();
    expect(resIndep!.ratio).toBe(5);
    expect(resIndep!.uncertainty).toBeCloseTo(0.7071, 3);

    // With positive covariance reducing ratio variance
    const resCovar = propagateRatioUncertainty(10, 1, 2, 0.2, 0.15);
    expect(resCovar).not.toBeNull();
    expect(resCovar!.uncertainty).toBeLessThan(resIndep!.uncertainty);
  });

  it("converts between lat/lon and equirectangular UV accurately", () => {
    const uvCenter = latLonToUV(0, 0);
    expect(uvCenter.u).toBeCloseTo(0.5, 5);
    expect(uvCenter.v).toBeCloseTo(0.5, 5);

    const backCenter = uvToLatLon(0.5, 0.5);
    expect(backCenter.latitude).toBeCloseTo(0, 5);
    expect(backCenter.longitude).toBeCloseTo(0, 5);

    const uvNorth = latLonToUV(90, -180);
    expect(uvNorth.u).toBeCloseTo(0.0, 5);
    expect(uvNorth.v).toBeCloseTo(0.0, 5);
  });
});
