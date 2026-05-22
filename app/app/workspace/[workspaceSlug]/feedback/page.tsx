import { FeedbackScreen } from "@/components/screens/feedback-screen";

export default async function WorkspaceFeedbackPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  return <FeedbackScreen workspaceSlug={workspaceSlug} />;
}
