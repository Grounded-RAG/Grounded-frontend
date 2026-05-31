import { AgentsScreen } from "@/components/screens/agents-screen";

export default async function WorkspaceAgentsPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  return <AgentsScreen workspaceSlug={workspaceSlug} />;
}
