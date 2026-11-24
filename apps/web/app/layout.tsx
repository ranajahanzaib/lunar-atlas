import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Lunar Atlas — Lunar Geochemical Observatory",
  description:
    "Interactive scientific exploration platform for lunar orbital geochemistry, returned samples, and planetary evolution.",
  keywords: [
    "Moon",
    "Lunar Prospector",
    "Geochemistry",
    "Apollo Samples",
    "Thorium",
    "Iron Oxide",
    "Planetary Science",
    "Astromat",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-[#050608]">
      <body className="bg-[#050608] text-[#F1F2F4] antialiased min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
