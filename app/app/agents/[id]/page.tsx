import { AgentChatScreen } from "@/components/screens/agent-chat-screen";

export default async function AgentChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentChatScreen id={id} />;
}
