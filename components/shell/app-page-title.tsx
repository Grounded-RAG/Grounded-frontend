"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { datasets, workspaces } from "@/lib/mock-data";

function resolveTitle(pathname: string, workspaceSlug?: string) {
  const workspace = workspaces.find((w) => w.slug === workspaceSlug) ?? workspaces[0];
  const base = workspaceSlug ? `/app/workspace/${workspaceSlug}` : "/app";

  if (pathname.endsWith("/overview") || pathname === base) {
    return { eyebrow: "Overview", title: workspace.name };
  }
  if (pathname.endsWith("/datasets/new")) return { eyebrow: "Knowledge", title: "Create Dataset" };
  const datasetMatch = pathname.match(/\/datasets\/([^/]+)$/);
  if (datasetMatch && datasetMatch[1] !== "new") {
    const dataset = datasets.find((d) => d.dataset_id === datasetMatch[1]);
    return { eyebrow: "Knowledge", title: dataset?.name ?? "Dataset" };
  }
  if (pathname.endsWith("/datasets")) return { eyebrow: "Knowledge", title: "Datasets" };
  if (pathname.endsWith("/agents/new")) return null;
  if (/\/agents\/[^/]+$/.test(pathname)) return null;
  if (pathname.endsWith("/agents")) return { eyebrow: "Agents", title: "Agents" };
  if (pathname.endsWith("/runs")) return { eyebrow: "Insights", title: "Runs" };
  if (pathname.endsWith("/feedback")) return { eyebrow: "Insights", title: "Feedback" };
  if (pathname.endsWith("/usage")) return { eyebrow: "Admin", title: "Usage" };
  if (pathname.endsWith("/billing")) return { eyebrow: "Admin", title: "Billing" };
  if (pathname.endsWith("/team")) return { eyebrow: "Admin", title: "Team" };
  if (pathname.endsWith("/governance")) return { eyebrow: "Admin", title: "Governance" };
  if (pathname.endsWith("/settings")) return { eyebrow: "Admin", title: "Settings" };
  if (pathname.endsWith("/api-keys")) return { eyebrow: "Admin", title: "API Keys" };
  return null;
}

export function AppPageTitle({ workspaceSlug }: { workspaceSlug?: string }) {
  const pathname = usePathname();
  const meta = useMemo(() => resolveTitle(pathname, workspaceSlug), [pathname, workspaceSlug]);

  if (!meta) return null;

  return (
    <div className="mb-4 min-w-0 animate-fade-in sm:mb-6">
      <p className="section-title mb-1.5 sm:mb-2">{meta.eyebrow}</p>
      <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl">{meta.title}</h1>
    </div>
  );
}
