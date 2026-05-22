import { TeamScreen } from "@/components/screens/team-screen";

export default async function WorkspaceTeamPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  return <TeamScreen workspaceSlug={workspaceSlug} />;
}
