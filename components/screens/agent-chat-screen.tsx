"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ChevronDown,
  FileText,
  Flag,
  GitBranch,
  LoaderCircle,
  MessageSquare,
  Plus,
  Send,
  Settings,
  ThumbsDown,
  ThumbsUp,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChatFeedbackModal } from "@/components/screens/chat-feedback-modal";
import {
  createAgentConversation,
  getAgent,
  getCapabilities,
  getConversationMessages,
  getRun,
  listAgentConversations,
  listDatasets,
  streamAgentChat,
  submitFeedback,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { workspaceHref } from "@/lib/utils";
import type {
  AgentChatResponse,
  Citation,
  Conversation,
  Dataset,
  FeedbackSubmission,
  Message,
  Run,
  UserFacingMode,
  WorkflowStep,
  WorkflowStepId,
} from "@/lib/types";
import { useApiQuery } from "@/lib/use-api-query";
import { cn, formatDate } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_LABELS: Record<WorkflowStepId, string> = {
  init: "Initialize",
  conversation_history: "Load Context",
  check_retrieval: "Analyze Query",
  research: "Retrieve Evidence",
  generate: "Generate Answer",
};

const STEP_ORDER: WorkflowStepId[] = [
  "init",
  "conversation_history",
  "check_retrieval",
  "research",
  "generate",
];

type ModeConfig = {
  label: string;
  description: string;
  dotColor: string;
  badgeColor: string;
  steps: string[];
};

const MODE_CONFIGS: Record<UserFacingMode, ModeConfig> = {
  auto: {
    label: "Auto",
    description: "Smart routing picks the best pipeline for each query.",
    dotColor: "bg-foreground/40",
    badgeColor: "text-foreground/60",
    steps: ["Analyze Query", "Route → Best mode", "Retrieve Evidence", "Generate Answer"],
  },
  instant: {
    label: "Instant",
    description: "Fast grounded answers with standard hybrid retrieval.",
    dotColor: "bg-amber-500",
    badgeColor: "text-amber-600 dark:text-amber-400",
    steps: ["Analyze Query", "Hybrid Retrieve", "Package Evidence", "Generate Answer"],
  },
  thinking: {
    label: "Thinking",
    description: "Deeper retrieval with cross-encoder reranking. Best for complex questions.",
    dotColor: "bg-blue-500",
    badgeColor: "text-blue-600 dark:text-blue-400",
    steps: ["Analyze Query", "Deep Retrieve ×24", "Rerank Evidence", "Generate Answer"],
  },
  verified: {
    label: "Verified",
    description: "Highest-assurance path. Every claim is independently verified.",
    dotColor: "bg-emerald-500",
    badgeColor: "text-emerald-600 dark:text-emerald-400",
    steps: ["Analyze Query", "Deep Retrieve", "Rerank + Verify", "Generate + Verify"],
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatMs(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

function groupConversationsByDate(
  conversations: Conversation[],
): Array<{ label: string; items: Conversation[] }> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);
  const startOfLastWeek = new Date(startOfToday.getTime() - 7 * 86_400_000);
  const startOfLastMonth = new Date(startOfToday.getTime() - 30 * 86_400_000);

  const buckets: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    "Last 30 days": [],
    Older: [],
  };

  for (const conv of conversations) {
    const d = new Date(conv.updated_at);
    if (d >= startOfToday) buckets["Today"].push(conv);
    else if (d >= startOfYesterday) buckets["Yesterday"].push(conv);
    else if (d >= startOfLastWeek) buckets["Last 7 days"].push(conv);
    else if (d >= startOfLastMonth) buckets["Last 30 days"].push(conv);
    else buckets["Older"].push(conv);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

// ─── ModeSwitcher ─────────────────────────────────────────────────────────────

function ModeSwitcher({
  mode,
  modes,
  onChange,
}: {
  mode: UserFacingMode;
  modes: UserFacingMode[];
  onChange: (m: UserFacingMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const config = MODE_CONFIGS[mode];
  const available = modes.length > 0 ? modes : (Object.keys(MODE_CONFIGS) as UserFacingMode[]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border/25 bg-foreground/[0.03] px-3 py-1.5 text-[12px] font-semibold transition-all hover:bg-foreground/[0.06]"
      >
        <span className={cn("h-2 w-2 rounded-full", config.dotColor)} />
        <span className={config.badgeColor}>{config.label}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-muted-foreground/50 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown opens DOWNWARD from the header */}
          <div className="absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-2xl border border-border/25 bg-background shadow-2xl shadow-black/10 dark:shadow-black/40">
            <div className="border-b border-border/15 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
                Execution Mode
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground/60">
                Changes how the pipeline retrieves and verifies answers.
              </p>
            </div>
            <div className="p-2">
              {available.map((m) => {
                const cfg = MODE_CONFIGS[m];
                const active = m === mode;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onChange(m);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-xl p-3 text-left transition-all",
                      active ? "bg-foreground/[0.05]" : "hover:bg-foreground/[0.03]",
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", cfg.dotColor)} />
                        <span
                          className={cn(
                            "text-[13px] font-semibold",
                            active ? cfg.badgeColor : "text-foreground",
                          )}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      {active && (
                        <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-[12px] leading-relaxed text-muted-foreground">
                      {cfg.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1">
                      {cfg.steps.map((step, i) => (
                        <span key={step} className="flex items-center gap-1">
                          <span className="rounded-md bg-foreground/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-foreground/60">
                            {step}
                          </span>
                          {i < cfg.steps.length - 1 && (
                            <span className="text-[10px] text-muted-foreground/30">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Markdown + Inline Citation Renderer ──────────────────────────────────────

function renderMarkdown(
  text: string,
  citations?: Citation[],
  onCitationClick?: (citation: Citation, index: number) => void,
): React.ReactNode {
  // Build lookup: citation_id → index, chunk_id → index
  const idToIndex = new Map<string, number>();
  if (citations) {
    citations.forEach((c, i) => {
      idToIndex.set(c.citation_id, i);
      idToIndex.set(c.chunk_id, i);
    });
  }

  function inlineFormat(line: string): React.ReactNode {
    // Match **bold**, `code`, and citation markers like [e001], [1], [abc123]
    const regex = /(\*\*(.+?)\*\*)|(`(.+?)`)|\[([a-zA-Z]?\d+[a-zA-Z0-9]*)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }

      if (match[1]) {
        parts.push(<strong key={match.index}>{match[2]}</strong>);
      } else if (match[3]) {
        parts.push(
          <code
            key={match.index}
            className="rounded bg-foreground/10 px-1 text-[12px] font-mono"
          >
            {match[4]}
          </code>,
        );
      } else if (match[5] !== undefined) {
        const refKey = match[5];
        // Try direct ID lookup first, then treat as 1-based number
        let citIndex = idToIndex.get(refKey);
        if (citIndex === undefined && !isNaN(Number(refKey))) {
          citIndex = Number(refKey) - 1;
        }

        if (
          citIndex !== undefined &&
          citations &&
          citIndex >= 0 &&
          citIndex < citations.length
        ) {
          const citation = citations[citIndex];
          const displayNum = citIndex + 1;
          parts.push(
            <button
              key={`${match.index}-cite`}
              type="button"
              onClick={() => onCitationClick?.(citation, citIndex!)}
              className="mx-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-500/15 px-1 text-[10px] font-bold text-blue-600 transition-all hover:bg-blue-500/25 dark:text-blue-400"
              style={{ verticalAlign: "super", fontSize: "10px", lineHeight: 1 }}
              title={`Source ${displayNum}: ${citation.document_id}`}
            >
              {displayNum}
            </button>,
          );
        } else {
          parts.push(match[0]);
        }
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) parts.push(line.slice(lastIndex));
    return parts.length > 0 ? parts : line;
  }

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const raw of lines) {
    const trimmed = raw.trim();

    if (trimmed.startsWith("## ")) {
      elements.push(
        <p key={key++} className="mt-3 mb-1 text-[13px] font-bold text-foreground">
          {inlineFormat(trimmed.slice(3))}
        </p>,
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <p key={key++} className="mt-3 mb-1 text-[14px] font-bold text-foreground">
          {inlineFormat(trimmed.slice(2))}
        </p>,
      );
    } else if (/^[-*]\s+/.test(trimmed)) {
      elements.push(
        <div key={key++} className="flex items-start gap-2 leading-relaxed">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/50" />
          <span>{inlineFormat(trimmed.replace(/^[-*]\s+/, ""))}</span>
        </div>,
      );
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\./)?.[1];
      elements.push(
        <div key={key++} className="flex items-start gap-2 leading-relaxed">
          <span className="mt-0.5 shrink-0 text-[11px] font-bold text-muted-foreground">{num}.</span>
          <span>{inlineFormat(trimmed.replace(/^\d+\.\s+/, ""))}</span>
        </div>,
      );
    } else if (trimmed === "") {
      if (elements.length > 0) elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <span key={key++} className="block leading-relaxed">
          {inlineFormat(trimmed)}
        </span>,
      );
    }
  }

  return <div className="space-y-0.5 text-[14px] text-foreground/90">{elements}</div>;
}

// ─── Citation Panel ───────────────────────────────────────────────────────────

function CitationPanel({
  citation,
  number,
  onClose,
}: {
  citation: Citation;
  number: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Format document ID into a readable name
  const docName = citation.document_id
    .replace(/[-_]/g, " ")
    .replace(/\.[^.]+$/, "")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl shadow-black/20 border-l border-border/20">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border/15 px-5 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[13px] font-bold text-blue-600 dark:text-blue-400">
            {number}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">{docName}</p>
            <p className="text-[11px] text-muted-foreground/60">
              Chunk {citation.chunk_index + 1}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Retrieved Passage
          </p>
          {/* Highlighted quote */}
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 border-l-4 border-l-blue-500">
            <p className="text-[14px] leading-relaxed text-foreground/90 italic">
              &ldquo;{citation.quote}&rdquo;
            </p>
          </div>

          <div className="mt-5 grid gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
              Source Details
            </p>
            <div className="overflow-hidden rounded-xl border border-border/15 bg-foreground/[0.02]">
              {[
                { label: "Document", value: citation.document_id },
                { label: "Chunk Position", value: `${citation.chunk_index + 1}` },
                { label: "Chunk ID", value: citation.chunk_id, mono: true },
              ].map(({ label, value, mono }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-b border-border/10 px-3 py-2.5 last:border-0"
                >
                  <span className="shrink-0 text-[11px] text-muted-foreground/60">{label}</span>
                  <span
                    className={cn(
                      "min-w-0 truncate text-right text-[12px] font-medium text-foreground/80",
                      mono && "font-mono text-[11px]",
                    )}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── WorkflowStrip ────────────────────────────────────────────────────────────

function WorkflowStrip({ steps }: { steps: WorkflowStep[] }) {
  const byId = new Map(steps.map((s) => [s.step, s]));

  return (
    <div className="pointer-events-none absolute bottom-32 left-0 right-0 z-20 px-4">
      <div className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-1.5 overflow-x-auto rounded-full border border-border/20 bg-background/80 px-3 py-2 shadow-lg backdrop-blur-xl">
        {STEP_ORDER.map((id) => {
          const step = byId.get(id);
          const status = step?.status ?? "idle";
          return (
            <div
              key={id}
              className={cn(
                "flex min-w-max items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium transition-all duration-300",
                status === "running" &&
                  "border-blue-400/40 bg-blue-400/10 text-blue-500",
                status === "completed" &&
                  "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
                status === "idle" &&
                  "border-border/15 bg-foreground/[0.02] text-muted-foreground/40",
              )}
            >
              {status === "running" ? (
                <LoaderCircle className="h-3 w-3 animate-spin" />
              ) : status === "completed" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
              <span>{STEP_LABELS[id]}</span>
              {step?.durationMs !== undefined && status === "completed" && (
                <span className="opacity-60">{formatMs(step.durationMs)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── QueryJourneyModal ────────────────────────────────────────────────────────

function getStepTags(stepId: WorkflowStepId, run: Run): string[] {
  const tags: string[] = [];
  const latencies = run.stage_latencies_ms ?? {};

  switch (stepId) {
    case "init": {
      const ms = (latencies as Record<string, number>).init_ms ?? 0;
      if (ms > 0 && ms < 200) tags.push("fast");
      break;
    }
    case "conversation_history":
      tags.push("context loaded");
      break;
    case "check_retrieval": {
      tags.push("routing");
      const reason = run.routing_reason ?? "";
      if (reason) {
        const short = reason.toLowerCase().replace(/_/g, " ");
        if (short.length <= 24) tags.push(short);
      }
      break;
    }
    case "research": {
      const count = run.retrieved_chunk_ids?.length ?? 0;
      if (count > 0) tags.push(`${count} chunk${count !== 1 ? "s" : ""}`);
      tags.push("semantic search");
      break;
    }
    case "generate": {
      if (run.verification_status === "passed") tags.push("verified");
      if (run.confidence_label) tags.push(`${run.confidence_label} confidence`);
      if (run.support_summary === "grounded") tags.push("grounded");
      break;
    }
  }

  return tags.filter(Boolean).slice(0, 3);
}

function QueryJourneyModal({ run, onClose }: { run: Run; onClose: () => void }) {
  const latencies = run.stage_latencies_ms ?? {};
  const lat = latencies as Record<string, number>;

  const steps = [
    { id: "init" as WorkflowStepId, label: "Initialize", ms: lat.init_ms ?? 0 },
    {
      id: "conversation_history" as WorkflowStepId,
      label: "Load Context",
      ms: lat.conversation_history_ms ?? 0,
    },
    {
      id: "check_retrieval" as WorkflowStepId,
      label: "Analyze Query",
      ms: lat.check_retrieval_ms ?? 0,
    },
    {
      id: "research" as WorkflowStepId,
      label: "Retrieve Evidence",
      ms: (lat.retrieval_ms ?? 0) + (lat.evidence_packaging_ms ?? 0),
    },
    { id: "generate" as WorkflowStepId, label: "Generate Answer", ms: lat.answering_ms ?? 0 },
  ].filter((s) => s.ms > 0);

  const total = steps.reduce((sum, s) => sum + s.ms, 0) || run.total_latency_ms || 1;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-border/25 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/15 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground/60" />
              <p className="text-[14px] font-semibold text-foreground">Query Journey</p>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground/60">
              <span className="capitalize">{run.effective_tier} tier</span>
              <span>·</span>
              <span className="capitalize">{run.selected_mode ?? "auto"} mode</span>
              {run.total_latency_ms > 0 && (
                <>
                  <span>·</span>
                  <span>{formatMs(run.total_latency_ms)} total</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.05]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="p-4">
          {steps.length === 0 ? (
            <div className="rounded-2xl border border-border/15 bg-foreground/[0.02] p-4 text-center text-sm text-muted-foreground">
              Detailed stage timing is not available for this run.
            </div>
          ) : (
            <div className="relative">
              {/* Vertical connector */}
              <div className="absolute left-[17px] top-9 bottom-4 w-px bg-border/20" />

              <div className="grid gap-2">
                {steps.map((step) => {
                  const pct = Math.max(2, Math.round((step.ms / total) * 100));
                  const tags = getStepTags(step.id, run);
                  return (
                    <div key={step.label} className="relative flex gap-3">
                      {/* Step icon */}
                      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                      </div>

                      {/* Step card */}
                      <div className="mb-1 flex-1 overflow-hidden rounded-xl border border-border/15 bg-foreground/[0.02] p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[13px] font-medium text-foreground">
                            {step.label}
                          </span>
                          <span className="font-mono text-[12px] font-semibold text-muted-foreground">
                            {formatMs(step.ms)}
                          </span>
                        </div>

                        {/* Latency bar */}
                        <div className="mb-2 h-1 overflow-hidden rounded-full bg-foreground/[0.07]">
                          <div
                            className="h-full rounded-full bg-emerald-500/50 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-border/20 bg-foreground/[0.03] px-2 py-0.5 text-[10px] font-medium text-muted-foreground/70"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary row */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              {
                label: "Routing",
                value: run.routing_reason?.replace(/_/g, " ") ?? "—",
              },
              { label: "Support", value: run.support_summary ?? "—" },
              { label: "Verification", value: run.verification_status ?? "—" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-border/15 bg-foreground/[0.02] p-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  {label}
                </p>
                <p className="mt-1 truncate text-[12px] font-medium capitalize text-foreground/80">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MessageTrustReview ───────────────────────────────────────────────────────

function MessageTrustReview({
  run,
  feedback,
  onJourney,
  onFeedback,
  onCitationClick,
}: {
  run: Run;
  feedback?: "positive" | "negative";
  onJourney: () => void;
  onFeedback: (rating: "positive" | "negative") => void;
  onCitationClick: (citation: Citation, index: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const rating = feedback ?? run.feedback_rating ?? null;
  const confidence = Math.round(run.confidence_score * 100);

  const confidenceColor =
    confidence >= 70
      ? "text-emerald-600 dark:text-emerald-500"
      : confidence >= 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-500";

  return (
    <div className="mt-2 pl-1">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-border/20 bg-foreground/[0.02] px-3 py-1.5 text-xs transition-all hover:bg-foreground/[0.04]"
        >
          <span className={cn("flex items-center gap-1.5 font-semibold", confidenceColor)}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            {confidence}% Confidence
          </span>
          {run.citations.length > 0 && (
            <>
              <span className="h-3 w-px bg-border/40" />
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-3 w-3" />
                {run.citations.length}{" "}
                {run.citations.length === 1 ? "citation" : "citations"}
              </span>
            </>
          )}
          <ChevronDown
            className={cn(
              "h-3 w-3 text-muted-foreground/50 transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
        </button>

        <button
          type="button"
          onClick={onJourney}
          className="flex items-center gap-1.5 rounded-full border border-border/20 bg-foreground/[0.02] px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-foreground/[0.04] hover:text-foreground"
        >
          <GitBranch className="h-3 w-3" />
          Journey
        </button>

        <button
          type="button"
          onClick={() => onFeedback("positive")}
          className={cn(
            "rounded-full border border-border/20 p-1.5 text-muted-foreground transition-all hover:text-foreground",
            rating === "positive" &&
              "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
          )}
          title="Helpful"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onFeedback("negative")}
          className={cn(
            "rounded-full border border-border/20 p-1.5 text-muted-foreground transition-all hover:text-foreground",
            rating === "negative" && "border-red-500/30 bg-red-500/10 text-red-500",
          )}
          title="Needs work"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-border/20 bg-foreground/[0.015]">
          {run.routing_reason && (
            <div className="border-b border-border/15 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                Routing Reason
              </p>
              <p className="text-[13px] leading-relaxed text-foreground/80">{run.routing_reason}</p>
            </div>
          )}

          {run.degraded_reasons.length > 0 && (
            <div className="border-b border-border/15 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                <Flag className="h-3 w-3" />
                Degraded Reasons
              </p>
              <div className="flex flex-wrap gap-1.5">
                {run.degraded_reasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400"
                  >
                    {reason.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {run.citations.length > 0 && (
            <div className="p-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                Supporting Evidence
              </p>
              <div className="grid gap-2">
                {run.citations.map((cite, index) => (
                  <button
                    key={cite.citation_id}
                    type="button"
                    onClick={() => onCitationClick(cite, index)}
                    className="flex items-start gap-3 rounded-xl border border-border/15 bg-background/60 p-3 text-left transition-all hover:border-border/30 hover:bg-background"
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-muted-foreground/60">
                        {cite.document_id}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-foreground/80">
                        &ldquo;{cite.quote}&rdquo;
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Local Types ──────────────────────────────────────────────────────────────

type LocalExchange =
  | {
      status: "pending";
      userKey: string;
      assistantKey: string;
      conversationId: string | null;
      message: string;
      submittedAt: string;
      mode: UserFacingMode;
      datasetId?: string;
    }
  | {
      status: "error";
      userKey: string;
      assistantKey: string;
      conversationId: string | null;
      message: string;
      submittedAt: string;
      mode: UserFacingMode;
      datasetId?: string;
      error: string;
    };

type VisibleMessage =
  | (Message & { local?: false; pending?: false; error?: false })
  | {
      message_id: string;
      conversation_id: string;
      created_by_api_key_id: null;
      run_id: string | null;
      role: "user" | "assistant";
      content: string;
      created_at: string;
      local: true;
      pending?: boolean;
      error?: boolean;
    };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildRunFromResponse(response: AgentChatResponse, query: string): Run {
  return {
    run_id: response.run_id,
    dataset_id: response.dataset_id,
    agent_id: response.agent_id,
    conversation_id: response.conversation_id,
    selected_mode: response.mode,
    requested_tier: null,
    router_recommendation: "standard",
    effective_tier: "standard",
    routing_reason: "Generated from agent chat",
    query,
    answer: response.answer,
    citations: response.citations,
    confidence_score: response.confidence_score,
    confidence_label: response.confidence_label,
    support_summary: response.support_summary,
    verification_status: response.verification_status,
    degraded_reasons: response.degraded_reasons,
    generator_provider: response.generator_provider,
    provider_backend: response.provider_backend,
    provider_model: response.provider_model,
    provider_fallback_used: response.provider_fallback_used,
    provider_fallback_from: response.provider_fallback_from,
    retrieved_chunk_ids: [],
    selected_evidence_ids: [],
    stage_latencies_ms: {},
    total_latency_ms: 0,
    feedback_rating: null,
    feedback_reasons: [],
    feedback_text: null,
    created_at: new Date().toISOString(),
  };
}

function stageLatenciesFromSteps(steps: WorkflowStep[]): Record<string, number> {
  const byStep = new Map(steps.map((s) => [s.step, s.durationMs ?? 0]));
  return {
    init_ms: byStep.get("init") ?? 0,
    conversation_history_ms: byStep.get("conversation_history") ?? 0,
    check_retrieval_ms: byStep.get("check_retrieval") ?? 0,
    retrieval_ms: byStep.get("research") ?? 0,
    evidence_packaging_ms: 0,
    answering_ms: byStep.get("generate") ?? 0,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AgentChatScreen({ id, workspaceSlug }: { id: string; workspaceSlug?: string }) {
  const { apiKey, workspaceId } = useAuth();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const agentQuery = useApiQuery(() => getAgent(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const conversationsQuery = useApiQuery(
    () => listAgentConversations(apiKey!, id),
    [apiKey, id],
    Boolean(apiKey),
  );
  const capabilitiesQuery = useApiQuery(
    () => getCapabilities(apiKey!),
    [apiKey],
    Boolean(apiKey),
  );
  const datasetsQuery = useApiQuery(
    () => listDatasets(apiKey!, workspaceId),
    [apiKey, workspaceId],
    Boolean(apiKey && workspaceId),
  );

  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesQuery = useApiQuery(
    () => getConversationMessages(apiKey!, conversationId!),
    [apiKey, conversationId],
    Boolean(apiKey && conversationId),
  );

  const [runById, setRunById] = useState<Record<string, Run>>({});
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<UserFacingMode>("auto");
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [localExchange, setLocalExchange] = useState<LocalExchange | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [journeyRun, setJourneyRun] = useState<Run | null>(null);
  const [feedbackRunId, setFeedbackRunId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<"positive" | "negative">("negative");
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "positive" | "negative">>(
    {},
  );
  const [activeCitation, setActiveCitation] = useState<{
    citation: Citation;
    number: number;
  } | null>(null);

  const agent = agentQuery.data;
  const conversations = conversationsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const modes = capabilitiesQuery.data?.modes.filter((m) => m.enabled) ?? [];
  const datasets = datasetsQuery.data ?? [];

  const attachedDatasets = useMemo(() => {
    const ids = new Set(agent?.dataset_ids ?? []);
    return datasets.filter((d) => ids.has(d.dataset_id));
  }, [agent?.dataset_ids, datasets]);

  const conversationGroups = useMemo(
    () => groupConversationsByDate(conversations),
    [conversations],
  );

  useEffect(() => {
    if (!conversationId && conversations[0]) {
      setConversationId(conversations[0].conversation_id);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    if (agent?.default_mode) setMode(agent.default_mode);
  }, [agent?.default_mode]);

  useEffect(() => {
    if (attachedDatasets.length === 0) {
      setSelectedDatasetId("");
      return;
    }
    if (!attachedDatasets.some((d) => d.dataset_id === selectedDatasetId)) {
      setSelectedDatasetId(attachedDatasets[0].dataset_id);
    }
  }, [attachedDatasets, selectedDatasetId]);

  useEffect(() => {
    if (!apiKey) return;
    const missing = messages
      .map((m) => m.run_id)
      .filter((rid): rid is string => Boolean(rid && !runById[rid]));
    if (missing.length === 0) return;

    let cancelled = false;
    async function hydrate() {
      const rows = await Promise.all(
        Array.from(new Set(missing)).map(async (rid) => {
          try {
            return await getRun(apiKey!, rid);
          } catch {
            return null;
          }
        }),
      );
      if (cancelled) return;
      setRunById((cur) => {
        const next = { ...cur };
        for (const r of rows) if (r) next[r.run_id] = r;
        return next;
      });
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [apiKey, messages, runById]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, localExchange?.status, conversationId]);

  async function newConversation() {
    if (!apiKey) return;
    const created = await createAgentConversation(apiKey, id, { title: "New chat", mode });
    setConversationId(created.conversation_id);
    setLocalExchange(null);
    await conversationsQuery.reload();
  }

  function resolveDatasetId() {
    if (!agent) return undefined;
    if (agent.dataset_ids.length === 1) return agent.dataset_ids[0];
    return selectedDatasetId || undefined;
  }

  async function handleSend() {
    const trimmed = message.trim();
    if (!apiKey || !agent || !trimmed || isSending) return;

    const datasetId = resolveDatasetId();
    if (!datasetId) {
      setErrorMessage("Attach or select a dataset before chatting with this agent.");
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setWorkflowSteps([]);

    const submittedAt = new Date().toISOString();
    const local: LocalExchange = {
      status: "pending",
      userKey: `local-user-${Date.now()}`,
      assistantKey: `local-assistant-${Date.now()}`,
      conversationId,
      message: trimmed,
      submittedAt,
      mode,
      datasetId,
    };
    setLocalExchange(local);
    setMessage("");

    try {
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const created = await createAgentConversation(apiKey, id, {
          title: trimmed.slice(0, 80) || "New chat",
          mode,
        });
        activeConversationId = created.conversation_id;
        setConversationId(activeConversationId);
      }

      let streamedSteps: WorkflowStep[] = [];
      for await (const event of streamAgentChat(apiKey, id, {
        conversation_id: activeConversationId,
        message: trimmed,
        mode,
        dataset_id: datasetId,
      })) {
        if (event.type === "step_started") {
          streamedSteps = streamedSteps.some((s) => s.step === event.step)
            ? streamedSteps.map((s) =>
                s.step === event.step ? { ...s, status: "running" as const } : s,
              )
            : [
                ...streamedSteps,
                { step: event.step, label: event.label, status: "running" as const },
              ];
          setWorkflowSteps(streamedSteps);
        }

        if (event.type === "step_completed") {
          streamedSteps = streamedSteps.map((s) =>
            s.step === event.step
              ? {
                  ...s,
                  status: "completed" as const,
                  durationMs: event.duration_ms,
                  metadata: {
                    ...(event.evidence_count !== undefined
                      ? { evidence_count: event.evidence_count }
                      : {}),
                    ...(event.message_count !== undefined
                      ? { message_count: event.message_count }
                      : {}),
                  },
                }
              : s,
          );
          setWorkflowSteps(streamedSteps);
        }

        if (event.type === "answer") {
          const fallback = {
            ...buildRunFromResponse(event.data, trimmed),
            stage_latencies_ms: stageLatenciesFromSteps(streamedSteps),
          };
          let run: Run = fallback;
          try {
            run = await getRun(apiKey, event.data.run_id);
          } catch {
            // Keep fallback run with streamed latencies
          }
          setRunById((cur) => ({ ...cur, [run.run_id]: run }));
          setConversationId(event.data.conversation_id);
          setLocalExchange(null);
          await messagesQuery.reload();
          await conversationsQuery.reload();
        }

        if (event.type === "error") throw new Error(event.detail);
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unable to send the message.";
      setErrorMessage(detail);
      setLocalExchange({ ...local, status: "error", error: detail });
    } finally {
      setIsSending(false);
    }
  }

  async function handleFeedback(runId: string, fb: FeedbackSubmission) {
    if (!apiKey) return;
    const updated = await submitFeedback(apiKey, runId, fb);
    setRunById((cur) => ({ ...cur, [runId]: updated }));
    setMessageFeedback((cur) => ({ ...cur, [runId]: fb.rating }));
  }

  const visibleMessages = useMemo<VisibleMessage[]>(() => {
    const rows: VisibleMessage[] = messages.map((m) => ({ ...m, local: false }));
    if (!localExchange) return rows;

    const matchesConversation =
      !localExchange.conversationId ||
      !conversationId ||
      localExchange.conversationId === conversationId ||
      messages.length === 0;
    if (!matchesConversation) return rows;

    const alreadyHasUser = rows.some(
      (m) =>
        m.role === "user" &&
        m.content.trim() === localExchange.message.trim() &&
        new Date(m.created_at).getTime() >=
          new Date(localExchange.submittedAt).getTime() - 5000,
    );

    return [
      ...rows,
      ...(alreadyHasUser
        ? []
        : [
            {
              message_id: localExchange.userKey,
              conversation_id: localExchange.conversationId ?? "local",
              created_by_api_key_id: null,
              run_id: null,
              role: "user" as const,
              content: localExchange.message,
              created_at: localExchange.submittedAt,
              local: true as const,
            },
          ]),
      {
        message_id: localExchange.assistantKey,
        conversation_id: localExchange.conversationId ?? "local",
        created_by_api_key_id: null,
        run_id: null,
        role: "assistant" as const,
        content: localExchange.status === "error" ? localExchange.error : "",
        created_at: localExchange.submittedAt,
        local: true as const,
        pending: localExchange.status === "pending",
        error: localExchange.status === "error",
      },
    ];
  }, [conversationId, localExchange, messages]);

  return (
    <div className="glass relative flex h-full w-full overflow-hidden rounded-[2.5rem] border border-border/30 shadow-2xl shadow-black/5 dark:shadow-black/20">
      {/* ── Conversations sidebar ── */}
      <div className="hidden w-64 shrink-0 flex-col border-r border-border/20 bg-foreground/[0.01] xl:flex">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/15 px-4">
          <h2 className="text-[13px] font-semibold text-foreground">Conversations</h2>
          <button
            type="button"
            onClick={newConversation}
            title="New Chat"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto py-3">
          {conversationGroups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <MessageSquare className="h-6 w-6 text-muted-foreground/25" />
              <p className="text-[12px] text-muted-foreground/50">No conversations yet</p>
            </div>
          ) : (
            conversationGroups.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="mb-1 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/35">
                  {group.label}
                </p>
                <div className="grid gap-0.5 px-2">
                  {group.items.map((conv) => (
                    <button
                      key={conv.conversation_id}
                      type="button"
                      onClick={() => {
                        setConversationId(conv.conversation_id);
                        setLocalExchange(null);
                      }}
                      className={cn(
                        "group flex w-full min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all",
                        conv.conversation_id === conversationId
                          ? "bg-foreground/[0.07] text-foreground"
                          : "text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground",
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{conv.title}</p>
                        <p className="text-[10px] text-muted-foreground/50">
                          {formatDate(conv.updated_at)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="relative flex h-full flex-1 flex-col bg-gradient-to-b from-transparent to-background/40">
        {/* Header */}
        <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/15 bg-background/60 px-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/20 bg-foreground/[0.05]">
              <Bot className="h-4 w-4 text-foreground/80" />
            </div>
            <div>
              <h1 className="text-[14px] font-semibold leading-tight text-foreground">
                {agent?.name ?? "Agent"}
              </h1>
              <p className="text-[11px] leading-tight text-muted-foreground/60">
                {agent?.dataset_ids.length ?? 0}{" "}
                {(agent?.dataset_ids.length ?? 0) === 1 ? "dataset" : "datasets"} connected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModeSwitcher
              mode={mode}
              modes={modes.map((m) => m.mode)}
              onChange={setMode}
            />
            <Link href={workspaceHref(workspaceSlug, `/agents/${id}/edit`)}>
              <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-full border border-border/20 px-3 text-[12px] text-muted-foreground transition-all hover:bg-foreground/[0.04] hover:text-foreground"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </button>
            </Link>
          </div>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Messages */}
        <div className="scrollbar-none flex-1 overflow-y-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6 pb-56 pt-8">
            {visibleMessages.length === 0 ? (
              <div className="flex flex-col items-center gap-3 pt-20 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/20 bg-foreground/[0.03]">
                  <Bot className="h-6 w-6 text-muted-foreground/35" />
                </div>
                <p className="text-sm font-medium text-foreground/60">
                  Start a grounded conversation
                </p>
                <p className="text-xs text-muted-foreground/40">
                  Ask a question and get answers with cited evidence.
                </p>
              </div>
            ) : (
              visibleMessages.map((item) => {
                const msgRun = item.run_id ? runById[item.run_id] : null;
                return (
                  <div
                    key={item.message_id}
                    className={cn(
                      "flex w-full",
                      item.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {item.role === "user" ? (
                      <div className="max-w-[80%] md:max-w-[70%]">
                        <div className="rounded-[1.5rem] rounded-tr-sm bg-foreground px-5 py-3.5 text-background shadow-sm">
                          <p className="whitespace-pre-wrap text-[14px] leading-relaxed">
                            {item.content}
                          </p>
                        </div>
                        <p className="mt-1.5 px-2 text-right text-[10px] text-muted-foreground/40">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex max-w-[90%] gap-3 md:max-w-[80%]">
                        <div className="mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/20 bg-foreground/[0.04] sm:flex">
                          <Bot className="h-4 w-4 text-foreground/70" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              "rounded-[1.5rem] rounded-tl-sm border border-border/20 bg-background/70 px-5 py-4 shadow-sm",
                              item.error && "border-red-500/25 bg-red-500/5",
                            )}
                          >
                            {item.pending ? (
                              <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                                <LoaderCircle className="h-4 w-4 animate-spin text-blue-500" />
                                <span>Working through the grounded pipeline…</span>
                              </div>
                            ) : item.error ? (
                              <p className="text-[14px] text-red-500">{item.content}</p>
                            ) : (
                              renderMarkdown(
                                item.content,
                                msgRun?.citations ?? [],
                                (citation, idx) =>
                                  setActiveCitation({ citation, number: idx + 1 }),
                              )
                            )}
                          </div>

                          {msgRun && (
                            <MessageTrustReview
                              run={msgRun}
                              feedback={messageFeedback[msgRun.run_id]}
                              onJourney={() => setJourneyRun(msgRun)}
                              onFeedback={(rating) => {
                                setFeedbackRunId(msgRun.run_id);
                                setFeedbackRating(rating);
                              }}
                              onCitationClick={(citation, idx) =>
                                setActiveCitation({ citation, number: idx + 1 })
                              }
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* Live workflow strip */}
        {(isSending || workflowSteps.length > 0) && <WorkflowStrip steps={workflowSteps} />}

        {/* Input area */}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 px-4">
          <div className="mx-auto max-w-3xl">
            <div className="pointer-events-auto overflow-hidden rounded-[1.75rem] border border-border/40 bg-background shadow-xl shadow-black/10">
              <div className="flex items-end gap-2 px-4 pt-3">
                <textarea
                  className="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent py-2 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
                  placeholder="Ask a question…"
                  rows={1}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={isSending || !message.trim()}
                  className="mb-1 h-9 w-9 shrink-0 rounded-full p-0"
                >
                  {isSending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="ml-0.5 h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between border-t border-border/10 px-4 py-2">
                <div className="flex items-center gap-2">
                  {attachedDatasets.length > 1 && (
                    <SelectPill value={selectedDatasetId} onChange={setSelectedDatasetId}>
                      {attachedDatasets.map((d: Dataset) => (
                        <option key={d.dataset_id} value={d.dataset_id}>
                          {d.name}
                        </option>
                      ))}
                    </SelectPill>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
                    <Zap className="h-3 w-3" />
                    <span>Grounded · {MODE_CONFIGS[mode]?.label ?? mode}</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground/35">↵ to send</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Overlays ── */}
      {journeyRun && (
        <QueryJourneyModal run={journeyRun} onClose={() => setJourneyRun(null)} />
      )}

      {activeCitation && (
        <CitationPanel
          citation={activeCitation.citation}
          number={activeCitation.number}
          onClose={() => setActiveCitation(null)}
        />
      )}

      {feedbackRunId && (
        <ChatFeedbackModal
          rating={feedbackRating}
          onClose={() => setFeedbackRunId(null)}
          onSubmit={(fb) => handleFeedback(feedbackRunId, fb)}
        />
      )}
    </div>
  );
}

// ─── SelectPill ────────────────────────────────────────────────────────────────

function SelectPill({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-w-0">
      <select
        className="max-w-36 appearance-none truncate rounded-full border border-border/20 bg-foreground/[0.04] py-1 pl-2.5 pr-6 text-[10px] font-medium text-foreground outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
