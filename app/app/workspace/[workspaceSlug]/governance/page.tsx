import { GovernanceScreen } from "@/components/screens/governance-screen";

export default async function WorkspaceGovernancePage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  return <GovernanceScreen workspaceSlug={workspaceSlug} />;
}
