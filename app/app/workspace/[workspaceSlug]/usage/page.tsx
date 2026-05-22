import { UsageScreen } from "@/components/screens/usage-screen";

export default async function WorkspaceUsagePage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  return <UsageScreen workspaceSlug={workspaceSlug} />;
}
