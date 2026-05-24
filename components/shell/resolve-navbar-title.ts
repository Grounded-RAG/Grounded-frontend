import { agents, datasets, workspaces } from "@/lib/mock-data";

export function resolveNavbarTitle(pathname: string, workspaceSlug?: string): string {
  const workspace = workspaces.find((w) => w.slug === workspaceSlug) ?? workspaces[0];
  const base = workspaceSlug ? `/app/workspace/${workspaceSlug}` : "/app";

  if (pathname.endsWith("/overview") || pathname === base) return workspace.name;
  if (pathname.endsWith("/datasets/new")) return "Create Dataset";
  if (/\/datasets\/[^/]+$/.test(pathname)) return "Datasets";
  if (pathname.endsWith("/datasets")) return "Datasets";
  if (pathname.endsWith("/agents/new")) return "Create Agent";
  if (/\/agents\/[^/]+$/.test(pathname)) return "Agents";
  if (pathname.endsWith("/agents")) return "Agents";
  if (pathname.endsWith("/runs")) return "Runs";
  if (pathname.endsWith("/feedback")) return "Feedback";
  if (pathname.endsWith("/usage")) return "Usage";
  if (pathname.endsWith("/billing")) return "Billing";
  if (pathname.endsWith("/team")) return "Team";
  if (pathname.endsWith("/governance")) return "Governance";
  if (pathname.endsWith("/settings")) return "Settings";
  if (pathname.endsWith("/api-keys")) return "API Keys";
  return "Grounded";
}

export function resolveEntityTitle(pathname: string): string | null {
  const datasetMatch = pathname.match(/\/datasets\/([^/]+)$/);
  if (datasetMatch && datasetMatch[1] !== "new") {
    const dataset = datasets.find((d) => d.dataset_id === datasetMatch[1]);
    return dataset?.name ?? null;
  }
  const agentMatch = pathname.match(/\/agents\/([^/]+)$/);
  if (agentMatch && agentMatch[1] !== "new") {
    const agent = agents.find((a) => a.agent_id === agentMatch[1]);
    return agent?.name ?? null;
  }
  return null;
}
