/**
 * Lunar Geometry & Geochemical Physics Core
 *
 * Implements rigorous planetocentric lunar coordinate systems, spherical trigonometry,
 * distance, area, coordinate frame conversions, and covariance-propagated geochemical metrics.
 */

/** Authoritative mean volumetric radius of the Moon (IAU / Archinal et al. 2018) */
export const LUNAR_MEAN_RADIUS_KM = 1737.4;

/** Equatorial radius (km) */
export const LUNAR_EQUATORIAL_RADIUS_KM = 1738.1;

/** Polar radius (km) */
export const LUNAR_POLAR_RADIUS_KM = 1736.0;

/** Total surface area of spherical lunar approximation (km²) */
export const LUNAR_SURFACE_AREA_KM2 =
  4 * Math.PI * LUNAR_MEAN_RADIUS_KM * LUNAR_MEAN_RADIUS_KM; // ~37,932,328 km²

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

/**
 * Normalizes any longitude degree value to [-180, 180) degrees.
 * Strictly respects East-positive convention.
 */
export function normalizeLongitude(lonDeg: number): number {
  let lon = lonDeg % 360.0;
  if (lon >= 180.0) lon -= 360.0;
  if (lon < -180.0) lon += 360.0;
  return lon;
}

/**
 * Clamps latitude to [-90, 90] degrees.
 */
export function clampLatitude(latDeg: number): number {
  return Math.max(-90.0, Math.min(90.0, latDeg));
}

/**
 * Converts planetocentric latitude and East-positive longitude to 3D Cartesian coordinates.
 * Orientation convention:
 *   +Y: North Pole (lat +90°)
 *   -Y: South Pole (lat -90°)
 *   +Z: Prime Meridian / Sub-Earth point (lat 0°, lon 0°)
 *   +X: East limb (lat 0°, lon +90°E)
 *   -X: West limb (lat 0°, lon -90°W)
 */
export function latLonToVector3(
  latDeg: number,
  lonDeg: number,
  radius: number = 1.0,
): [number, number, number] {
  const latRad = clampLatitude(latDeg) * DEG2RAD;
  const lonRad = normalizeLongitude(lonDeg) * DEG2RAD;

  const cosLat = Math.cos(latRad);
  const sinLat = Math.sin(latRad);
  const cosLon = Math.cos(lonRad);
  const sinLon = Math.sin(lonRad);

  const x = radius * cosLat * sinLon;
  const y = radius * sinLat;
  const z = radius * cosLat * cosLon;

  return [x, y, z];
}

/**
 * Converts 3D Cartesian coordinates back to planetocentric latitude and East-positive longitude.
 * Inverse of latLonToVector3.
 */
export function vector3ToLatLon(
  x: number,
  y: number,
  z: number,
): { latitude: number; longitude: number } {
  const hyp = Math.sqrt(x * x + z * z);
  const latRad = Math.atan2(y, hyp);
  const lonRad = Math.atan2(x, z);

  return {
    latitude: latRad * RAD2DEG,
    longitude: normalizeLongitude(lonRad * RAD2DEG),
  };
}

/**
 * Great-circle distance between two lunar surface points using the Haversine formula.
 * @returns Distance in kilometers across the lunar sphere (radius = 1737.4 km).
 */
export function greatCircleDistanceKm(
  lat1Deg: number,
  lon1Deg: number,
  lat2Deg: number,
  lon2Deg: number,
): number {
  const lat1 = clampLatitude(lat1Deg) * DEG2RAD;
  const lat2 = clampLatitude(lat2Deg) * DEG2RAD;
  const dLat = (lat2Deg - lat1Deg) * DEG2RAD;
  const dLon = (lon2Deg - lon1Deg) * DEG2RAD;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  return LUNAR_MEAN_RADIUS_KM * c;
}

/**
 * Surface area of a spherical cap on the Moon (e.g. circular selection region).
 * @param angularRadiusDeg Angular radius in degrees.
 * @returns Area in square kilometers.
 */
export function sphericalCapAreaKm2(angularRadiusDeg: number): number {
  const thetaRad = Math.min(180, Math.max(0, angularRadiusDeg)) * DEG2RAD;
  return (
    2 *
    Math.PI *
    LUNAR_MEAN_RADIUS_KM *
    LUNAR_MEAN_RADIUS_KM *
    (1 - Math.cos(thetaRad))
  );
}

