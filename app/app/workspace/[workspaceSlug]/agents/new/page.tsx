import { CreateAgentScreen } from "@/components/screens/create-agent-screen";

export default async function WorkspaceNewAgentPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  return <CreateAgentScreen workspaceSlug={workspaceSlug} />;
}
