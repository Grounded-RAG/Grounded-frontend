import { BillingScreen } from "@/components/screens/billing-screen";

export default async function WorkspaceBillingPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  return <BillingScreen workspaceSlug={workspaceSlug} />;
}
