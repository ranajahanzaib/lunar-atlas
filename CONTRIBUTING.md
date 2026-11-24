# Contributing to Lunar Atlas

We welcome contributions from planetary scientists, geochemists, web developers, cartographers, and scientific software engineers!

## Getting Started

1. **Fork the Repository**: Fork [ranajahanzaib/lunar-atlas](https://github.com/ranajahanzaib/lunar-atlas) on GitHub.

2. **Clone Your Fork**:

   ```bash
   git clone https://github.com/ranajahanzaib/lunar-atlas.git
   cd lunar-atlas
   ```

3. **Prerequisites**:
   - Node.js >= 20 (Node 22 recommended)
   - pnpm >= 10
   - Python >= 3.12 with [uv](https://docs.astral.sh/uv/)

4. **Install Dependencies**:

   ```bash
   pnpm install
   uv sync
   ```

5. **Start Local Development Observatory**:
   ```bash
   pnpm dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Non-Negotiable Scientific Protocols

When contributing code, datasets, or documentation, all changes must strictly comply with planetary geochemical standards:

1. **Planetary Coordinate Reference Frame**:
   - Strictly use the IAU/IAG planetocentric, East-positive coordinate system $[-180^\circ, +180^\circ]$.
   - The mean volumetric radius of the Moon is **1,737.4 km** (`LUNAR_MEAN_RADIUS_KM`). Never substitute Earth's radius (6,371 km) or WGS84 ellipsoidal assumptions.
   - Polar ($+90^\circ, -90^\circ$) and antimeridian ($\pm 180^\circ$) singularities must be explicitly handled.

2. **Geochemical Abundances & Units**:
   - Major rock-forming oxides must be expressed in weight percent ($\text{wt}\%$): $\text{FeO}$, $\text{TiO}_2$, $\text{Al}_2\text{O}_3$, $\text{MgO}$, $\text{SiO}_2$, $\text{CaO}$.
   - Trace and heat-producing elements must be expressed in parts per million ($\text{ppm}$): $\text{Th}$, $\text{K}$, $\text{U}$.
   - In Lunar Prospector Level 5 products, uranium concentration is constrained to thorium by the documented lunar ratio: $U = \text{Th} / 3.8$. Explicitly disclose this relationship when presenting uranium data.
   - Molar Magnesium Number ($\text{Mg\\#}$) must be calculated using authentic molar masses:
     $$\text{Mg\\#} = 100 \times \frac{[\text{MgO}] / 40.3044}{([\text{MgO}] / 40.3044) + ([\text{FeO}] / 71.8444)}$$
     assuming $\text{Fe}^{2+}$ dominance under reducing lunar oxygen fugacity ($\sim \text{IW}-1$).

3. **Sample Provenance & Disparity Rules**:
   - **Never map unverified sample locations.** If an exact collection station is unverified, assign `unmapped` or `mission_only` review status.
   - **Never conflate hand specimens with orbital pixels.** Orbital gamma-ray footprints integrate over $\sim 100\text{--}10,000\text{ km}^2$ and the top $\sim 30\text{--}40\text{ cm}$ regolith. Returned rocks represent localized clasts and are subject to sampling bias.

---

## Development Workflow

1. Create a feature branch:

   ```bash
   git checkout -b feature/my-enhancement
   ```

2. Implement your changes and write unit tests where applicable.

3. Run the full test suites:

   ```bash
   pnpm test           # Vitest TypeScript tests (geometry, data client)
   uv run pytest       # Python scientific validation tests
   pnpm typecheck      # TypeScript compilation check
   pnpm build          # Next.js production build verification
   ```

4. Commit your changes using conventional, clear commit messages:

   ```bash
   git commit -m "feat(observatory): add polar stereographic projection controls"
   ```

5. Push to your fork and submit a Pull Request to the `main` branch.

---

## Reporting Issues

If you find a bug, a data discrepancy, or have an enhancement suggestion, please open an issue on GitHub:

- Include reproduction steps and environment details (browser, OS).
- For data questions, provide the relevant dataset source identifier, DOI, or sample canonical ID.
