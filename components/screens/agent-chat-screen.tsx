"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  GitBranch,
  Info,
  LoaderCircle,
  MessageSquare,
  Minus,
  Move,
  Plus,
  Search,
  Send,
  Settings,
  ThumbsDown,
  ThumbsUp,
  X,
  Zap,
  Maximize2,
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
  listDatasetDocuments,
  listDatasets,
  streamAgentChat,
  submitFeedback,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  type AgentChatResponse,
  type Citation,
  type Conversation,
  type Dataset,
  type DatasetDocument,
  type FeedbackSubmission,
  type Message,
  type Run,
  type UserFacingMode,
  type WorkflowStep,
  type WorkflowStepId,
} from "@/lib/types";
import { useApiQuery } from "@/lib/use-api-query";
import { cn, formatDate, workspaceHref } from "@/lib/utils";

const STEP_LABELS: Record<WorkflowStepId, string> = {
  init: "Initialize",
  conversation_history: "Load Context",
  check_retrieval: "Analyze Query",
  research: "Retrieve Evidence",
  generate: "Generate Answer",
};

const STEP_DESCRIPTIONS: Record<WorkflowStepId, string> = {
  init: "Prepare the run context, selected mode, and target dataset.",
  conversation_history: "Pull the relevant prior messages for follow-up grounding.",
  check_retrieval: "Decide whether retrieval is needed and how deep it should go.",
  research: "Search indexed evidence and package the best supporting chunks.",
  generate: "Compose the grounded answer and attach citations.",
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
    steps: ["Analyze Query", "Route best path", "Retrieve Evidence", "Generate Answer"],
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
    description: "Deeper retrieval with stronger evidence selection for harder questions.",
    dotColor: "bg-sky-500",
    badgeColor: "text-sky-600 dark:text-sky-400",
    steps: ["Analyze Query", "Deep Retrieve", "Refine Evidence", "Generate Answer"],
  },
  verified: {
    label: "Verified",
    description: "Highest-assurance path with additional verification and checks.",
    dotColor: "bg-emerald-500",
    badgeColor: "text-emerald-600 dark:text-emerald-400",
    steps: ["Analyze Query", "Deep Retrieve", "Verify Support", "Generate Answer"],
  },
};

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

type InspectorState =
  | { type: "workflow"; runId: string | null; live: boolean }
  | { type: "journey"; runId: string | null; live: boolean }
  | { type: "source"; runId: string; citationIndex: number };

