import { DatasetDetailScreen } from "@/components/screens/dataset-detail-screen";

export default async function DatasetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DatasetDetailScreen id={id} />;
}
