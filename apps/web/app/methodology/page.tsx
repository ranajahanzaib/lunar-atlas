"use client";

import { Header } from "@/components/layout/Header";
import {
  AlertTriangle,
  Atom,
  BookOpen,
  Compass,
  ExternalLink,
  FileText,
  ShieldCheck,
} from "lucide-react";

export default function MethodologyPage() {
  const references = [
    {
      authors: "Prettyman, T. H. et al.",
      year: 2006,
      title:
        "Elemental concentrations on the Moon from Lunar Prospector gamma-ray spectrometry",
      journal: "Journal of Geophysical Research: Planets, 111(E12), E12007",
      doi: "10.1029/2005JE002656",
      url: "https://doi.org/10.1029/2005JE002656",
    },
    {
      authors:
        "Jolliff, B. L., Gillis, J. J., Haskin, L. A., Korotev, R. L., & Wieczorek, M. A.",
      year: 2000,
      title:
        "Major lunar crustal terranes: Surface expressions and crust-mantle origins",
      journal: "Journal of Geophysical Research: Planets, 105(E2), 4197–4216",
      doi: "10.1029/1999JE001103",
      url: "https://doi.org/10.1029/1999JE001103",
    },
    {
      authors: "Meyer, C.",
      year: 2008,
      title: "The Lunar Sample Compendium",
      journal:
        "Astromaterials Research & Exploration Science (ARES), NASA Johnson Space Center",
      url: "https://curator.jsc.nasa.gov/lunar/compendium.cfm",
    },
    {
      authors: "Archinal, B. A. et al.",
      year: 2018,
      title:
        "Report of the IAU/IAG Working Group on Cartographic Coordinates and Rotational Elements: 2015",
      journal: "Celestial Mechanics and Dynamical Astronomy, 130(3), 22",
      doi: "10.1007/s10569-017-9805-5",
      url: "https://doi.org/10.1007/s10569-017-9805-5",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050608] text-[#F1F2F4] flex flex-col select-none">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-8">
        {/* Hero */}
        <div className="flex flex-col gap-2 border-b border-[#252A33] pb-6">
          <div className="flex items-center gap-2 text-xs font-mono text-[#60C9D2] uppercase tracking-wider font-semibold">
            <BookOpen className="w-4 h-4" />
            <span>Scientific Provenance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F1F2F4]">
            Data Sources & Scientific Methodology
          </h1>
          <p className="text-sm text-[#929AA7] max-w-3xl leading-relaxed">
            Full disclosure of authoritative datasets, planetary coordinate
            conventions, error propagation, and the fundamental physical
            distinction between orbital footprints and laboratory sample
            measurements.
          </p>
        </div>

        {/* Section 1: Orbital Geochemistry */}
        <section className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          <h2 className="text-base font-bold font-mono text-[#F1F2F4] flex items-center gap-2">
            <Atom className="w-4 h-4 text-[#60C9D2]" />
            <span>1. Orbital Observations: Lunar Prospector GRS</span>
          </h2>
          <div className="text-xs text-[#929AA7] space-y-3 leading-relaxed">
            <p>
              Global elemental abundances are derived from the NASA Planetary
              Data System (PDS) archive of the Lunar Prospector Gamma Ray
              Spectrometer (LP-L-GRS-5-ELEM-ABUNDANCE-V1.0), calibrated by
              Prettyman et al. (2006).
            </p>
            <div className="p-3 bg-[#090B0E] rounded-lg border border-[#252A33] flex flex-col gap-1.5 font-mono text-[11px]">
              <div className="text-[#F1F2F4] font-semibold">
                Native Spatial Discretization:
              </div>
              <p className="text-[#626B78]">
                Data is partitioned into a 5° equal-area grid comprising 1,652
                planetocentric pixels. Equal-area pixelization ensures unbiased
                spherical integration without polar distortion. Effective
                instrument spatial resolution is ~45 km during low-altitude
                passes and ~150 km during nominal orbit.
              </p>
            </div>
            <div className="p-3 bg-[#090B0E] rounded-lg border border-[#252A33] flex flex-col gap-1.5 font-mono text-[11px]">
              <div className="text-[#F1F2F4] font-semibold">
                Uranium Constraint Disclosure:
              </div>
              <p className="text-[#626B78]">
                In the standard Lunar Prospector Level 5 pipeline, uranium
                concentration is constrained from thorium using the canonical
                lunar ratio (Th/U = 3.8 ± 0.2) due to low signal-to-noise in
                natural gamma decay lines of 238U. This constraint is explicitly
                flagged in all Lunar Atlas calculations.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Planetary Coordinate Reference Frame */}
        <section className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          <h2 className="text-base font-bold font-mono text-[#F1F2F4] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#A9C9E8]" />
            <span>2. Planetary Coordinate Conventions & Datum</span>
          </h2>
          <div className="text-xs text-[#929AA7] space-y-3 leading-relaxed">
            <p>
              In accordance with the IAU Working Group on Cartographic
              Coordinates (Archinal et al. 2018):
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[11px]">
              <li>
                <strong className="text-[#F1F2F4]">
                  Mean Volumetric Radius (R):
                </strong>{" "}
                Exactly 1,737.4 km. Used for all great-circle distances,
                spherical cap areas, and spatial integrations. Terrestrial
                datums (WGS84) are never applied.
              </li>
              <li>
                <strong className="text-[#F1F2F4]">Latitude:</strong>{" "}
                Planetocentric latitude [-90°, +90°], with 0° at the equator and
                +90° at the North Pole.
              </li>
              <li>
                <strong className="text-[#F1F2F4]">Longitude:</strong>{" "}
                East-positive longitude [-180°, +180°), with 0° at the mean
                sub-Earth meridian.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Returned Sample Cross-Reference */}
        <section className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          <h2 className="text-base font-bold font-mono text-[#F1F2F4] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#A599ED]" />
            <span>3. Sample Provenance & Cross-Reference System</span>
          </h2>
          <div className="text-xs text-[#929AA7] space-y-3 leading-relaxed">
            <p>
              Returned lunar samples from Astromat and the NASA Lunar Sample
              Compendium are mapped using a hierarchical verification pipeline:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="p-3 bg-[#090B0E] rounded-lg border border-[#252A33]">
                <span className="text-[#60C9D2] font-semibold">
                  Verified Station Location:
                </span>
                <p className="text-[#626B78] mt-1">
                  Samples with documented collection stations (e.g. Apollo 15
                  Station 7, Apollo 17 Station 6) are mapped to documented
                  astronaut traverse coordinates with verified uncertainty
                  radiuses (5–20 m).
                </p>
              </div>
              <div className="p-3 bg-[#090B0E] rounded-lg border border-[#252A33]">
                <span className="text-[#D9B674] font-semibold">
                  Mission Landing Coordinates:
                </span>
                <p className="text-[#626B78] mt-1">
                  Mission coordinates represent Lunar Module touchdown sites.
                  They are never substituted as the exact location of individual
                  collected samples.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Orbital vs Sample Physics */}
        <section className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          <h2 className="text-base font-bold font-mono text-[#F1F2F4] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D9B674]" />
            <span>
              4. Physical Disparity: Orbital Footprints vs. Hand Specimens
            </span>
          </h2>
          <div className="text-xs text-[#929AA7] space-y-2 leading-relaxed">
            <p>
              Researchers comparing orbital estimates against returned sample
              analyses must account for fundamental differences in spatial
              support and sampling depth:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-[#626B78]">
              <li>
                <strong className="text-[#F1F2F4]">Spatial Support:</strong> A
                laboratory sample represents a ~10–1000 gram rock fragment,
                whereas an orbital measurement cell integrates ~100–10,000 km²
                of impact-gardened regolith.
              </li>
              <li>
                <strong className="text-[#F1F2F4]">Sampling Depth:</strong>{" "}
                Gamma-ray spectroscopy samples the uppermost ~30–40 cm of
                regolith, which contains lateral impact ejecta from distant
                craters (e.g. Copernicus rays across Apollo 12).
              </li>
              <li>
                <strong className="text-[#F1F2F4]">Sample Bias:</strong>{" "}
                Astronauts preferentially sampled unusual, pristine plutonic
                rocks (e.g. Genesis Rock 15415), whereas the bulk regolith
                represents an impact-mixed composite.
              </li>
            </ul>
          </div>
        </section>

        {/* References */}
        <section className="bg-[#101318] border border-[#252A33] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          <h2 className="text-base font-bold font-mono text-[#F1F2F4] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#A9C9E8]" />
            <span>5. Authoritative References & Citations</span>
          </h2>
          <div className="flex flex-col divide-y divide-[#252A33] text-xs font-mono">
            {references.map((ref, idx) => (
              <div key={idx} className="py-2.5 flex flex-col gap-0.5">
                <span className="text-[#F1F2F4] font-medium">{ref.title}</span>
                <span className="text-[#929AA7] text-[11px]">
                  {ref.authors} ({ref.year}). <em>{ref.journal}</em>.
                </span>
                {ref.doi && (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#60C9D2] hover:underline text-[10px] flex items-center gap-1 w-fit"
                  >
                    <span>DOI: {ref.doi}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