function formatMs(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

function toLabel(raw: string): string {
  return raw.replace(/_/g, " ").toLowerCase().replace(/^\w/, (char) => char.toUpperCase());
}

function getDocumentLabel(documentId: string, title?: string | null) {
  const raw = title && title.trim() ? title : documentId;
  return raw
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

  for (const conversation of conversations) {
    const date = new Date(conversation.updated_at);
    if (date >= startOfToday) buckets.Today.push(conversation);
    else if (date >= startOfYesterday) buckets.Yesterday.push(conversation);
    else if (date >= startOfLastWeek) buckets["Last 7 days"].push(conversation);
    else if (date >= startOfLastMonth) buckets["Last 30 days"].push(conversation);
    else buckets.Older.push(conversation);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

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
  const byStep = new Map(steps.map((step) => [step.step, step.durationMs ?? 0]));
  return {
    init_ms: byStep.get("init") ?? 0,
    conversation_history_ms: byStep.get("conversation_history") ?? 0,
    check_retrieval_ms: byStep.get("check_retrieval") ?? 0,
    retrieval_ms: byStep.get("research") ?? 0,
    evidence_packaging_ms: 0,
    answering_ms: byStep.get("generate") ?? 0,
  };
}

function buildWorkflowStepsFromRun(run: Run): WorkflowStep[] {
  const latencies = (run.stage_latencies_ms ?? {}) as Record<string, number>;
  return STEP_ORDER.map((stepId) => {
    const duration =
      stepId === "init"
        ? latencies.init_ms ?? 0
        : stepId === "conversation_history"
          ? latencies.conversation_history_ms ?? 0
          : stepId === "check_retrieval"
            ? latencies.check_retrieval_ms ?? 0
            : stepId === "research"
              ? (latencies.retrieval_ms ?? 0) + (latencies.evidence_packaging_ms ?? 0)
              : latencies.answering_ms ?? 0;

    return {
      step: stepId,
      label: STEP_LABELS[stepId],
      status: duration > 0 ? "completed" : "idle",
      durationMs: duration || undefined,
    };
  });
}

function getWorkflowSummary(steps: WorkflowStep[], run?: Run | null) {
  const totalFromSteps = steps.reduce((sum, step) => sum + (step.durationMs ?? 0), 0);
  const total = run?.total_latency_ms && run.total_latency_ms > 0 ? run.total_latency_ms : totalFromSteps;
  const running = steps.find((step) => step.status === "running");
  return {
    total,
    running,
    evidenceCount: run
      ? Math.max(run.retrieved_chunk_ids.length, run.citations.length)
      : steps.find((step) => step.step === "research")?.metadata?.evidence_count,
  };
}

function getStepTags(stepId: WorkflowStepId, run?: Run | null) {
  if (!run) return [];

  const tags: string[] = [];
  if (stepId === "conversation_history") tags.push("context loaded");
  if (stepId === "check_retrieval") {
    tags.push("routing");
    if (run.routing_reason) tags.push(toLabel(run.routing_reason));
  }
  if (stepId === "research") {
    if (run.retrieved_chunk_ids.length > 0) tags.push(`${run.retrieved_chunk_ids.length} chunks`);
    tags.push("hybrid retrieval");
  }
  if (stepId === "generate") {
    tags.push(`${Math.round(run.confidence_score * 100)}% confidence`);
    if (run.support_summary) tags.push(toLabel(run.support_summary));
  }

  return tags.filter(Boolean).slice(0, 3);
}

function ModeSwitcher({
  mode,
  modes,
  onChange,
}: {
  mode: UserFacingMode;
  modes: UserFacingMode[];
  onChange: (value: UserFacingMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const config = MODE_CONFIGS[mode];
  const available = modes.length > 0 ? modes : (Object.keys(MODE_CONFIGS) as UserFacingMode[]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-[12px] font-semibold shadow-sm transition-all hover:bg-foreground/[0.04]"
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
          <div className="absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl shadow-black/10">
            <div className="border-b border-border/40 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
                Execution Mode
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground/80">
                Choose how deep the grounded pipeline should go for this turn.
              </p>
            </div>
            <div className="p-2">
              {available.map((candidate) => {
                const candidateConfig = MODE_CONFIGS[candidate];
                const active = candidate === mode;
                return (
                  <button
                    key={candidate}
                    type="button"
                    onClick={() => {
                      onChange(candidate);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-2xl p-3 text-left transition-all",
                      active ? "bg-foreground/[0.05]" : "hover:bg-foreground/[0.03]",
                    )}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", candidateConfig.dotColor)} />
                        <span
                          className={cn(
                            "text-[13px] font-semibold",
                            active ? candidateConfig.badgeColor : "text-foreground",
                          )}
                        >
                          {candidateConfig.label}
                        </span>
                      </div>
                      {active && (
                        <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-[12px] leading-relaxed text-muted-foreground">
                      {candidateConfig.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1">
                      {candidateConfig.steps.map((step, index) => (
                        <span key={step} className="flex items-center gap-1">
                          <span className="rounded-md bg-foreground/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-foreground/70">
                            {step}
                          </span>
                          {index < candidateConfig.steps.length - 1 && (
                            <span className="text-[10px] text-muted-foreground/40">-&gt;</span>
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

function renderMarkdown(
  text: string,
  citations?: Citation[],
  onCitationClick?: (citation: Citation, index: number) => void,
): ReactNode {
  const idToIndex = new Map<string, number>();
  if (citations) {
    citations.forEach((citation, index) => {
      idToIndex.set(citation.citation_id, index);
      idToIndex.set(citation.citation_id.toUpperCase(), index);
      idToIndex.set(citation.citation_id.toLowerCase(), index);
      idToIndex.set(citation.chunk_id, index);
    });
  }

  function inlineFormat(line: string): ReactNode {
    const regex =
      /(\*\*(.+?)\*\*)|(`(.+?)`)|\[([a-zA-Z]?\d+[a-zA-Z0-9]*(?:,\s*[a-zA-Z]?\d+[a-zA-Z0-9]*)*)\]/g;
    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
      if (match[1]) parts.push(<strong key={match.index}>{match[2]}</strong>);
      else if (match[3]) {
        parts.push(
          <code key={match.index} className="rounded bg-foreground/10 px-1 text-[12px] font-mono">
            {match[4]}
          </code>,
        );
      } else if (match[5] !== undefined) {
        const rawRefs = match[5].split(/,\s*/);
        for (const refKey of rawRefs) {
          let citationIndex = idToIndex.get(refKey);
          if (citationIndex === undefined) citationIndex = idToIndex.get(refKey.toUpperCase());
          if (citationIndex === undefined) citationIndex = idToIndex.get(refKey.toLowerCase());
          if (citationIndex === undefined && !Number.isNaN(Number(refKey))) {
            citationIndex = Number(refKey) - 1;
          }
          if (
            citationIndex !== undefined &&
            citations &&
            citationIndex >= 0 &&
            citationIndex < citations.length
          ) {
            const citation = citations[citationIndex];
            parts.push(
              <button
                key={`${match.index}-${refKey}`}
                type="button"
                onClick={() => onCitationClick?.(citation, citationIndex)}
                className="mx-0.5 inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-sky-500/15 px-1 text-[10px] font-bold text-sky-600 transition-all hover:bg-sky-500/25 dark:text-sky-300"
                style={{ verticalAlign: "super", lineHeight: 1 }}
                title={`Source ${citationIndex + 1}`}
              >
                {citationIndex + 1}
              </button>,
            );
          }
        }
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) parts.push(line.slice(lastIndex));
    return parts.length > 0 ? parts : line;
  }

  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let key = 0;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith("## ")) {
      elements.push(
        <p key={key++} className="mb-1 mt-3 text-[13px] font-bold text-foreground">
          {inlineFormat(trimmed.slice(3))}
        </p>,
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <p key={key++} className="mb-1 mt-3 text-[14px] font-bold text-foreground">
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
      const number = trimmed.match(/^(\d+)\./)?.[1];
      elements.push(
        <div key={key++} className="flex items-start gap-2 leading-relaxed">
          <span className="mt-0.5 shrink-0 text-[11px] font-bold text-muted-foreground">
            {number}.
          </span>
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

function WorkflowInspectorPanel({
  run,
  steps,
  isLive,
  onClose,
}: {
  run: Run | null;
  steps: WorkflowStep[];
  isLive: boolean;
  onClose: () => void;
}) {
  const summary = getWorkflowSummary(steps, run);
  const stepMap = new Map(steps.map((step) => [step.step, step]));

  const nodes: Array<{
    stepId: WorkflowStepId;
    title: string;
    subtitle: string;
    durationLabel?: string;
    badge?: string;
    position: string;
  }> = [
    {
      stepId: "init",
      title: "Workflow Steps",
      subtitle: isLive ? "Preparing the run" : "Workflow initialized",
      durationLabel: stepMap.get("init")?.durationMs !== undefined ? formatMs(stepMap.get("init")!.durationMs!) : undefined,
      position: "xl:col-start-1 xl:row-start-1",
    },
    {
      stepId: "conversation_history",
      title: "Load Context",
      subtitle: "Create message history",
      durationLabel:
        stepMap.get("conversation_history")?.durationMs !== undefined
          ? formatMs(stepMap.get("conversation_history")!.durationMs!)
          : undefined,
      badge:
        run && run.conversation_id
          ? "1 context source"
          : stepMap.get("conversation_history")?.status === "completed"
            ? "context ready"
            : undefined,
      position: "xl:col-start-2 xl:row-start-1",
    },
    {
      stepId: "research",
      title: "Research",
      subtitle: "Retrieve evidence",
      durationLabel:
        stepMap.get("research")?.durationMs !== undefined
          ? formatMs(stepMap.get("research")!.durationMs!)
          : undefined,
      badge:
        summary.evidenceCount
          ? `${summary.evidenceCount} evidence`
          : stepMap.get("research")?.status === "running"
            ? "searching"
            : undefined,
      position: "xl:col-start-3 xl:row-start-1",
    },
    {
      stepId: "generate",
      title: "Generate",
      subtitle: "Compose final answer",
      durationLabel:
        stepMap.get("generate")?.durationMs !== undefined
          ? formatMs(stepMap.get("generate")!.durationMs!)
          : undefined,
      position: "xl:col-start-4 xl:row-start-1",
    },
    {
      stepId: "check_retrieval",
      title: "Check Retrieval Need",
      subtitle: "Analyze query",
      durationLabel:
        stepMap.get("check_retrieval")?.durationMs !== undefined
          ? formatMs(stepMap.get("check_retrieval")!.durationMs!)
          : undefined,
      position: "xl:col-start-2 xl:row-start-2",
    },
  ];

  function renderStatusIcon(status: WorkflowStep["status"], index: number) {
    if (status === "running") {
      return <LoaderCircle className="h-5 w-5 animate-spin" />;
    }
    if (status === "completed") {
      return <CheckCircle2 className="h-5 w-5" />;
    }
    return <span className="text-[13px] font-semibold">{index + 1}</span>;
  }

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] dark:bg-[linear-gradient(180deg,rgba(9,9,11,0.98),rgba(24,24,27,0.96))]">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-sky-500" />
            <p className="text-[15px] font-semibold text-foreground">
              {isLive ? "Live workflow" : "Workflow details"}
            </p>
          </div>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {isLive
              ? "Track the grounded pipeline as each stage completes."
              : "Inspect how this answer was routed, retrieved, and generated."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
              Status
            </p>
            <p className="mt-2 text-[14px] font-semibold text-foreground">
              {isLive ? (summary.running ? `Running ${summary.running.label}` : "Starting") : "Completed"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
              Total Latency
            </p>
            <p className="mt-2 text-[14px] font-semibold text-foreground">
              {summary.total > 0 ? formatMs(summary.total) : "Streaming"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
              Evidence
            </p>
            <p className="mt-2 text-[14px] font-semibold text-foreground">
              {summary.evidenceCount ? `${summary.evidenceCount} retrieved` : "Pending"}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[2rem] border border-border/60 bg-white/75 p-4 shadow-sm dark:bg-zinc-950/60">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[16px] font-semibold text-foreground">Workflow Steps</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Box view of the pipeline, closer to the flow you showed.
              </p>
            </div>
            <div className="rounded-full border border-border/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
              {isLive ? "Live progress" : "Completed run"}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-4 xl:grid-rows-2">
            {nodes.map((node, index) => {
              const step = stepMap.get(node.stepId) ?? {
                step: node.stepId,
                label: STEP_LABELS[node.stepId],
                status: "idle" as const,
              };
              const tags = getStepTags(node.stepId, run);
              return (
                <div
                  key={node.stepId}
                  className={cn(
                    "relative min-h-[210px] rounded-[2rem] border bg-background p-5 shadow-sm transition-all",
                    node.position,
                    step.status === "running" &&
                      "border-sky-400 bg-sky-500/[0.06] shadow-xl shadow-sky-500/10",
                    step.status === "completed" &&
                      "border-emerald-200 bg-emerald-500/[0.05] dark:border-emerald-900/60",
                    step.status === "idle" && "border-border/60",
                  )}
                >
                  <div
                    className={cn(
                      "mb-5 flex h-12 w-12 items-center justify-center rounded-full border",
                      step.status === "running" && "border-sky-300 bg-sky-500/10 text-sky-600",
                      step.status === "completed" &&
                        "border-emerald-200 bg-background text-emerald-600 dark:border-emerald-900/60 dark:text-emerald-400",
                      step.status === "idle" && "border-border/60 bg-foreground/[0.03] text-muted-foreground",
                    )}
                  >
                    {renderStatusIcon(step.status, index)}
                  </div>

                  <p className="text-[14px] font-semibold text-foreground">{node.title}</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    {node.subtitle}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] font-medium text-foreground/80">
                      {node.durationLabel ?? "--"}
                    </span>
                    {node.badge && (
                      <span className="rounded-full border border-border/60 bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground">
                        {node.badge}
                      </span>
                    )}
                  </div>

                  {tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border/60 bg-foreground/[0.03] px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {node.stepId === "init" && (
                    <div className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 text-muted-foreground/35 xl:block">
                      <span className="text-2xl">→</span>
                    </div>
                  )}
                  {node.stepId === "conversation_history" && (
                    <>
                      <div className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 text-muted-foreground/35 xl:block">
                        <span className="text-2xl">→</span>
                      </div>
                      <div className="pointer-events-none absolute bottom-[-22px] left-1/2 hidden -translate-x-1/2 text-muted-foreground/35 xl:block">
                        <span className="text-2xl">↓</span>
                      </div>
                    </>
                  )}
                  {node.stepId === "research" && (
                    <div className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 text-muted-foreground/35 xl:block">
                      <span className="text-2xl">→</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowStepsOverlayModal({
  run,
  steps,
  isLive,
  onClose,
}: {
  run: Run | null;
  steps: WorkflowStep[];
  isLive: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/35 px-4 py-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass h-[min(88vh,860px)] w-full max-w-[1240px] overflow-hidden rounded-[2rem] border border-border/40 bg-background/95 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <WorkflowInspectorPanel run={run} steps={steps} isLive={isLive} onClose={onClose} />
      </div>
    </div>
  );
}

function WorkflowOverlayModal({
  run,
  steps,
  isLive,
  onClose,
}: {
  run: Run | null;
  steps: WorkflowStep[];
  isLive: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const [zoom, setZoom] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [panEnabled, setPanEnabled] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/35 px-4 py-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "glass w-full overflow-hidden rounded-[2rem] border border-border/40 bg-background/95 shadow-2xl transition-all",
          isExpanded ? "h-[96vh] max-w-[96vw]" : "h-[min(88vh,860px)] max-w-[1240px]",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <QueryJourneyPanel
          run={run}
          steps={steps}
          isLive={isLive}
          onClose={onClose}
          zoom={zoom}
          onZoomIn={() => setZoom((current) => Math.min(1.6, Number((current + 0.1).toFixed(2))))}
          onZoomOut={() => setZoom((current) => Math.max(0.8, Number((current - 0.1).toFixed(2))))}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded((current) => !current)}
          showInfo={showInfo}
          onToggleInfo={() => setShowInfo((current) => !current)}
          panEnabled={panEnabled}
          onTogglePan={() => setPanEnabled((current) => !current)}
          offset={offset}
          onOffsetChange={setOffset}
        />
      </div>
    </div>
  );
}

function QueryJourneyPanel({
  run,
  steps,
  isLive,
  onClose,
  zoom,
  onZoomIn,
  onZoomOut,
  isExpanded,
  onToggleExpanded,
  showInfo,
  onToggleInfo,
  panEnabled,
  onTogglePan,
  offset,
  onOffsetChange,
}: {
  run: Run | null;
  steps: WorkflowStep[];
  isLive: boolean;
  onClose: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  showInfo: boolean;
  onToggleInfo: () => void;
  panEnabled: boolean;
  onTogglePan: () => void;
  offset: { x: number; y: number };
  onOffsetChange: (next: { x: number; y: number }) => void;
}) {
  const summary = getWorkflowSummary(steps, run);
  const stepMap = new Map(steps.map((step) => [step.step, step]));
  const journeySteps: Array<{
    stepId: WorkflowStepId;
    title: string;
    subtitle: string;
  }> = [
    { stepId: "conversation_history", title: "CreateMessageHistory", subtitle: "Load prior chat context" },
    { stepId: "check_retrieval", title: "IsRetrievalNeeded", subtitle: "Route the query" },
    { stepId: "research", title: "SearchIndex", subtitle: "Retrieve evidence" },
    { stepId: "generate", title: "RenderPrompt", subtitle: "Compose the final answer" },
    { stepId: "init", title: "WorkflowSetup", subtitle: "Initialize the grounded pipeline" },
  ];
  const defaultStepId =
    steps.find((step) => step.status === "running")?.step ??
    steps.find((step) => step.status === "completed")?.step ??
    "conversation_history";
  const [selectedStepId, setSelectedStepId] = useState<WorkflowStepId>(defaultStepId);

  useEffect(() => {
    if (steps.some((step) => step.step === selectedStepId)) return;
    setSelectedStepId(defaultStepId);
  }, [defaultStepId, selectedStepId, steps]);

  useEffect(() => {
    const runningStep = steps.find((step) => step.status === "running")?.step;
    if (isLive && runningStep) setSelectedStepId(runningStep);
  }, [isLive, steps]);

  const items = journeySteps.map((entry, index) => {
    const step = stepMap.get(entry.stepId) ?? {
      step: entry.stepId,
      label: STEP_LABELS[entry.stepId],
      status: "idle" as const,
    };
    const durationMs = step.durationMs ?? 0;
    const share = summary.total > 0 ? Math.round((durationMs / summary.total) * 100) : 0;
    return {
      ...entry,
      index,
      step,
      durationMs,
      share,
      tags: getStepTags(entry.stepId, run),
    };
  });

  const activeItem = items.find((item) => item.stepId === selectedStepId) ?? items[0];
  const metadataEntries = Object.entries(activeItem.step.metadata ?? {}).filter(
    ([, value]) => value !== undefined && value !== null,
  );
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);

  function renderStatusIcon(status: WorkflowStep["status"], index: number) {
    if (status === "running") return <LoaderCircle className="h-4 w-4 animate-spin" />;
    if (status === "completed") return <CheckCircle2 className="h-4 w-4" />;
    return <span className="text-[12px] font-semibold">{index + 1}</span>;
  }

  function handleCanvasMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (!panEnabled) return;
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setIsDragging(true);
  }

  function handleCanvasMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!panEnabled || !dragState.current) return;
    onOffsetChange({
      x: dragState.current.originX + (event.clientX - dragState.current.startX),
      y: dragState.current.originY + (event.clientY - dragState.current.startY),
    });
  }

  function stopDragging() {
    dragState.current = null;
    setIsDragging(false);
  }

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] dark:bg-[linear-gradient(180deg,rgba(9,9,11,0.99),rgba(24,24,27,0.96))]">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-500/10 text-emerald-600 dark:border-emerald-900/60 dark:text-emerald-300">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[20px] font-semibold text-foreground">Query Journey</p>
            <p className="text-[12px] text-muted-foreground">
              {isLive ? "Watching the pipeline update in real time." : "Inspect latency, routing, and generation details."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onZoomOut}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onTogglePan}
            className={cn(
              "hidden h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground sm:flex",
              panEnabled && "border-sky-300 bg-sky-500/10 text-sky-600",
            )}
            aria-label="Move canvas"
          >
            <Move className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleExpanded}
            className={cn(
              "hidden h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground sm:flex",
              isExpanded && "border-sky-300 bg-sky-500/10 text-sky-600",
            )}
            aria-label="Expand"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleInfo}
            className={cn(
              "hidden h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground sm:flex",
              showInfo && "border-sky-300 bg-sky-500/10 text-sky-600",
            )}
            aria-label="Info"
          >
            <Info className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="border-b border-border/60 bg-sky-500/[0.06] px-6 py-3 text-[12px] text-muted-foreground">
          Query Journey shows live step timing, routing context, evidence progress, and generation details based on the data currently returned by the API.
        </div>
      )}

      <div
        className={cn(
          "flex min-h-0 flex-1 overflow-auto",
          panEnabled && "cursor-grab",
          isDragging && "cursor-grabbing",
        )}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
      >
        <div
          className="flex min-h-full min-w-[1120px] flex-1"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
        <div className="w-[330px] shrink-0 border-r border-border/60 bg-background/55 p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-border/60 bg-white/85 px-3 py-1.5 text-[11px] font-medium text-muted-foreground dark:bg-zinc-950/75">
              {summary.total > 0 ? formatMs(summary.total) : "Streaming"}
            </span>
            <span className="rounded-full border border-border/60 bg-white/85 px-3 py-1.5 text-[11px] font-medium text-muted-foreground dark:bg-zinc-950/75">
              {typeof summary.evidenceCount === "number" ? `${summary.evidenceCount} evidence` : "Evidence pending"}
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const active = item.stepId === activeItem.stepId;
              const progressWidth =
                item.share > 0
                  ? `${Math.max(item.share, item.step.status === "running" ? 12 : 4)}%`
                  : item.step.status === "running"
                    ? "12%"
                    : "0%";

              return (
                <button
                  key={item.stepId}
                  type="button"
                  onClick={() => setSelectedStepId(item.stepId)}
                  className={cn(
                    "group relative w-full rounded-[1.6rem] border px-4 py-4 text-left transition-all",
                    active
                      ? "border-sky-300 bg-sky-500/[0.08] shadow-lg shadow-sky-500/10 ring-1 ring-sky-300/50"
                      : "border-border/60 bg-white/86 hover:bg-foreground/[0.03] hover:shadow-sm dark:bg-zinc-950/70",
                  )}
                >
                  {item.index > 0 && (
                    <div className="pointer-events-none absolute -top-3 left-[31px] h-3 w-px bg-border/60" />
                  )}
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white dark:bg-zinc-950",
                        item.step.status === "running" && "border-sky-300 bg-sky-500/10 text-sky-600",
                        item.step.status === "completed" &&
                          "border-emerald-200 bg-emerald-500/10 text-emerald-600 dark:border-emerald-900/60 dark:text-emerald-300",
                        item.step.status === "idle" && "border-border/60 bg-background text-muted-foreground",
                      )}
                    >
                      {renderStatusIcon(item.step.status, item.index)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{item.subtitle}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {item.share}%
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            item.step.status === "completed" && "bg-sky-500",
                            item.step.status === "running" && "bg-sky-400",
                            item.step.status === "idle" && "bg-foreground/[0.12]",
                          )}
                          style={{ width: progressWidth }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 flex-1 bg-white/30 p-7 dark:bg-black/10">
          <div className="max-w-3xl space-y-5">
            <div>
              <p className="text-[30px] font-semibold tracking-tight text-foreground">
                {activeItem.title}
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {activeItem.subtitle}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.4rem] border border-border/60 bg-white/90 px-4 py-3 shadow-sm dark:bg-zinc-950/75">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">Latency</p>
                <p className="mt-2 text-[16px] font-semibold text-foreground">
                  {activeItem.durationMs > 0 ? formatMs(activeItem.durationMs) : "Streaming"}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-border/60 bg-white/90 px-4 py-3 shadow-sm dark:bg-zinc-950/75">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">Status</p>
                <p className="mt-2 text-[16px] font-semibold text-foreground">
                  {activeItem.step.status === "completed"
                    ? "success"
                    : activeItem.step.status === "running"
                      ? "running"
                      : "pending"}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-border/60 bg-white/90 px-4 py-3 shadow-sm dark:bg-zinc-950/75">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">Time Share</p>
                <p className="mt-2 text-[16px] font-semibold text-foreground">{activeItem.share}%</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-white/85 shadow-sm dark:bg-zinc-950/75">
              <div className="grid gap-0 divide-y divide-border/60">
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[13px] text-muted-foreground">Latency</span>
                  <span className="text-[15px] font-semibold text-foreground">
                    {activeItem.durationMs > 0 ? formatMs(activeItem.durationMs) : "Streaming"}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-[13px] text-muted-foreground">Status</span>
                  <span
                    className={cn(
                      "text-[15px] font-semibold",
                      activeItem.step.status === "completed" && "text-emerald-600 dark:text-emerald-300",
                      activeItem.step.status === "running" && "text-sky-600 dark:text-sky-300",
                      activeItem.step.status === "idle" && "text-muted-foreground",
                    )}
                  >
                    {activeItem.step.status === "completed"
                      ? "success"
                      : activeItem.step.status === "running"
                        ? "running"
                        : "pending"}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[13px] text-muted-foreground">Time Share</span>
                    <span className="text-[15px] font-semibold text-foreground">{activeItem.share}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all"
                      style={{ width: `${Math.max(activeItem.share, activeItem.step.status === "idle" ? 0 : 4)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/60 bg-white/88 p-5 shadow-sm dark:bg-zinc-950/75">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
                Run Context
              </p>
              <div className="mt-4 grid gap-3 text-[14px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Tier</span>
                  <span className="font-semibold text-foreground">{toLabel(run?.effective_tier ?? "standard")}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-semibold text-foreground">{run?.selected_mode ?? "live"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Total latency</span>
                  <span className="font-semibold text-foreground">
                    {summary.total > 0 ? formatMs(summary.total) : "Streaming"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Verification</span>
                  <span className="font-semibold text-foreground">
                    {run ? toLabel(run.verification_status) : "pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Backend</span>
                  <span className="font-semibold text-foreground">{run?.provider_backend ?? "streaming"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-border/60 bg-white/88 p-5 shadow-sm dark:bg-zinc-950/75">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
                Step Details
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {activeItem.tags.length > 0 ? (
                  activeItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/60 bg-foreground/[0.03] px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-[13px] text-muted-foreground">
                    Detailed annotations will appear here as the step reports metadata.
                  </span>
                )}
              </div>

              {metadataEntries.length > 0 && (
                <div className="mt-4 grid gap-3 border-t border-border/60 pt-4 text-[13px]">
                  {metadataEntries.map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">{toLabel(key)}</span>
                      <span className="font-semibold text-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {!metadataEntries.length && activeItem.stepId === "research" && (
                <div className="mt-4 grid gap-3 border-t border-border/60 pt-4 text-[13px]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Evidence found</span>
                    <span className="font-semibold text-foreground">
                      {typeof summary.evidenceCount === "number" ? summary.evidenceCount : 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function SourceInspectorPanel({
  run,
  citationIndex,
  documentTitles,
  onSelectCitation,
  onClose,
}: {
  run: Run;
  citationIndex: number;
  documentTitles: Record<string, DatasetDocument>;
  onSelectCitation: (index: number) => void;
  onClose: () => void;
}) {
  const citation = run.citations[citationIndex];
  const documentTitle = documentTitles[citation.document_id]?.title ?? citation.document_id;
  const sameDocumentCitations = run.citations.filter(
    (candidate) => candidate.document_id === citation.document_id,
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-foreground">Source inspector</p>
          <p className="mt-1 truncate text-[12px] text-muted-foreground">
            {getDocumentLabel(citation.document_id, documentTitle)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-foreground/[0.025] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
              Citation
            </p>
            <p className="mt-2 text-[14px] font-semibold text-foreground">#{citationIndex + 1}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-foreground/[0.025] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
              Chunk
            </p>
            <p className="mt-2 text-[14px] font-semibold text-foreground">
              {citation.chunk_index + 1}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-foreground/[0.025] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
              Supporting snippets
            </p>
            <p className="mt-2 text-[14px] font-semibold text-foreground">
              {sameDocumentCitations.length}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[2rem] border border-border/60 bg-white p-5 shadow-sm dark:bg-zinc-950">
          <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-foreground">
                {getDocumentLabel(citation.document_id, documentTitle)}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">Grounded source preview</p>
            </div>
            <div className="rounded-full border border-border/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
              Chunk {citation.chunk_index + 1}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-3xl border border-amber-300/70 bg-amber-100/70 p-4 text-[14px] leading-relaxed text-foreground shadow-[inset_0_0_0_1px_rgba(251,191,36,0.25)] dark:border-amber-700/60 dark:bg-amber-500/10">
              {citation.quote}
            </div>

            <div className="grid gap-2 rounded-3xl border border-border/60 bg-foreground/[0.02] p-4 text-[12px] text-muted-foreground">
              <div className="flex items-center justify-between gap-3">
                <span>Document ID</span>
                <span className="truncate text-right font-medium text-foreground/80">
                  {citation.document_id}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Chunk ID</span>
                <span className="truncate text-right font-medium text-foreground/80">
                  {citation.chunk_id}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Evidence in run</span>
                <span className="font-medium text-foreground/80">
                  {Math.max(run.retrieved_chunk_ids.length, run.citations.length)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground/60">
              All supporting citations
            </p>
            <span className="text-[11px] text-muted-foreground">
              Click to switch the highlighted excerpt
            </span>
          </div>

          <div className="space-y-2">
            {run.citations.map((candidate, index) => {
              const active = index === citationIndex;
              const candidateTitle =
                documentTitles[candidate.document_id]?.title ?? candidate.document_id;
              return (
                <button
                  key={candidate.citation_id}
                  type="button"
                  onClick={() => onSelectCitation(index)}
                  className={cn(
                    "w-full rounded-2xl border p-3 text-left transition-all",
                    active
                      ? "border-sky-300 bg-sky-500/[0.08] shadow-lg shadow-sky-500/10"
                      : "border-border/60 bg-background hover:bg-foreground/[0.03]",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                        active
                          ? "bg-sky-500 text-white"
                          : "bg-foreground/[0.06] text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[12px] font-semibold text-foreground">
                          {getDocumentLabel(candidate.document_id, candidateTitle)}
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          p. {candidate.chunk_index + 1}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                        {candidate.quote}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border/60 bg-foreground/[0.025] p-4">
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            <span>
              This source inspector highlights grounded excerpts with the current API data.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageMetaBar({
  run,
  feedback,
  onOpenWorkflow,
  onOpenJourney,
  onOpenSource,
  onFeedback,
  documentTitles,
}: {
  run: Run;
  feedback?: "positive" | "negative";
  onOpenWorkflow: () => void;
  onOpenJourney: () => void;
  onOpenSource: (index: number) => void;
  onFeedback: (rating: "positive" | "negative") => void;
  documentTitles: Record<string, DatasetDocument>;
}) {
  const [expanded, setExpanded] = useState(false);
  const rating = feedback ?? run.feedback_rating ?? null;
  const confidence = Math.round(run.confidence_score * 100);
  const evidenceCount = Math.max(run.retrieved_chunk_ids.length, run.citations.length);

  const confidenceTone =
    confidence >= 70
      ? "border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-300"
      : confidence >= 40
        ? "border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/60 dark:text-amber-300"
        : "border-red-200 bg-red-500/10 text-red-600 dark:border-red-900/60 dark:text-red-300";

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenWorkflow}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-foreground/[0.04] hover:text-foreground"
        >
          <GitBranch className="h-3.5 w-3.5" />
          View workflow
        </button>

        {evidenceCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-foreground/[0.04] hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            Retrieved {evidenceCount} {evidenceCount === 1 ? "piece" : "pieces"} of evidence
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold", confidenceTone)}>
          {confidence}% confidence
        </span>

        <button
          type="button"
          onClick={onOpenJourney}
          className="rounded-full border border-border/60 p-2 text-muted-foreground transition-all hover:bg-foreground/[0.04] hover:text-foreground"
          title="Open query journey"
        >
          <GitBranch className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onFeedback("positive")}
          className={cn(
            "rounded-full border border-border/60 p-2 text-muted-foreground transition-all hover:bg-foreground/[0.04] hover:text-foreground",
            rating === "positive" &&
              "border-emerald-300 bg-emerald-500/10 text-emerald-600 dark:border-emerald-900/60 dark:text-emerald-300",
          )}
          title="Helpful"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onFeedback("negative")}
          className={cn(
            "rounded-full border border-border/60 p-2 text-muted-foreground transition-all hover:bg-foreground/[0.04] hover:text-foreground",
            rating === "negative" &&
              "border-red-300 bg-red-500/10 text-red-600 dark:border-red-900/60 dark:text-red-300",
          )}
          title="Needs work"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {rating === "positive" && (
        <p className="text-[13px] font-medium text-emerald-600 dark:text-emerald-300">
          Thank you for your feedback!
        </p>
      )}

      {expanded && run.citations.length > 0 && (
        <div className="space-y-2 rounded-[1.75rem] border border-border/60 bg-foreground/[0.02] p-3">
          {run.citations.map((citation, index) => {
            const title = documentTitles[citation.document_id]?.title ?? citation.document_id;
            return (
              <button
                key={citation.citation_id}
                type="button"
                onClick={() => onOpenSource(index)}
                className="flex w-full items-start gap-3 rounded-2xl border border-border/60 bg-background/85 p-3 text-left transition-all hover:bg-background"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-[11px] font-bold text-sky-600 dark:text-sky-300">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[12px] font-semibold text-foreground">
                      {getDocumentLabel(citation.document_id, title)}
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      p. {citation.chunk_index + 1}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                    {citation.quote}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SelectPill({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative min-w-0">
      <select
        className="max-w-44 appearance-none truncate rounded-full border border-border/60 bg-background py-1.5 pl-3 pr-7 text-[10px] font-medium text-foreground outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export function AgentChatScreen({ id, workspaceSlug }: { id: string; workspaceSlug?: string }) {
  const { apiKey, workspaceId } = useAuth();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const agentQuery = useApiQuery(() => getAgent(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const conversationsQuery = useApiQuery(
    () => listAgentConversations(apiKey!, id),
    [apiKey, id],
    Boolean(apiKey),
  );
  const capabilitiesQuery = useApiQuery(() => getCapabilities(apiKey!), [apiKey], Boolean(apiKey));
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
  const [documentTitles, setDocumentTitles] = useState<Record<string, DatasetDocument>>({});
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<UserFacingMode>("auto");
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [localExchange, setLocalExchange] = useState<LocalExchange | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackRunId, setFeedbackRunId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<"positive" | "negative">("negative");
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "positive" | "negative">>(
    {},
  );
  const [inspector, setInspector] = useState<InspectorState | null>(null);

  const agent = agentQuery.data;
  const conversations = conversationsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const modes = capabilitiesQuery.data?.modes.filter((entry) => entry.enabled) ?? [];
  const datasets = datasetsQuery.data ?? [];

  const attachedDatasets = useMemo(() => {
    const ids = new Set(agent?.dataset_ids ?? []);
    return datasets.filter((dataset) => ids.has(dataset.dataset_id));
  }, [agent?.dataset_ids, datasets]);

  const attachedDatasetSignature = useMemo(
    () => attachedDatasets.map((dataset) => dataset.dataset_id).sort().join("|"),
    [attachedDatasets],
  );

  const conversationGroups = useMemo(
    () => groupConversationsByDate(conversations),
    [conversations],
  );

  useEffect(() => {
    if (!conversationId && conversations[0]) setConversationId(conversations[0].conversation_id);
  }, [conversationId, conversations]);

  useEffect(() => {
    if (agent?.default_mode) setMode(agent.default_mode);
  }, [agent?.default_mode]);

  useEffect(() => {
    if (attachedDatasets.length === 0) {
      setSelectedDatasetId("");
      return;
    }
    if (!attachedDatasets.some((dataset) => dataset.dataset_id === selectedDatasetId)) {
      setSelectedDatasetId(attachedDatasets[0].dataset_id);
    }
  }, [attachedDatasets, selectedDatasetId]);

  useEffect(() => {
    if (!apiKey || !attachedDatasetSignature) {
      setDocumentTitles({});
      return;
    }
    const currentApiKey = apiKey!;

    let cancelled = false;
    async function hydrateDocuments() {
      const rows = await Promise.all(
        attachedDatasets.map(async (dataset) => {
          try {
            return await listDatasetDocuments(currentApiKey, dataset.dataset_id);
          } catch {
            return [];
          }
        }),
      );

      if (cancelled) return;
      const next: Record<string, DatasetDocument> = {};
      rows.flat().forEach((document) => {
        next[document.document_id] = document;
      });
      setDocumentTitles(next);
    }

    void hydrateDocuments();
    return () => {
      cancelled = true;
    };
  }, [apiKey, attachedDatasetSignature, attachedDatasets]);

  useEffect(() => {
    if (!apiKey) return;
    const currentApiKey = apiKey!;
    const missing = messages
      .map((entry) => entry.run_id)
      .filter((runId): runId is string => Boolean(runId && !runById[runId]));
    if (missing.length === 0) return;

    let cancelled = false;
    async function hydrateRuns() {
      const rows = await Promise.all(
        Array.from(new Set(missing)).map(async (runId) => {
          try {
            return await getRun(currentApiKey, runId);
          } catch {
            return null;
          }
        }),
      );
      if (cancelled) return;

      setRunById((current) => {
        const next = { ...current };
        for (const run of rows) {
          if (run) next[run.run_id] = run;
        }
        return next;
      });
    }

    void hydrateRuns();
    return () => {
      cancelled = true;
    };
  }, [apiKey, messages, runById]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, localExchange?.status, conversationId, workflowSteps.length]);

  async function newConversation() {
    if (!apiKey) return;
    const created = await createAgentConversation(apiKey, id, { title: "New chat", mode });
    setConversationId(created.conversation_id);
    setLocalExchange(null);
    setInspector(null);
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
        setLocalExchange((current) =>
          current ? { ...current, conversationId: activeConversationId } : current,
        );
      }

      let streamedSteps: WorkflowStep[] = [];
      for await (const event of streamAgentChat(apiKey, id, {
        conversation_id: activeConversationId,
        message: trimmed,
        mode,
        dataset_id: datasetId,
      })) {
        if (event.type === "step_started") {
          streamedSteps = streamedSteps.some((step) => step.step === event.step)
            ? streamedSteps.map((step) =>
                step.step === event.step ? { ...step, status: "running" as const } : step,
              )
            : [
                ...streamedSteps,
                { step: event.step, label: event.label, status: "running" as const },
              ];
          setWorkflowSteps(streamedSteps);
        }

        if (event.type === "step_completed") {
          const completed: WorkflowStep = {
            step: event.step,
            label: event.label,
            status: "completed" as const,
            durationMs: event.duration_ms,
            metadata: {
              ...(event.evidence_count !== undefined ? { evidence_count: event.evidence_count } : {}),
              ...(event.message_count !== undefined ? { message_count: event.message_count } : {}),
            },
          };
          streamedSteps = streamedSteps.some((step) => step.step === event.step)
            ? streamedSteps.map((step) => (step.step === event.step ? completed : step))
            : [...streamedSteps, completed];
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
            run = {
              ...fallback,
              total_latency_ms:
                Object.values(fallback.stage_latencies_ms ?? {}).reduce((sum, value) => sum + value, 0),
            };
          }

          setRunById((current) => ({ ...current, [run.run_id]: run }));
          setInspector((current) =>
            current && current.type === "workflow" && current.live
              ? { type: "workflow", runId: run.run_id, live: false }
              : current,
          );
          const resolvedConversationId = event.data.conversation_id || activeConversationId;
          setConversationId(resolvedConversationId);
          try {
            const refreshedMessages = await getConversationMessages(apiKey, resolvedConversationId);
            messagesQuery.setData(refreshedMessages);
          } catch {
            await messagesQuery.reload();
          }
          setLocalExchange(null);
          setWorkflowSteps([]);
          await conversationsQuery.reload();
        }

        if (event.type === "error") throw new Error(event.detail);
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unable to send the message.";
      setErrorMessage(detail);
      setLocalExchange({ ...local, status: "error", error: detail });
      setWorkflowSteps([]);
    } finally {
      setIsSending(false);
    }
  }

  async function handleFeedback(runId: string, feedback: FeedbackSubmission) {
    if (!apiKey) return;
    setMessageFeedback((current) => ({ ...current, [runId]: feedback.rating }));
    try {
      const updated = await submitFeedback(apiKey, runId, feedback);
      setRunById((current) => ({ ...current, [runId]: updated }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save feedback.");
    }
  }

  const visibleMessages = useMemo<VisibleMessage[]>(() => {
    const rows: VisibleMessage[] = messages.map((entry) => ({ ...entry, local: false }));
    if (!localExchange) return rows;

    const matchesConversation =
      !localExchange.conversationId ||
      !conversationId ||
      localExchange.conversationId === conversationId ||
      messages.length === 0;
    if (!matchesConversation) return rows;

    const alreadyHasUser = rows.some(
      (entry) =>
        entry.role === "user" &&
        entry.content.trim() === localExchange.message.trim() &&
        new Date(entry.created_at).getTime() >=
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

  const liveWorkflowLabel =
    workflowSteps.find((step) => step.status === "running")?.label ??
    workflowSteps[workflowSteps.length - 1]?.label ??
    "Preparing workflow";

  const workflowModal = (() => {
    if (!inspector || inspector.type !== "workflow") return null;
    const run = inspector.runId ? runById[inspector.runId] ?? null : null;
    const steps =
      inspector.live && workflowSteps.length > 0
        ? workflowSteps
        : run
          ? buildWorkflowStepsFromRun(run)
          : workflowSteps;
    return (
      <WorkflowStepsOverlayModal
        run={run}
        steps={steps}
        isLive={inspector.live}
        onClose={() => setInspector(null)}
      />
    );
  })();

  const journeyModal = (() => {
    if (!inspector || inspector.type !== "journey") return null;
    const run = inspector.runId ? runById[inspector.runId] ?? null : null;
    const steps =
      inspector.live && workflowSteps.length > 0
        ? workflowSteps
        : run
          ? buildWorkflowStepsFromRun(run)
          : workflowSteps;
    return (
      <WorkflowOverlayModal
        run={run}
        steps={steps}
        isLive={inspector.live}
        onClose={() => setInspector(null)}
      />
    );
  })();

  const sourceInspectorPanel = (() => {
    if (!inspector || inspector.type !== "source") return null;
    const run = runById[inspector.runId];
    if (!run) return null;
    return (
      <SourceInspectorPanel
        run={run}
        citationIndex={inspector.citationIndex}
        documentTitles={documentTitles}
        onSelectCitation={(citationIndex) =>
          setInspector({ type: "source", runId: inspector.runId, citationIndex })
        }
        onClose={() => setInspector(null)}
      />
    );
  })();

  return (
    <div className="glass relative flex h-full w-full overflow-hidden rounded-[2.5rem] border border-border/40 shadow-2xl shadow-black/5 dark:shadow-black/20">
      <div className="hidden w-72 shrink-0 flex-col border-r border-border/40 bg-background/65 xl:flex">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-4">
          <div>
            <h2 className="text-[13px] font-semibold text-foreground">Conversations</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">Recent grounded chats</p>
          </div>
          <button
            type="button"
            onClick={newConversation}
            title="New chat"
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-none flex-1 overflow-y-auto py-3">
          {conversationGroups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <MessageSquare className="h-6 w-6 text-muted-foreground/25" />
              <p className="text-[12px] text-muted-foreground/60">No conversations yet</p>
            </div>
          ) : (
            conversationGroups.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="mb-1 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/45">
                  {group.label}
                </p>
                <div className="grid gap-1 px-2">
                  {group.items.map((conversation) => (
                    <button
                      key={conversation.conversation_id}
                      type="button"
                      onClick={() => {
                        setConversationId(conversation.conversation_id);
                        setLocalExchange(null);
                      }}
                      className={cn(
                        "group flex w-full min-w-0 items-center gap-2 rounded-2xl px-3 py-3 text-left transition-all",
                        conversation.conversation_id === conversationId
                          ? "bg-foreground/[0.07] text-foreground"
                          : "text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground",
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{conversation.title}</p>
                        <p className="text-[10px] text-muted-foreground/50">
                          {formatDate(conversation.updated_at)}
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

      <div className="flex min-w-0 flex-1 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_20%)]">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-background/75 px-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background/80">
                <Bot className="h-4 w-4 text-foreground/80" />
              </div>
              <div>
                <h1 className="text-[15px] font-semibold leading-tight text-foreground">
                  {agent?.name ?? "Agent"}
                </h1>
                <p className="text-[11px] leading-tight text-muted-foreground/70">
                  {agent?.dataset_ids.length ?? 0}{" "}
                  {(agent?.dataset_ids.length ?? 0) === 1 ? "dataset" : "datasets"} connected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ModeSwitcher mode={mode} modes={modes.map((entry) => entry.mode)} onChange={setMode} />
              <Link href={workspaceHref(workspaceSlug, `/agents/${id}/edit`)}>
                <button
                  type="button"
                  className="flex h-9 items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-3 text-[12px] text-muted-foreground transition-all hover:bg-foreground/[0.04] hover:text-foreground"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </button>
              </Link>
            </div>
          </div>

          {errorMessage && (
            <div className="mx-4 mt-3 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-500">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="scrollbar-none flex-1 overflow-y-auto px-4">
                <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-end gap-6 pb-8 pt-8">
                  {visibleMessages.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/40 bg-background/80">
                        <Bot className="h-6 w-6 text-muted-foreground/35" />
                      </div>
                      <p className="text-sm font-medium text-foreground/70">
                        Start a grounded conversation
                      </p>
                      <p className="text-xs text-muted-foreground/55">
                        Ask a question and inspect workflow, evidence, and citations as you go.
                      </p>
                    </div>
                  ) : (
                    visibleMessages.map((item) => {
                      const run = item.run_id ? runById[item.run_id] : null;
                      return (
                        <div
                          key={item.message_id}
                          className={cn(
                            "flex w-full",
                            item.role === "user" ? "justify-end" : "justify-start",
                          )}
                        >
                          {item.role === "user" ? (
                            <div className="max-w-[82%] md:max-w-[72%]">
                              <div className="rounded-[1.75rem] rounded-br-sm border border-sky-200/70 bg-sky-50 px-5 py-3.5 text-slate-800 shadow-sm shadow-sky-100/60 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-50 dark:shadow-black/10">
                                <p className="whitespace-pre-wrap text-[14px] leading-relaxed">
                                  {item.content}
                                </p>
                              </div>
                              <p className="mt-1.5 px-2 text-right text-[10px] text-muted-foreground/45">
                                {formatDate(item.created_at)}
                              </p>
                            </div>
                          ) : (
                            <div className="flex max-w-[92%] gap-3 md:max-w-[82%]">
                              <div className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-background/80 sm:flex">
                                <Bot className="h-4 w-4 text-foreground/70" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div
                                  className={cn(
                                    "rounded-[1.85rem] rounded-tl-sm border border-border/60 bg-white/88 px-5 py-4 shadow-sm shadow-black/5 backdrop-blur-sm dark:bg-background/82 dark:shadow-black/10",
                                    item.error && "border-red-500/25 bg-red-500/5",
                                  )}
                                >
                                  {item.pending ? (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                                        <LoaderCircle className="h-4 w-4 animate-spin text-sky-500" />
                                        <span>Working through the grounded pipeline...</span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setInspector({ type: "workflow", runId: null, live: true })}
                                          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-foreground/[0.04] hover:text-foreground"
                                        >
                                          <GitBranch className="h-3.5 w-3.5" />
                                          View workflow
                                        </button>
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-700 dark:border-sky-900/60 dark:text-sky-300">
                                          <Clock3 className="h-3 w-3" />
                                          {liveWorkflowLabel}
                                        </span>
                                      </div>
                                    </div>
                                  ) : item.error ? (
                                    <p className="text-[14px] text-red-500">{item.content}</p>
                                  ) : (
                                    renderMarkdown(item.content, run?.citations ?? [], (_, index) => {
                                      if (!run) return;
                                      setInspector({ type: "source", runId: run.run_id, citationIndex: index });
                                    })
                                  )}
                                </div>

                                {run && (
                                  <MessageMetaBar
                                    run={run}
                                    feedback={messageFeedback[run.run_id]}
                                    documentTitles={documentTitles}
                                    onOpenWorkflow={() => setInspector({ type: "workflow", runId: run.run_id, live: false })}
                                    onOpenJourney={() => setInspector({ type: "journey", runId: run.run_id, live: false })}
                                    onOpenSource={(citationIndex) =>
                                      setInspector({ type: "source", runId: run.run_id, citationIndex })
                                    }
                                    onFeedback={(rating) => {
                                      if (rating === "positive") {
                                        setMessageFeedback((current) => ({ ...current, [run.run_id]: "positive" }));
                                        void handleFeedback(run.run_id, {
                                          rating: "positive",
                                          reasons: [],
                                          freeform_text: null,
                                        });
                                        return;
                                      }
                                      setFeedbackRunId(run.run_id);
                                      setFeedbackRating("negative");
                                    }}
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

              <div className="border-t border-border/50 bg-background/85 px-4 pb-4 pt-4 backdrop-blur-xl">
                <div className="mx-auto max-w-4xl">
                  <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-white/92 shadow-xl shadow-black/5 dark:bg-background">
                    <div className="flex items-end gap-2 px-4 pt-3">
                      <textarea
                        className="max-h-[200px] min-h-[52px] w-full resize-none bg-transparent py-2 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/45"
                        placeholder="Ask a grounded question..."
                        rows={1}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            void handleSend();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={isSending || !message.trim()}
                        className="mb-1 h-10 w-10 shrink-0 rounded-full p-0"
                      >
                        {isSending ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="ml-0.5 h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {attachedDatasets.length > 1 && (
                          <SelectPill value={selectedDatasetId} onChange={setSelectedDatasetId}>
                            {attachedDatasets.map((dataset: Dataset) => (
                              <option key={dataset.dataset_id} value={dataset.dataset_id}>
                                {dataset.name}
                              </option>
                            ))}
                          </SelectPill>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                          <Zap className="h-3 w-3" />
                          <span>{`Grounded - ${MODE_CONFIGS[mode]?.label ?? mode}`}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground/45">Press Enter to send</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {sourceInspectorPanel && (
              <div className="hidden w-[440px] shrink-0 border-l border-border/50 bg-background/92 xl:flex">
                {sourceInspectorPanel}
              </div>
            )}
          </div>
        </div>
      </div>

      {sourceInspectorPanel && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm xl:hidden">
          <div className="absolute inset-x-3 bottom-3 top-3 overflow-hidden rounded-[2rem] border border-border/60 bg-background shadow-2xl">
            {sourceInspectorPanel}
          </div>
        </div>
      )}

      {workflowModal}
      {journeyModal}

      {feedbackRunId && (
        <ChatFeedbackModal
          rating={feedbackRating}
          onClose={() => setFeedbackRunId(null)}
          onSubmit={(feedback) => handleFeedback(feedbackRunId, feedback)}
        />
      )}
    </div>
  );
}