/**
 * Surface area of an equal-area or lat/lon bounding box on the lunar sphere.
 */
export function boundingBoxAreaKm2(
  latMinDeg: number,
  latMaxDeg: number,
  lonMinDeg: number,
  lonMaxDeg: number,
): number {
  const lat1 = clampLatitude(latMinDeg) * DEG2RAD;
  const lat2 = clampLatitude(latMaxDeg) * DEG2RAD;
  let dLon = lonMaxDeg - lonMinDeg;
  if (dLon < 0) dLon += 360;
  const dLonRad = Math.min(360, Math.max(0, dLon)) * DEG2RAD;

  const dSinLat = Math.abs(Math.sin(lat2) - Math.sin(lat1));
  return LUNAR_MEAN_RADIUS_KM * LUNAR_MEAN_RADIUS_KM * dLonRad * dSinLat;
}

/**
 * Molar Magnesium Number (Mg#)
 *
 * Mg# = 100 * (mol Mg) / (mol Mg + mol Fe)
 *
 * Molar masses:
 *   MgO = 40.3044 g/mol
 *   FeO = 71.8444 g/mol (assumes Fe2+ dominant, standard for reducing lunar conditions)
 *
 * @param mgoWtPct Magnesium oxide in wt%
 * @param feoWtPct Iron(II) oxide in wt%
 * @returns Mg# value between 0 and 100, or null if invalid inputs
 */
export function calculateMolarMgNumber(
  mgoWtPct: number,
  feoWtPct: number,
): number | null {
  if (mgoWtPct <= 0 || feoWtPct <= 0 || isNaN(mgoWtPct) || isNaN(feoWtPct)) {
    return null;
  }
  const molMg = mgoWtPct / 40.3044;
  const molFe = feoWtPct / 71.8444;
  const total = molMg + molFe;
  if (total <= 0) return null;
  return (molMg / total) * 100.0;
}

/**
 * Propagates uncertainty for a ratio R = A / B using full first-order Taylor expansion
 * including covariance term:
 *
 *   Var(R) = R² * [ (σ_A / A)² + (σ_B / B)² - 2 * Cov(A, B) / (A * B) ]
 *
 * @param valA Numerator value
 * @param uncA Numerator standard deviation (σ_A)
 * @param valB Denominator value
 * @param uncB Denominator standard deviation (σ_B)
 * @param covariance Cov(A, B) between numerator and denominator (defaults to 0 for independent)
 */
export function propagateRatioUncertainty(
  valA: number,
  uncA: number,
  valB: number,
  uncB: number,
  covariance: number = 0,
): { ratio: number; uncertainty: number } | null {
  if (valB === 0 || isNaN(valA) || isNaN(valB) || isNaN(uncA) || isNaN(uncB)) {
    return null;
  }
  const ratio = valA / valB;
  const relVarA = (uncA / valA) * (uncA / valA);
  const relVarB = (uncB / valB) * (uncB / valB);
  const covarTerm = (2 * covariance) / (valA * valB);

  const totalRelVar = relVarA + relVarB - covarTerm;
  if (totalRelVar < 0) {
    // Roundoff protection if correlation is near 1
    return { ratio, uncertainty: 0 };
  }
  const uncertainty = Math.abs(ratio) * Math.sqrt(totalRelVar);
  return { ratio, uncertainty };
}

/**
 * Normalizes coordinates to equirectangular UV mapping coordinates [0, 1].
 * u = 0 at lon -180, u = 0.5 at lon 0, u = 1 at lon +180
 * v = 0 at lat +90 (North), v = 0.5 at lat 0 (Equator), v = 1 at lat -90 (South)
 */
export function latLonToUV(
  latDeg: number,
  lonDeg: number,
): { u: number; v: number } {
  const normLon = normalizeLongitude(lonDeg);
  const clampLat = clampLatitude(latDeg);

  const u = (normLon + 180.0) / 360.0;
  const v = (90.0 - clampLat) / 180.0;
  return { u, v };
}

/**
 * Converts UV coordinates back to planetocentric latitude and longitude.
 */
export function uvToLatLon(
  u: number,
  v: number,
): { latitude: number; longitude: number } {
  const longitude = u * 360.0 - 180.0;
  const latitude = 90.0 - v * 180.0;
  return {
    latitude: clampLatitude(latitude),
    longitude: normalizeLongitude(longitude),
  };
}
