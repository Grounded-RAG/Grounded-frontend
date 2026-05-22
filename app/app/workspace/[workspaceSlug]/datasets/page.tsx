import { DatasetsScreen } from "@/components/screens/datasets-screen";

export default async function WorkspaceDatasetsPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  return <DatasetsScreen workspaceSlug={workspaceSlug} />;
}
