import { DatasetDetailScreen } from "@/components/screens/dataset-detail-screen";

export default async function WorkspaceDatasetDetailPage({ params }: { params: Promise<{ workspaceSlug: string; id: string }> }) {
  const { id } = await params;
  return <DatasetDetailScreen id={id} />;
}
