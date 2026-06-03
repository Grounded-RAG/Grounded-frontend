import { ApiReferenceScreen } from "@/components/screens/api-reference-screen";

export default async function ApiReferencePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  await params;
  return <ApiReferenceScreen />;
}
