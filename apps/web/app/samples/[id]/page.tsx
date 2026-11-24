import { SampleDetailClient } from "./SampleDetailClient";

export function generateStaticParams() {
  return [
    { id: "15415" },
    { id: "10084" },
    { id: "10017" },
    { id: "12002" },
    { id: "12013" },
    { id: "14321" },
    { id: "15426" },
    { id: "60015" },
    { id: "61016" },
    { id: "74220" },
    { id: "76535" },
    { id: "70017" },
  ];
}

export default async function SamplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SampleDetailClient sampleId={id} />;
}
