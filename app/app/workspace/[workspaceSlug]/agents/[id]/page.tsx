import { AgentChatScreen } from "@/components/screens/agent-chat-screen";

export default async function WorkspaceAgentChatPage({ params }: { params: Promise<{ workspaceSlug: string; id: string }> }) {
  const { id } = await params;
  return <AgentChatScreen id={id} />;
}
