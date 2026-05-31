"use client";

import { Bot, Database, FileText, KeyRound, Zap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { getDashboardSummary, listApiKeys, listRuns } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApiQuery } from "@/lib/use-api-query";

export function UsageScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  void workspaceSlug;
  const { apiKey } = useAuth();
  const summary = useApiQuery(() => getDashboardSummary(apiKey!), [apiKey], Boolean(apiKey));
  const keys = useApiQuery(() => listApiKeys(apiKey!), [apiKey], Boolean(apiKey));
  const runs = useApiQuery(() => listRuns(apiKey!, null, 200), [apiKey], Boolean(apiKey));
  const data = summary.data;
  const activeKeys = (keys.data ?? []).filter((key) => !key.revoked_at).length;
  const totalQueries = runs.data?.length ?? 0;
  const metrics = [
    { label: "Queries", value: totalQueries.toString(), limit: "200", pct: Math.min(Math.round((totalQueries / 200) * 100), 100), icon: Zap },
    { label: "Documents", value: String(data?.document_count ?? 0), limit: "500", pct: Math.min(Math.round(((data?.document_count ?? 0) / 500) * 100), 100), icon: FileText },
    { label: "Datasets", value: String(data?.dataset_count ?? 0), limit: "50", pct: Math.min(Math.round(((data?.dataset_count ?? 0) / 50) * 100), 100), icon: Database },
    { label: "API Keys", value: String(activeKeys), limit: "10", pct: Math.min(Math.round((activeKeys / 10) * 100), 100), icon: KeyRound },
  ];
  const modes = ["auto", "instant", "thinking", "verified"].map((mode) => ({ mode, count: (runs.data ?? []).filter((run) => (run.selected_mode ?? "auto") === mode).length }));
  const maxMode = Math.max(...modes.map((item) => item.count), 1);
  return <div className="page-grid animate-fade-in"><PageHeader eyebrow="Analytics" title="Usage" description="Track queries, ingestion, and API key activity across your workspace." /><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{metrics.map((metric) => <Card key={metric.label} variant="glass" className="rounded-2xl p-5"><div className="mb-4 flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/20 bg-foreground/[0.04]"><metric.icon className="h-4 w-4 text-foreground/60" /></div><span className="text-[11px] text-muted-foreground">{metric.pct}%</span></div><p className="text-2xl font-semibold tracking-tight text-foreground">{metric.value}</p><p className="mt-0.5 text-[12px] text-muted-foreground/70">{metric.label}</p><ProgressBar value={metric.pct} max={100} className="mt-3 h-1.5" tone={metric.pct > 80 ? "warn" : "accent"} /><p className="mt-1.5 text-[10px] text-muted-foreground/50">of {metric.limit} display limit</p></Card>)}</div><Card variant="glass" className="rounded-2xl"><div className="mb-4 flex items-center gap-2"><Bot className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold text-foreground">Mode breakdown</h2></div><div className="grid gap-3">{modes.map((item) => <div key={item.mode}><div className="mb-1.5 flex items-center justify-between"><span className="text-[13px] font-medium capitalize text-foreground">{item.mode}</span><span className="text-[12px] tabular-nums text-muted-foreground">{item.count} runs</span></div><div className="h-2 overflow-hidden rounded-full bg-foreground/[0.06]"><div className="h-full rounded-full bg-foreground/20" style={{ width: `${(item.count / maxMode) * 100}%` }} /></div></div>)}</div></Card></div>;
}
