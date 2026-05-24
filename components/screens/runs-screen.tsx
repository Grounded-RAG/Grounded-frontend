"use client";

import { useState } from "react";
import { Clock, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ModeBadge, VerificationBadge } from "@/components/ui/status";
import { TrustPanel } from "@/components/trust-panel";
import { runs } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";

export function RunsScreen() {
  const [selectedId, setSelectedId] = useState(runs[0]?.run_id ?? "");
  const selected = runs.find((r) => r.run_id === selectedId) ?? runs[0];

  return (
    <div className="page-grid animate-fade-in">
      <PageHeader description="Search prior executions, inspect routing, review answers, and verify evidence." />

      {runs.length === 0 ? (
        <EmptyState icon={<Clock className="h-10 w-10" />} title="No runs yet" description="Runs appear after you ask questions through an agent." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
          <Card variant="glass" className="max-h-[calc(100vh-14rem)] overflow-hidden flex flex-col rounded-2xl">
            <CardHeader title="Run list" action={
              <div className="flex h-8 w-full items-center gap-2 rounded-full bg-card px-3">
                <Search className="h-3.5 w-3.5 text-muted-foreground/40" />
                <input className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/40" placeholder="Search..." />
              </div>
            } />
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {runs.map((run) => (
                <button key={run.run_id} onClick={() => setSelectedId(run.run_id)} className={cn("w-full rounded-xl border p-3 text-left transition-all", run.run_id === selectedId ? "border-foreground/10 bg-foreground/5" : "border-border/10 bg-secondary/5 hover:bg-secondary/15")}>
                  <p className="text-sm font-medium text-foreground line-clamp-2">{run.query}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <VerificationBadge status={run.verification_status} />
                    <ModeBadge mode={run.selected_mode ?? "auto"} />
                  </div>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">{formatDate(run.created_at)}</p>
                </button>
              ))}
            </div>
          </Card>

          <div className="grid content-start gap-6">
            <Card variant="glass" className="rounded-2xl">
              <CardHeader title={selected.query} eyebrow={selected.run_id} />
              <p className="leading-relaxed text-sm text-foreground/80">{selected.answer}</p>
              <div className="mt-5 grid gap-3 rounded-xl border border-border/10 bg-secondary/8 p-4 sm:grid-cols-3">
                <DetailRow label="Execution depth" value={selected.effective_tier} />
                <DetailRow label="Latency" value={`${selected.total_latency_ms}ms`} />
                <DetailRow label="Provider" value={selected.generator_provider} />
                <DetailRow label="Mode" value={selected.selected_mode ?? "auto"} />
                <DetailRow label="Requested depth" value={selected.requested_tier ?? "None"} />
                <DetailRow label="Fallback" value={selected.provider_fallback_used ? `from ${selected.provider_fallback_from}` : "None"} />
              </div>
            </Card>
            <TrustPanel run={selected} />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd></div>;
}
