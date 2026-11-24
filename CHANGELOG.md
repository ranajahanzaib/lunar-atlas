# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-24

### Added

- **Interactive 3D Lunar Globe**: Three.js and React Three Fiber rendering with authentic 2048x1024 LROC WAC basemap and custom GLSL multi-layer relief-preserved chemical abundance shader overlays.
- **Multi-Projection 2D Lunar Atlas**: Synchronized 2D planar map supporting Equirectangular, Orthographic (Near-side and Far-side), and Polar Stereographic (North Pole and South Pole) projections.
- **Traverse & Geochemical Cross-Section Profile Tool**: Interactive geodesic waypoint placement calculating great-circle distances on $R=1,737.4\text{ km}$, rendering dual-axis topographic and elemental cross-sections with $\pm 1\sigma$ uncertainty envelopes, with GeoJSON export.
- **Nine Elemental Abundance Layers**: Lunar Prospector Level 5 maps for FeO, TiO₂, Al₂O₃, MgO, SiO₂, CaO (wt%), and K, Th, U (ppm).
- **Dedicated Layer Deep-Dives (`/composition/[layer]`)**: Full petrological background, global equal-area statistics, and protocol disclosures.
- **Digital Petrographic Microscopy Suite (`/samples` & `/samples/[id]`)**: Plane-Polarized Light (PPL) and Cross-Polarized Light (XPL / Crossed Nicols) thin-section examination with dynamic calibrated scale bar (μm/mm) and true Fe²⁺ molar Mg#.
- **Major Terranes & Basins Directory (`/regions` & `/regions/[id]`)**: 14 geological provinces with area-weighted mean abundances, stratigraphic ages, and bounding geometries.
- **Exploration Missions Index (`/missions` & `/missions/[id]`)**: 10 sample-return expeditions (Apollo 11–17, Luna 16/20/24, Chang'e 5) with telemetry, surface duration, and sample return weights.
- **Planetary Geochemical Analytics (`/research`)**: Bivariate scatter plots with dynamic Pearson correlation ($r$) and normalized ternary diagrams ($\text{FeO}-\text{Al}_2\text{O}_3-\text{TiO}_2$ and $(\text{FeO}+\text{MgO})-\text{Al}_2\text{O}_3-\text{CaO}$) with CSV/JSON exports.
- **Comparison Workspace (`/compare`)**: Terrane delta comparisons and saved observation inspection.
- **Authoritative Data Provenance & Methodology (`/methodology`)**: Scientific citations, planetary coordinate standards, and physical disparity guidelines.
