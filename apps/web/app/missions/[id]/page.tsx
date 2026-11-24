import { MissionDetailClient } from "./MissionDetailClient";

export function generateStaticParams() {
  return [
    { id: "apollo_11" },
    { id: "apollo_12" },
    { id: "apollo_14" },
    { id: "apollo_15" },
    { id: "apollo_16" },
    { id: "apollo_17" },
    { id: "luna_16" },
    { id: "luna_20" },
    { id: "luna_24" },
    { id: "change_5" },
  ];
}

export default async function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MissionDetailClient missionId={id} />;
}
