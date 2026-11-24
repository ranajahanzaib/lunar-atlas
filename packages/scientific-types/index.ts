/**
 * Lunar Atlas Scientific Types
 * Authoritative types for lunar orbital geochemistry, returned sample analysis,
 * geographic nomenclature, and mission metadata.
 */

export type ChemicalComponentKey =
  | "fe_o"
  | "ti_o2"
  | "mg_o"
  | "al2_o3"
  | "si_o2"
  | "ca_o"
  | "k"
  | "th"
  | "u";

export interface ChemicalComponentMeta {
  key: ChemicalComponentKey;
  formula: string;
  name: string;
  unit: "wt%" | "ppm";
  category: "major_oxide" | "trace_element" | "heat_producing";
  minValid: number;
  maxValid: number;
  typicalMare: number;
  typicalHighlands: number;
  detectionMethod: string;
  sourceDataset: string;
  description: string;
  limitations: string;
}

export const CHEMICAL_COMPONENTS: Record<
  ChemicalComponentKey,
  ChemicalComponentMeta
> = {
  th: {
    key: "th",
    formula: "Th",
    name: "Thorium",
    unit: "ppm",
    category: "heat_producing",
    minValid: 0.1,
    maxValid: 15.0,
    typicalMare: 3.5,
    typicalHighlands: 0.8,
    detectionMethod:
      "Lunar Prospector Gamma Ray Spectrometer (GRS 0.55-9.0 MeV gamma-ray counting)",
    sourceDataset: "LP-L-GRS-5-ELEM-ABUNDANCE-V1.0 (Prettyman et al. 2006)",
    description:
      "Incompatible trace element diagnostic of KREEP-bearing rocks and lunar magma ocean differentiation.",
    limitations:
      "Measurement averages top ~30-40 cm regolith. Native binning is 2° equal-area with effective spatial resolution ~45 km at low altitude.",
  },
  fe_o: {
    key: "fe_o",
    formula: "FeO",
    name: "Iron(II) Oxide",
    unit: "wt%",
    category: "major_oxide",
    minValid: 1.0,
    maxValid: 24.0,
    typicalMare: 16.5,
    typicalHighlands: 4.5,
    detectionMethod:
      "GRS thermal and epithermal neutron capture + inelastic scattering gamma lines (7.6 MeV)",
    sourceDataset: "LP-L-GRS-5-ELEM-ABUNDANCE-V1.0",
    description:
      "Key major oxide separating mafic basaltic mare from feldspathic anorthositic highlands.",
    limitations:
      "Assumes all iron is Fe(II) state, which is valid for pristine lunar samples with highly reducing fO2 near IW-1.",
  },
  ti_o2: {
    key: "ti_o2",
    formula: "TiO₂",
    name: "Titanium Dioxide",
    unit: "wt%",
    category: "major_oxide",
    minValid: 0.1,
    maxValid: 13.0,
    typicalMare: 4.5,
    typicalHighlands: 0.4,
    detectionMethod: "GRS neutron capture gamma rays (6.76 MeV)",
    sourceDataset: "LP-L-GRS-5-ELEM-ABUNDANCE-V1.0",
    description:
      "Diagnostic marker for ilmenite (FeTiO3) content in lunar mare basalts and late-stage magma ocean cumulates.",
    limitations:
      "Sensitivity in low-Ti regions (<1 wt%) has higher relative uncertainty. Correlated with FeO in spectral inversion.",
  },
  k: {
    key: "k",
    formula: "K",
    name: "Potassium",
    unit: "ppm",
    category: "heat_producing",
    minValid: 50,
    maxValid: 6000,
    typicalMare: 1500,
    typicalHighlands: 350,
    detectionMethod: "Natural radioisotope 40K decay (1.46 MeV gamma-ray)",
    sourceDataset: "LP-L-GRS-5-ELEM-ABUNDANCE-V1.0",
    description:
      "Moderately volatile incompatible element; key component of the KREEP signature alongside Th and REEs.",
    limitations:
      "Relative error is ~15-20% in low-K highlands due to lower count rate compared to Th.",
  },
  u: {
    key: "u",
    formula: "U",
    name: "Uranium",
    unit: "ppm",
    category: "heat_producing",
    minValid: 0.05,
    maxValid: 4.5,
    typicalMare: 1.0,
    typicalHighlands: 0.22,
    detectionMethod:
      "Gamma-ray spectroscopy constrained by canonical lunar Th/U ratio of 3.8",
    sourceDataset: "LP-L-GRS-5-ELEM-ABUNDANCE-V1.0",
    description:
      "Refractory incompatible radioisotope contributing to lunar internal heat budget.",
    limitations:
      "Note: In LP GRS standard pipeline, uranium abundance is derived from thorium using empirical lunar Th/U ratio (3.8 ± 0.2). Not an independent measurement.",
  },
  mg_o: {
    key: "mg_o",
    formula: "MgO",
    name: "Magnesium Oxide",
    unit: "wt%",
    category: "major_oxide",
    minValid: 1.0,
    maxValid: 15.0,
    typicalMare: 8.5,
    typicalHighlands: 6.0,
    detectionMethod:
      "GRS epithermal/fast neutron inelastic gamma line (1.37 MeV)",
    sourceDataset: "LP-L-GRS-5-ELEM-ABUNDANCE-V1.0",
    description:
      "Essential for calculating Mg# = 100 * [Mg] / ([Mg] + [Fe]) to trace mantle cumulate melting and primitive crust.",
    limitations:
      "Lower signal-to-noise ratio than FeO; error is larger in thin regolith areas.",
  },
  al2_o3: {
    key: "al2_o3",
    formula: "Al₂O₃",
    name: "Aluminium Oxide",
    unit: "wt%",
    category: "major_oxide",
    minValid: 10.0,
    maxValid: 35.0,
    typicalMare: 11.0,
    typicalHighlands: 28.5,
    detectionMethod: "GRS capture (7.72 MeV) and inelastic scattering lines",
    sourceDataset: "LP-L-GRS-5-ELEM-ABUNDANCE-V1.0",
    description:
      "Traces plagioclase feldspar (anorthite CaAl2Si2O8), the principal constituent of the flotation lunar primary crust.",
    limitations:
      "Anti-correlated with FeO; boundary smoothing at mare-highland contacts reflects orbital footprint.",
  },
  si_o2: {
    key: "si_o2",
    formula: "SiO₂",
    name: "Silicon Dioxide",
    unit: "wt%",
    category: "major_oxide",
    minValid: 40.0,
    maxValid: 50.0,
    typicalMare: 45.0,
    typicalHighlands: 45.2,
    detectionMethod: "GRS capture and inelastic gamma rays (1.78, 4.93 MeV)",
    sourceDataset: "LP-L-GRS-5-ELEM-ABUNDANCE-V1.0",
    description:
      "Network-forming component of silicate minerals. Shows minimal variation across the Moon compared to other oxides.",
    limitations:
      "Global variance is small (~43-47 wt%), requiring precise calibration.",
  },
  ca_o: {
    key: "ca_o",
    formula: "CaO",
    name: "Calcium Oxide",
    unit: "wt%",
    category: "major_oxide",
    minValid: 6.0,
    maxValid: 19.0,
    typicalMare: 10.5,
    typicalHighlands: 16.0,
    detectionMethod: "GRS capture line (1.94, 6.42 MeV)",
    sourceDataset: "LP-L-GRS-5-ELEM-ABUNDANCE-V1.0",
    description: "Major constituent of plagioclase feldspar and clinopyroxene.",
    limitations: "Intermediate contrast between mare and highlands.",
  },
};

