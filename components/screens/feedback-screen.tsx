"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, MessageSquareText, Minus, ThumbsDown, ThumbsUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listAgents, listRuns } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApiQuery } from "@/lib/use-api-query";
import type { Run } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const ratingIcons = {
  positive: ThumbsUp,
  negative: ThumbsDown,
  neutral: Minus,
} as const;

type Filter = "all" | "positive" | "negative";

export function FeedbackScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  void workspaceSlug;
  const { apiKey } = useAuth();
  const runsQuery = useApiQuery(() => listRuns(apiKey!, null, 200), [apiKey], Boolean(apiKey));
  const agentsQuery = useApiQuery(() => listAgents(apiKey!), [apiKey], Boolean(apiKey));
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allRuns = runsQuery.data ?? [];
  const agents = agentsQuery.data ?? [];
  const agentMap = useMemo(() => new Map(agents.map((a) => [a.agent_id, a])), [agents]);

  // Only runs that have feedback
  const ratedRuns = useMemo(
    () => allRuns.filter((run): run is Run & { feedback_rating: "positive" | "negative" } => Boolean(run.feedback_rating && run.feedback_rating !== null)),
    [allRuns],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return ratedRuns;
    return ratedRuns.filter((run) => run.feedback_rating === filter);
  }, [ratedRuns, filter]);

  const selected = filtered.find((run) => run.run_id === selectedId) ?? filtered[0] ?? null;

  const pos = ratedRuns.filter((r) => r.feedback_rating === "positive").length;
  const neg = ratedRuns.filter((r) => r.feedback_rating === "negative").length;
  const total = ratedRuns.length;

  return (
    <div className="page-grid animate-fade-in">
      <PageHeader
        eyebrow="Analytics"
        title="Feedback Annotations"
        description="Review answer quality, track ratings, and improve agent performance."
      />

      {/* Rating distribution bar */}
      {total > 0 && (
        <Card variant="glass" className="rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Rating distribution</h3>
            <span className="text-[12px] text-muted-foreground">{total} rated</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full gap-0.5">
            {pos > 0 && <div className="rounded-full bg-emerald-500/70" style={{ width: `${(pos / total) * 100}%` }} />}
            {neg > 0 && <div className="rounded-full bg-red-500/60" style={{ width: `${(neg / total) * 100}%` }} />}
          </div>
          <div className="mt-3 flex items-center gap-6">
            {[
              { l: "Positive", c: pos, cl: "bg-emerald-500/70" },
              { l: "Negative", c: neg, cl: "bg-red-500/60" },
            ].map((item) => (
              <div key={item.l} className="flex items-center gap-2">
                <div className={cn("h-2.5 w-2.5 rounded-full", item.cl)} />
                <span className="text-[12px] text-muted-foreground">{item.l} ({item.c})</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filter pills */}
      <div className="flex items-center gap-2">
        {(["all", "positive", "negative"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-[12px] font-medium capitalize transition-all",
              filter === f
                ? "border-foreground/30 bg-foreground/[0.06] text-foreground"
                : "border-border/30 text-muted-foreground hover:bg-foreground/[0.02]",
            )}
          >
            {f === "all" ? `All (${total})` : f === "positive" ? `Positive (${pos})` : `Negative (${neg})`}
          </button>
        ))}
      </div>

      {runsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading feedback…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquareText className="h-10 w-10" />}
          title={total === 0 ? "No feedback yet" : "No runs match this filter"}
          description={
            total === 0
              ? "Feedback entries appear when users rate agent answers with thumbs up or down."
              : "Try changing the filter above."
          }
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
          {/* Feedback list */}
          <Card variant="glass" className="flex max-h-[calc(100vh-20rem)] flex-col overflow-hidden rounded-2xl">
            <CardHeader title="Feedback inbox" />
            <div className="flex-1 space-y-1.5 overflow-y-auto scrollbar-none">
              {filtered.map((run) => {
                const rating = run.feedback_rating as "positive" | "negative";
                const RI = ratingIcons[rating];
                const agent = run.agent_id ? agentMap.get(run.agent_id) : null;
                return (
                  <button
                    key={run.run_id}
                    onClick={() => setSelectedId(run.run_id)}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-all",
                      run.run_id === (selected?.run_id) ? "border-foreground/10 bg-foreground/5" : "border-border/10 bg-secondary/5 hover:bg-secondary/15",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <RI className={cn("h-4 w-4 shrink-0", rating === "positive" ? "text-emerald-500" : "text-red-500")} />
                        <p className="line-clamp-1 text-[13px] font-medium text-foreground">
                          {agent?.name ?? "Agent"}
                        </p>
                      </div>
                      <Badge tone={rating === "positive" ? "success" : "warn"} size="sm" className="shrink-0 text-[9px] capitalize">
                        {rating}
                      </Badge>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-[12px] text-muted-foreground">{run.query}</p>
                    {run.feedback_text && (
                      <p className="mt-1 line-clamp-1 text-[11px] italic text-muted-foreground/60">&ldquo;{run.feedback_text}&rdquo;</p>
                    )}
                    <p className="mt-1.5 text-[10px] text-muted-foreground/50">{formatDate(run.created_at)}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Detail panel */}
          {selected ? (
            <div className="grid content-start gap-6">
              <Card variant="glass" className="rounded-2xl">
                <CardHeader title="Feedback detail" eyebrow={selected.run_id.slice(0, 8)} />
                <div className="grid gap-4">
                  {/* Query */}
                  <div className="rounded-xl border border-border/15 bg-secondary/8 p-4">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Query</p>
                    <p className="text-[13px] font-medium text-foreground">{selected.query}</p>
                  </div>
                  {/* Answer excerpt */}
                  <div className="rounded-xl border border-border/15 bg-secondary/8 p-4">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Answer</p>
                    <p className="line-clamp-4 text-[13px] leading-relaxed text-foreground/80">{selected.answer}</p>
                  </div>
                  {/* User comment */}
                  {selected.feedback_text && (
                    <div className="rounded-xl border border-border/15 bg-secondary/8 p-4">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Comment</p>
                      <p className="text-[13px] leading-relaxed text-foreground/80">{selected.feedback_text}</p>
                    </div>
                  )}
                  {/* Metadata grid */}
                  <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border/15 bg-secondary/8 p-4">
                    <div>
                      <dt className="text-[11px] text-muted-foreground">Agent</dt>
                      <dd className="mt-0.5 text-sm font-medium text-foreground">
                        {selected.agent_id ? (agentMap.get(selected.agent_id)?.name ?? selected.agent_id.slice(0, 8)) : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-muted-foreground">Rating</dt>
                      <dd className="mt-0.5 text-sm font-medium capitalize text-foreground">{selected.feedback_rating}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-muted-foreground">Mode</dt>
                      <dd className="mt-0.5 text-sm font-medium capitalize text-foreground">{selected.selected_mode ?? "auto"}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-muted-foreground">Confidence</dt>
                      <dd className="mt-0.5 text-sm font-medium capitalize text-foreground">
                        {Math.round(selected.confidence_score * 100)}% · {selected.confidence_label}
                      </dd>
                    </div>
                    {(selected.feedback_reasons?.length ?? 0) > 0 && (
                      <div className="col-span-2">
                        <dt className="text-[11px] text-muted-foreground">Reasons</dt>
                        <dd className="mt-1.5 flex flex-wrap gap-1.5">
                          {selected.feedback_reasons?.map((reason) => (
                            <span key={reason} className="rounded-full border border-border/20 bg-secondary/30 px-2 py-0.5 text-[11px] text-foreground/70 capitalize">
                              {reason.replace(/_/g, " ").toLowerCase()}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                      <ExternalLink className="h-3 w-3" />
                      View run
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5">
                      <CheckCircle2 className="h-3 w-3" />
                      Mark resolved
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
