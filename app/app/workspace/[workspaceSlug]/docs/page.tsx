import { DocsScreen } from "@/components/screens/docs-screen";

export default async function DocsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  await params;
  return <DocsScreen />;
}
