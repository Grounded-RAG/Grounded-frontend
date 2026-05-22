"use client";

import { useState } from "react";
import { MessageSquareText, ThumbsUp, ThumbsDown, Minus, ExternalLink, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { feedbackEntries, runs, agents } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";

const ratingIcons = { positive: ThumbsUp, negative: ThumbsDown, neutral: Minus };
const statusTones: Record<string, "success" | "warn" | "neutral"> = { resolved: "success", triaged: "warn", new: "neutral" };

export function FeedbackScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const [selectedId, setSelectedId] = useState(feedbackEntries[0]?.feedback_id ?? "");
  const [filter, setFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const filtered = filter === "all" ? feedbackEntries : feedbackEntries.filter((f) => f.rating === filter);
  const selected = feedbackEntries.find((f) => f.feedback_id === selectedId) ?? feedbackEntries[0];
  const selectedRun = runs.find((r) => r.run_id === selected?.run_id);
  const selectedAgent = agents.find((a) => a.agent_id === selected?.agent_id);
  const pos = feedbackEntries.filter((f) => f.rating === "positive").length;
  const neg = feedbackEntries.filter((f) => f.rating === "negative").length;
  const neu = feedbackEntries.filter((f) => f.rating === "neutral").length;
  const total = feedbackEntries.length;

  return (
    <div className="page-grid animate-fade-in">
      <PageHeader eyebrow="Analytics" title="Feedback" description="Review answer quality, track ratings, and improve agent performance." />
      <Card variant="glass" className="rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Rating distribution</h3>
          <span className="text-[12px] text-muted-foreground">{total} total</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {pos > 0 && <div className="bg-emerald-500/70 rounded-full" style={{ width: `${(pos / total) * 100}%` }} />}
          {neu > 0 && <div className="bg-foreground/20 rounded-full" style={{ width: `${(neu / total) * 100}%` }} />}
          {neg > 0 && <div className="bg-red-500/60 rounded-full" style={{ width: `${(neg / total) * 100}%` }} />}
        </div>
        <div className="flex items-center gap-6 mt-3">
          {[{ l: "Positive", c: pos, cl: "bg-emerald-500/70" }, { l: "Neutral", c: neu, cl: "bg-foreground/20" }, { l: "Negative", c: neg, cl: "bg-red-500/60" }].map((i) => (
            <div key={i.l} className="flex items-center gap-2"><div className={cn("h-2.5 w-2.5 rounded-full", i.cl)} /><span className="text-[12px] text-muted-foreground">{i.l} ({i.c})</span></div>
          ))}
        </div>
      </Card>
      <div className="flex items-center gap-2">
        {(["all", "positive", "negative", "neutral"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg border px-3 py-1.5 text-[12px] font-medium capitalize transition-all", filter === f ? "border-foreground/30 bg-foreground/[0.06] text-foreground" : "border-border/30 text-muted-foreground hover:bg-foreground/[0.02]")}>{f}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<MessageSquareText className="h-10 w-10" />} title="No feedback yet" description="Feedback entries appear when users rate agent answers." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
          <Card variant="glass" className="max-h-[calc(100vh-18rem)] overflow-hidden flex flex-col rounded-2xl">
            <CardHeader title="Feedback inbox" />
            <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-none">
              {filtered.map((entry) => { const RI = ratingIcons[entry.rating]; const ag = agents.find((a) => a.agent_id === entry.agent_id); return (
                <button key={entry.feedback_id} onClick={() => setSelectedId(entry.feedback_id)} className={cn("w-full rounded-xl border p-3 text-left transition-all", entry.feedback_id === selectedId ? "border-foreground/10 bg-foreground/5" : "border-border/10 bg-secondary/5 hover:bg-secondary/15")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <RI className={cn("h-4 w-4 shrink-0", entry.rating === "positive" ? "text-emerald-500" : entry.rating === "negative" ? "text-red-500" : "text-muted-foreground")} />
                      <p className="text-[13px] font-medium text-foreground line-clamp-1">{ag?.name ?? "Unknown"}</p>
                    </div>
                    <Badge tone={statusTones[entry.status]} size="sm" className="text-[9px] shrink-0">{entry.status}</Badge>
                  </div>
                  {entry.comment && <p className="text-[12px] text-muted-foreground mt-1.5 line-clamp-2">{entry.comment}</p>}
                  <p className="text-[10px] text-muted-foreground/50 mt-1.5">{formatDate(entry.created_at)}</p>
                </button>
              ); })}
            </div>
          </Card>
          {selected && (
            <div className="grid content-start gap-6">
              <Card variant="glass" className="rounded-2xl">
                <CardHeader title="Feedback detail" eyebrow={selected.feedback_id} />
                <div className="grid gap-4">
                  {selected.comment && <div className="rounded-xl border border-border/15 bg-secondary/8 p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">Comment</p><p className="text-[13px] leading-relaxed text-foreground/80">{selected.comment}</p></div>}
                  <dl className="grid grid-cols-2 gap-3 rounded-xl border border-border/15 bg-secondary/8 p-4">
                    <div><dt className="text-[11px] text-muted-foreground">Agent</dt><dd className="mt-0.5 text-sm font-medium text-foreground">{selectedAgent?.name ?? "—"}</dd></div>
                    <div><dt className="text-[11px] text-muted-foreground">Status</dt><dd className="mt-0.5"><Badge tone={statusTones[selected.status]} size="sm">{selected.status}</Badge></dd></div>
                    <div><dt className="text-[11px] text-muted-foreground">Run</dt><dd className="mt-0.5 text-sm font-medium text-foreground">{selected.run_id}</dd></div>
                    <div><dt className="text-[11px] text-muted-foreground">Rating</dt><dd className="mt-0.5 text-sm font-medium text-foreground capitalize">{selected.rating}</dd></div>
                  </dl>
                  {selectedRun && <div className="rounded-xl border border-border/15 bg-secondary/8 p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">Linked query</p><p className="text-[13px] font-medium text-foreground">{selectedRun.query}</p><p className="text-[12px] text-muted-foreground/70 mt-2 line-clamp-3">{selectedRun.answer}</p></div>}
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5"><ExternalLink className="h-3 w-3" />View run</Button>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5"><CheckCircle2 className="h-3 w-3" />Mark resolved</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
