import { OverviewScreen } from "@/components/screens/overview-screen";

export default async function WorkspaceOverviewPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  return <OverviewScreen workspaceSlug={workspaceSlug} />;
}
