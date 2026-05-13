import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Clock, Database, Zap, Activity } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { agents, capabilities, datasets, documents, runs, workspaces } from "@/lib/mock-data";
import { cn, formatDate, workspaceHref } from "@/lib/utils";

export function OverviewScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const workspace = workspaces.find((w) => w.slug === workspaceSlug) ?? workspaces[0];
  const wsDatasets = datasets.filter((d) => d.workspace_id === workspace.workspace_id);
  const wsAgents = agents.filter((a) => a.workspace_id === workspace.workspace_id);
  const indexedDocs = documents.filter((d) => d.status === "indexed").length;
  const totalDocs = documents.length;
  const activeAgents = wsAgents.filter((a) => a.status === "active").length;

  return (
    <div className="animate-fade-in w-full max-w-[1200px] mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Overview</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">{workspace.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href={workspaceHref(workspaceSlug, "/datasets")}>
            <Button variant="outline" className="h-9 rounded-full bg-foreground/[0.02] border-border/30 hover:bg-foreground/[0.05] shadow-sm text-xs">
              <Database className="mr-2 h-3.5 w-3.5" />
              Add Data
            </Button>
          </Link>
          <Link href={workspaceHref(workspaceSlug, "/agents")}>
            <Button className="h-9 rounded-full shadow-sm text-xs">
              <Bot className="mr-2 h-3.5 w-3.5" />
              New Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Bento Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Readiness Hero Box (Spans 2 cols) */}
        <Card variant="glass" className="md:col-span-2 lg:col-span-2 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-foreground/[0.02] rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Workspace Readiness</h2>
            </div>
            <p className="text-[13px] text-muted-foreground/80 font-light max-w-sm mb-6">
              Your workspace needs datasets and agents to start processing intelligence runs.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {[
                { text: "Workspace created", done: true },
                { text: "Datasets uploaded", done: wsDatasets.length > 0 },
                { text: "Documents indexed", done: indexedDocs > 0 },
                { text: "Agents configured", done: activeAgents > 0 },
              ].map((item) => (
                <div className="flex items-center gap-2.5" key={item.text}>
                  <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", item.done ? "border-foreground bg-foreground text-background" : "border-border/40 bg-foreground/[0.02]")}>
                    <CheckCircle2 className={cn("h-3 w-3", item.done ? "text-background" : "opacity-0")} />
                  </div>
                  <span className={cn("text-[13px]", item.done ? "text-foreground font-medium" : "text-muted-foreground/60")}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-foreground/[0.03] rounded-2xl p-4 border border-border/20">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Completion</span>
              <span className="text-lg font-bold text-foreground leading-none">80%</span>
            </div>
            <ProgressBar value={4} max={5} className="h-1.5" />
          </div>
        </Card>

        {/* Small Stat Boxes */}
        {[
          { label: "Indexed Documents", value: `${indexedDocs}`, sub: `of ${totalDocs} total`, icon: Database },
          { label: "Active Agents", value: activeAgents, sub: "ready to run", icon: Bot },
        ].map((stat) => (
          <Card key={stat.label} variant="glass" className="rounded-[2rem] p-6 flex flex-col justify-between group hover:-translate-y-0.5 transition-transform duration-300">
            <div className="flex items-start justify-between mb-8">
              <div className="h-10 w-10 rounded-2xl bg-foreground/[0.03] flex items-center justify-center border border-border/30">
                <stat.icon className="h-4 w-4 text-foreground/70 transition-transform duration-300 group-hover:scale-110 group-hover:text-foreground" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
              <h3 className="text-[13px] font-medium text-foreground/80 mt-1">{stat.label}</h3>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5 uppercase tracking-wide">{stat.sub}</p>
            </div>
          </Card>
        ))}

        {/* Mode Availability (Spans 2 cols on MD) */}
        <Card variant="glass" className="md:col-span-3 lg:col-span-2 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Mode Capabilities</h2>
            </div>
            <p className="text-[13px] text-muted-foreground/70 font-light">Available processing engines for your agents.</p>
          </div>
          <div className="grid gap-2">
            {capabilities.slice(0, 3).map((mode) => (
              <div className="flex items-center justify-between rounded-2xl border border-border/20 bg-foreground/[0.02] p-3 hover:bg-foreground/[0.04] transition-colors" key={mode.mode}>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{mode.label}</p>
                  <p className="text-[11px] text-muted-foreground/60">{mode.description}</p>
                </div>
                <Badge tone={mode.enabled ? "success" : "neutral"} dot size="sm" className="h-5 px-2 text-[10px] shrink-0">
                  {mode.enabled ? "Live" : "Waitlist"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Datasets (Spans 2 cols) */}
        <Card variant="glass" className="md:col-span-3 lg:col-span-2 rounded-[2rem] p-6 sm:p-8">
           <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Recent Activity</h2>
            </div>
            <Link href={workspaceHref(workspaceSlug, "/runs")}>
              <button className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">View All</button>
            </Link>
          </div>
          <div className="space-y-1">
             {runs.slice(0, 4).map((run) => {
               const agent = agents.find((a) => a.agent_id === run.agent_id);
               return (
                <Link href={workspaceHref(workspaceSlug, "/runs")} key={run.run_id}>
                  <div className="flex items-center justify-between rounded-2xl border border-transparent p-2.5 hover:bg-foreground/[0.03] hover:border-border/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-foreground/[0.05] border border-border/20 flex items-center justify-center">
                        <Activity className="h-3.5 w-3.5 text-foreground/60" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground group-hover:text-foreground">Query execution</p>
                        <p className="text-[11px] text-muted-foreground/60">{agent?.name ?? "Unknown Agent"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <Badge tone="success" dot size="sm" className="h-4 text-[9px]">Success</Badge>
                       <span className="text-[10px] text-muted-foreground/50">{run.latency_ms}ms</span>
                    </div>
                  </div>
                </Link>
               )
             })}
          </div>
        </Card>

      </div>
    </div>
  );
}
