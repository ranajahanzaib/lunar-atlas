import { RegionDetailClient } from "./RegionDetailClient";

export function generateStaticParams() {
  return [
    { id: "oceanus_procellarum" },
    { id: "mare_imbrium" },
    { id: "mare_tranquillitatis" },
    { id: "mare_serenitatis" },
    { id: "mare_crisium" },
    { id: "mare_fecunditatis" },
    { id: "mare_nectaris" },
    { id: "mare_humorum" },
    { id: "mare_orientale" },
    { id: "south_pole_aitken" },
    { id: "procellarum_kreep_terrane" },
    { id: "feldspathic_highlands_terrane" },
    { id: "nearside_hemisphere" },
    { id: "farside_hemisphere" },
  ];
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RegionDetailClient regionId={id} />;
}
