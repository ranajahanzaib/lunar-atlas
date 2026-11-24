# AGENTS.md — Lunar Atlas Architecture & Scientific Protocols

## Overview

**Lunar Atlas** is a planetary geochemical exploration platform connecting orbital remote sensing (Lunar Prospector Gamma Ray Spectrometer) with laboratory analyses of returned lunar specimens (Apollo, Luna, Chang'e) from Astromat and the NASA Lunar Sample Compendium.

---

## Non-Negotiable Scientific Protocols

1. **Planetary Coordinate Reference Frame**:
   - Strictly use the IAU/IAG planetocentric, East-positive coordinate system [-180°, +180°].
   - The mean volumetric radius of the Moon is **1,737.4 km** (`LUNAR_MEAN_RADIUS_KM`). Never substitute Earth's radius (6371 km) or WGS84 ellipsoidal assumptions.
   - Polar and antimeridian singularities must be explicitly handled.

2. **Geochemical Abundances & Units**:
   - Major rock-forming oxides: FeO (wt%), TiO₂ (wt%), Al₂O₃ (wt%), MgO (wt%), SiO₂ (wt%), CaO (wt%).
   - Incompatible trace elements: Thorium (ppm), Potassium (ppm), Uranium (ppm).
   - In Lunar Prospector Level 5 products, uranium concentration is constrained to thorium by the documented lunar ratio: $U = Th / 3.8$. Explicitly disclose this relationship when presenting uranium data.
   - Molar Magnesium Number (Mg#) must be calculated using authentic molar masses:
     $$\text{Mg\#} = 100 \times \frac{[\text{MgO}] / 40.3044}{([\text{MgO}] / 40.3044) + ([\text{FeO}] / 71.8444)}$$
     assuming Fe²⁺ dominance (reducing lunar oxygen fugacity).

3. **Sample Provenance & Disparity Rules**:
   - **Never map unverified sample locations.** If an exact collection station is unverified, assign `unmapped` or `mission_only` review status.
   - **Never conflate hand specimens with orbital pixels.** Orbital gamma-ray footprints integrate over ~100–10,000 km² and the top ~30–40 cm regolith. Returned rocks represent small clasts and are subject to astronaut sampling bias.

---

## Repository Layout

```text
lunar-atlas/
├── apps/
│   └── web/                   # Next.js App Router Web Application
│       ├── app/               # Application routes (/, /composition, /regions, /samples, /missions, /compare, /research, /methodology)
│       ├── components/        # React Three Fiber 3D globe, 2D Atlas, Microscope, Inspector
│       ├── lib/               # Client-side data fetching and spatial intersection
│       ├── shaders/           # Custom GLSL shaders for multi-layer relief-preserved elemental overlays
│       ├── stores/            # Zustand observatory state management
│       └── public/data/       # Authoritative processed data (manifest, orbital, samples, regions, textures)
├── packages/
│   ├── lunar-geometry/        # Spherical trigonometry, distance, area, Mg#, covariance propagation
│   └── scientific-types/      # Authoritative TypeScript types for geochemistry, missions, samples
├── pipelines/
│   ├── acquisition/           # Ingestion & normalization scripts (Prettyman 2006, Astromat, Compendium)
│   └── geospatial/            # Authentic LROC basemap, elemental textures, and microphotographs
├── data/                      # Processed datasets and manifests
└── tests/                     # Python scientific tests & Vitest unit tests
```

---

## Development Commands

```bash
# Install dependencies
pnpm install
uv sync

# Run development server
pnpm dev

# Run all test suites
pnpm test          # Vitest TypeScript tests
uv run pytest      # Python scientific validation tests

# Production build
pnpm build
```
