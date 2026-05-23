import { CreateDatasetScreen } from "@/components/screens/create-dataset-screen";

export default async function WorkspaceNewDatasetPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  return <CreateDatasetScreen workspaceSlug={workspaceSlug} />;
}
