"use client";

import { Clock, Database, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listAuditLogs, listDatasets } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApiQuery } from "@/lib/use-api-query";
import { formatDate } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  "agent.created": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "agent.updated": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "agent.deleted": "bg-red-500/10 text-red-600 dark:text-red-400",
  "dataset.created": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "dataset.deleted": "bg-red-500/10 text-red-600 dark:text-red-400",
  "document.uploaded": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function GovernanceScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  void workspaceSlug;
  const { apiKey, workspaceId } = useAuth();
  const auditQuery = useApiQuery(() => listAuditLogs(apiKey!, workspaceId, 1, 50), [apiKey, workspaceId], Boolean(apiKey));
  const datasetsQuery = useApiQuery(() => listDatasets(apiKey!, workspaceId), [apiKey, workspaceId], Boolean(apiKey));

  const logs = auditQuery.data?.items ?? [];
  const datasets = datasetsQuery.data ?? [];

  return (
    <div className="page-grid animate-fade-in">
      <PageHeader
        eyebrow="Platform"
        title="Governance"
        description="Audit trail, data access controls, and policy review for your workspace."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-6">
          {/* Dataset policies derived from real dataset settings */}
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Dataset policies" eyebrow="Active data controls" />
            {datasets.length === 0 ? (
              <EmptyState
                icon={<Database className="h-8 w-8" />}
                title="No datasets yet"
                description="Dataset access policies will appear here once you create a dataset."
              />
            ) : (
              <div className="grid gap-2">
                {datasets.map((ds) => (
                  <div
                    key={ds.dataset_id}
                    className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-4 transition-colors hover:bg-secondary/15"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/20 bg-foreground/[0.04]">
                        <ShieldCheck className="h-4 w-4 text-foreground/60" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{ds.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Sensitivity: {ds.sensitivity_level} · Min tier: {ds.min_execution_tier} · Web fallback: {ds.allow_web_fallback ? "on" : "off"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral" size="sm">{ds.freshness_profile}</Badge>
                      <Badge tone={ds.sensitivity_level === "restricted" || ds.sensitivity_level === "confidential" ? "warn" : "success"} size="sm">
                        {ds.sensitivity_level}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Identity & Access — static configuration display */}
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Identity & Access" eyebrow="Security" />
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "SAML SSO", status: "Not configured", tone: "neutral" as const },
                { label: "OIDC SSO", status: "Not configured", tone: "neutral" as const },
                { label: "MFA enforcement", status: "Admin only", tone: "accent" as const },
                { label: "Session timeout", status: "24 hours", tone: "neutral" as const },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-3">
                  <span className="text-[13px] font-medium text-foreground">{item.label}</span>
                  <Badge tone={item.tone} size="sm">{item.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Audit log — real data */}
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Audit log" eyebrow={`${auditQuery.data?.total ?? 0} total events`} />
          {auditQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading audit log…</p>
          ) : logs.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-8 w-8" />}
              title="No events yet"
              description="Actions like creating agents or uploading documents will appear here."
            />
          ) : (
            <div className="grid gap-3 overflow-y-auto max-h-[480px] scrollbar-none">
              {logs.map((entry, index) => (
                <div key={entry.log_id} className="relative pl-6 pb-4 last:pb-0">
                  <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-foreground/20 bg-background" />
                  {index < logs.length - 1 && (
                    <div className="absolute left-[5px] top-4 bottom-0 w-px bg-border/30" />
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-medium text-foreground">{entry.action}</p>
                    <span className={`text-[10px] font-medium rounded-md px-1.5 py-0.5 ${ACTION_COLORS[entry.action] ?? "bg-foreground/5 text-muted-foreground"}`}>
                      {entry.resource_type}
                    </span>
                  </div>
                  {entry.summary && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{entry.summary}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {entry.resource_id && (
                      <span className="text-[10px] font-mono text-muted-foreground/60">{entry.resource_id.slice(0, 8)}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground/40">·</span>
                    <span className="text-[10px] text-muted-foreground/60">{formatDate(entry.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
