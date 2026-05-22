import { BarChart3, Database, Bot, KeyRound, FileText, Zap } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { datasets, documents, agents, apiKeys, runs } from "@/lib/mock-data";

const modeUsage = [
  { mode: "Auto", count: 124, pct: 48 },
  { mode: "Instant", count: 89, pct: 35 },
  { mode: "Thinking", count: 31, pct: 12 },
  { mode: "Verified", count: 12, pct: 5 },
];
const monthlyTrend = [
  { month: "Jan", queries: 45 }, { month: "Feb", queries: 82 },
  { month: "Mar", queries: 128 }, { month: "Apr", queries: 210 },
  { month: "May", queries: 256 },
];
const maxTrend = Math.max(...monthlyTrend.map((m) => m.queries));

export function UsageScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const totalStorage = documents.reduce((s, d) => s + d.file_size_bytes, 0);
  const totalQueries = 256;
  const queryLimit = 1000;

  return (
    <div className="page-grid animate-fade-in">
      <PageHeader eyebrow="Analytics" title="Usage" description="Track queries, storage, ingestion, and API key activity across your workspace." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Queries", value: totalQueries.toString(), limit: queryLimit.toString(), pct: Math.round((totalQueries / queryLimit) * 100), icon: Zap },
          { label: "Documents", value: documents.length.toString(), limit: "500", pct: Math.round((documents.length / 500) * 100), icon: FileText },
          { label: "Storage", value: `${(totalStorage / 1024 / 1024).toFixed(1)} MB`, limit: "5 GB", pct: Math.round((totalStorage / (5 * 1024 * 1024 * 1024)) * 100), icon: Database },
          { label: "API Keys", value: apiKeys.filter((k) => !k.revoked_at).length.toString(), limit: "10", pct: Math.round((apiKeys.filter((k) => !k.revoked_at).length / 10) * 100), icon: KeyRound },
        ].map((m) => (
          <Card key={m.label} variant="glass" className="rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="h-9 w-9 rounded-xl bg-foreground/[0.04] flex items-center justify-center border border-border/20">
                <m.icon className="h-4 w-4 text-foreground/60" />
              </div>
              <span className="text-[11px] text-muted-foreground">{m.pct}%</span>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">{m.value}</p>
            <p className="text-[12px] text-muted-foreground/70 mt-0.5">{m.label}</p>
            <ProgressBar value={m.pct} max={100} className="mt-3 h-1.5" tone={m.pct > 80 ? "warn" : "accent"} />
            <p className="text-[10px] text-muted-foreground/50 mt-1.5">of {m.limit} included</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Query trend" eyebrow="Monthly" />
          <div className="flex items-end gap-3 h-40 mt-4">
            {monthlyTrend.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full group/bar relative">
                  <div className="w-full rounded-lg bg-foreground/10 hover:bg-foreground/20 transition-all" style={{ height: `${(m.queries / maxTrend) * 130}px` }} />
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">{m.queries}</div>
                </div>
                <span className="text-[10px] text-muted-foreground/60 font-medium">{m.month}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Mode breakdown" eyebrow="All time" />
          <div className="grid gap-3 mt-2">
            {modeUsage.map((m) => (
              <div key={m.mode}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium text-foreground">{m.mode}</span>
                  <span className="text-[12px] text-muted-foreground tabular-nums">{m.count} queries ({m.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-foreground/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-foreground/20 transition-all" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
