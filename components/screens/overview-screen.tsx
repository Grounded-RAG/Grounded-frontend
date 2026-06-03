"use client";

import Link from "next/link";
import { Activity, Bot, CheckCircle2, Clock, Database, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { getCapabilities, getDashboardRecentRuns, getDashboardSummary } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApiQuery } from "@/lib/use-api-query";
import { cn, workspaceHref } from "@/lib/utils";

export function OverviewScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const { apiKey, workspaceName } = useAuth();
  const enabled = Boolean(apiKey);
  const summary = useApiQuery(() => getDashboardSummary(apiKey!), [apiKey], enabled);
  const runs = useApiQuery(() => getDashboardRecentRuns(apiKey!, 4), [apiKey], enabled);
  const capabilities = useApiQuery(() => getCapabilities(apiKey!), [apiKey], enabled);
  const data = summary.data;
  const completionItems = [
    { text: "Workspace created", done: true },
    { text: "Datasets uploaded", done: (data?.dataset_count ?? 0) > 0 },
    { text: "Documents indexed", done: (data?.indexed_document_count ?? 0) > 0 },
    { text: "Agents configured", done: (data?.agent_count ?? 0) > 0 },
  ];
  const doneCount = completionItems.filter((item) => item.done).length;

  return (
    <div className="mx-auto w-full max-w-[1200px] animate-fade-in space-y-6 sm:space-y-8">
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Overview</p><h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{workspaceName ?? "Workspace"}</h1></div>
        <div className="flex items-center gap-3">
          <Link href={workspaceHref(workspaceSlug, "/datasets")}><Button variant="outline" className="h-9 rounded-full text-xs"><Database className="mr-2 h-3.5 w-3.5" />Add Data</Button></Link>
          <Link href={workspaceHref(workspaceSlug, "/agents/new")}><Button className="h-9 rounded-full text-xs"><Bot className="mr-2 h-3.5 w-3.5" />New Agent</Button></Link>
        </div>
      </div>
      {summary.error ? <InlineError message={summary.error} /> : null}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        <Card variant="glass" className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] p-6 sm:p-8 md:col-span-2 lg:col-span-2">
          <div>
            <div className="mb-2 flex items-center gap-2"><Activity className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-medium text-foreground">Workspace Readiness</h2></div>
            <p className="mb-6 max-w-sm text-[13px] font-light text-muted-foreground/80">Backend-backed setup status for datasets, indexed documents, and agents.</p>
            <div className="mb-8 grid gap-3 sm:grid-cols-2">
              {completionItems.map((item) => <div className="flex items-center gap-2.5" key={item.text}><div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", item.done ? "border-foreground bg-foreground text-background" : "border-border/40 bg-foreground/[0.02]")}><CheckCircle2 className={cn("h-3 w-3", item.done ? "text-background" : "opacity-0")} /></div><span className={cn("text-[13px]", item.done ? "font-medium text-foreground" : "text-muted-foreground/60")}>{item.text}</span></div>)}
            </div>
          </div>
          <div className="rounded-2xl border border-border/20 bg-foreground/[0.03] p-4"><div className="mb-2 flex items-end justify-between"><span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Completion</span><span className="text-lg font-bold leading-none text-foreground">{Math.round((doneCount / completionItems.length) * 100)}%</span></div><ProgressBar value={doneCount} max={completionItems.length} className="h-1.5" /></div>
        </Card>
        {[{ label: "Indexed Documents", value: data?.indexed_document_count ?? 0, sub: `of ${data?.document_count ?? 0} total`, icon: Database }, { label: "Active Agents", value: data?.agent_count ?? 0, sub: "ready to run", icon: Bot }].map((stat) => <Card key={stat.label} variant="glass" className="rounded-[2rem] p-6"><div className="mb-8 flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/30 bg-foreground/[0.03]"><stat.icon className="h-4 w-4 text-foreground/70" /></div></div><p className="text-3xl font-semibold tracking-tight text-foreground">{summary.isLoading ? "..." : stat.value}</p><h3 className="mt-1 text-[13px] font-medium text-foreground/80">{stat.label}</h3><p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground/60">{stat.sub}</p></Card>)}
        <Card variant="glass" className="flex flex-col justify-between rounded-[2rem] p-6 sm:p-8 md:col-span-3 lg:col-span-2"><div className="mb-6"><div className="mb-1 flex items-center gap-2"><Zap className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-medium text-foreground">Mode Capabilities</h2></div><p className="text-[13px] font-light text-muted-foreground/70">Available processing engines for your agents.</p></div><div className="grid gap-2">{(capabilities.data?.modes ?? []).map((mode) => <div className="flex items-center justify-between rounded-2xl border border-border/20 bg-foreground/[0.02] p-3" key={mode.mode}><div><p className="text-[13px] font-semibold text-foreground">{mode.label}</p><p className="text-[11px] text-muted-foreground/60">{mode.description}</p></div><Badge tone="success" dot size="sm" className="h-5 shrink-0 px-2 text-[10px]">Live</Badge></div>)}</div></Card>
        <Card variant="glass" className="rounded-[2rem] p-6 sm:p-8 md:col-span-3 lg:col-span-2"><div className="mb-6 flex items-center justify-between"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-medium text-foreground">Recent Activity</h2></div><Link href={workspaceHref(workspaceSlug, "/runs")}><button className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">View All</button></Link></div><div className="space-y-1">{(runs.data ?? []).map((run) => <Link href={workspaceHref(workspaceSlug, "/runs")} key={run.run_id}><div className="group flex items-center justify-between rounded-2xl border border-transparent p-2.5 transition-all hover:border-border/20 hover:bg-foreground/[0.03]"><div className="flex min-w-0 items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/20 bg-foreground/[0.05]"><Activity className="h-3.5 w-3.5 text-foreground/60" /></div><div className="min-w-0"><p className="truncate text-[13px] font-medium text-foreground">{run.query}</p><p className="text-[11px] text-muted-foreground/60">{run.effective_tier}</p></div></div><div className="flex flex-col items-end gap-1"><Badge tone={run.verification_status === "passed" ? "success" : "warn"} dot size="sm" className="h-4 text-[9px]">{run.verification_status}</Badge><span className="text-[10px] text-muted-foreground/50">{run.total_latency_ms}ms</span></div></div></Link>)}</div></Card>
      </div>
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{message}</div>;
}
