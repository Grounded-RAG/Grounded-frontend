import { EditAgentScreen } from "@/components/screens/edit-agent-screen";

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; id: string }>;
}) {
  const { workspaceSlug, id } = await params;
  return <EditAgentScreen id={id} workspaceSlug={workspaceSlug} />;
}