export interface OrbitalObservationCell {
  pixelId: number;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
  centerLat: number;
  centerLon: number;
  areaKm2: number;
  abundances: Record<ChemicalComponentKey, number>;
  uncertainties: Record<ChemicalComponentKey, number>;
}

export type LocationPrecision =
  | "exact_sub_meter"
  | "station_approx"
  | "traverse_zone"
  | "mission_landing_site"
  | "unverified";

export interface SampleLocationProvenance {
  precision: LocationPrecision;
  latitude: number;
  longitude: number;
  uncertaintyRadiusMeters: number;
  stationName?: string;
  sourceDocument: string;
  sourceUrl?: string;
  reviewStatus: "verified" | "station_level" | "conflicting" | "unmapped";
  notes: string;
}

export interface GeochemicalMeasurement {
  component: ChemicalComponentKey;
  value: number;
  unit: "wt%" | "ppm";
  uncertainty?: number;
  detectionLimit?: number;
  analyticalMethod: string;
  laboratory: string;
  publicationReference: string;
}

export interface ThinSectionImage {
  id: string;
  type:
    | "plane_polarized"
    | "cross_polarized"
    | "reflected"
    | "macro_sample"
    | "cutting_diagram";
  caption: string;
  credit: string;
  sourceUrl: string;
  scaleMicronsPerPixel?: number;
  fieldOfViewMicrons?: number;
  notes?: string;
}

export interface ReturnedSample {
  sampleId: string;
  canonicalId: string;
  parentSampleId?: string;
  mission: string;
  weightGrams: number;
  materialType:
    | "basalt"
    | "anorthosite"
    | "breccia"
    | "regolith_soil"
    | "pyroclastic_glass"
    | "troctolite"
    | "norite";
  geologicalClassification: string;
  description: string;
  collectionDate: string;
  location: SampleLocationProvenance;
  bulkComposition: Partial<Record<ChemicalComponentKey, number>>;
  measurementsCount: number;
  publicationsCount: number;
  images: ThinSectionImage[];
  curationFacility: string;
}

export interface LunarMission {
  id: string;
  name: string;
  program: "Apollo" | "Luna" | "Chang'e";
  landingDate: string;
  durationHours: number;
  landingCoordinates: {
    latitude: number;
    longitude: number;
  };
  landingSiteName: string;
  totalMassReturnedKg: number;
  catalogedSamplesCount: number;
  geologicalContext: string;
  primaryScientificGoals: string[];
  scientificSummary: string;
}

export interface LunarRegion {
  id: string;
  name: string;
  type: "mare" | "basin" | "highland_terrane" | "crater" | "pyroclastic";
  centerCoordinates: {
    latitude: number;
    longitude: number;
  };
  boundingBox: {
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
  };
  approxAreaKm2: number;
  geologicalUnit: string;
  stratigraphicAge: string;
  summary: string;
  significance: string;
  meanAbundances: Record<ChemicalComponentKey, number>;
}
