import { LayerDetailClient } from "./LayerDetailClient";

export function generateStaticParams() {
  return [
    { layer: "fe_o" },
    { layer: "ti_o2" },
    { layer: "al2_o3" },
    { layer: "mg_o" },
    { layer: "si_o2" },
    { layer: "ca_o" },
    { layer: "k" },
    { layer: "th" },
    { layer: "u" },
  ];
}

export default async function LayerPage({
  params,
}: {
  params: Promise<{ layer: string }>;
}) {
  const { layer } = await params;
  return <LayerDetailClient layerKey={layer} />;
}
