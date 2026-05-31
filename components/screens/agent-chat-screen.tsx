"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Flag,
  GitBranch,
  LoaderCircle,
  Plus,
  Send,
  ThumbsDown,
  ThumbsUp,
  Zap,
} from "lucide-react";
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
import type {
  AgentChatResponse,
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

const STEP_LABELS: Record<WorkflowStepId, string> = {
  init: "Initialize",
  conversation_history: "Load Context",
  check_retrieval: "Analyze Query",
  research: "Retrieve Evidence",
  generate: "Generate Answer",
};

const STEP_ORDER: WorkflowStepId[] = ["init", "conversation_history", "check_retrieval", "research", "generate"];

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
      error?: string;
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

function formatMs(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
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

function stageLatenciesFromSteps(steps: WorkflowStep[]) {
  const byStep = new Map(steps.map((step) => [step.step, step.durationMs ?? 0]));
  return {
    conversation_history_ms: byStep.get("conversation_history") ?? 0,
    check_retrieval_ms: byStep.get("check_retrieval") ?? 0,
    retrieval_ms: byStep.get("research") ?? 0,
    evidence_packaging_ms: 0,
    answering_ms: byStep.get("generate") ?? 0,
  };
}

function WorkflowStrip({ steps }: { steps: WorkflowStep[] }) {
  const byId = new Map(steps.map((step) => [step.step, step]));

  return (
    <div className="pointer-events-none absolute bottom-32 left-0 right-0 z-20 px-4">
      <div className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-2 overflow-x-auto rounded-full border border-border/20 bg-background/75 px-3 py-2 shadow-lg backdrop-blur-xl">
        {STEP_ORDER.map((id) => {
          const step = byId.get(id);
          const status = step?.status ?? "idle";
          return (
            <div
              key={id}
              className={cn(
                "flex min-w-max items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-medium transition-colors",
                status === "running" && "border-blue-400/40 bg-blue-400/10 text-blue-500",
                status === "completed" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
                status === "idle" && "border-border/15 bg-foreground/[0.02] text-muted-foreground/55",
              )}
            >
              {status === "running" ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              <span>{STEP_LABELS[id]}</span>
              {step?.durationMs !== undefined ? <span className="opacity-70">{formatMs(step.durationMs)}</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QueryJourneyModal({ run, onClose }: { run: Run; onClose: () => void }) {
  const latencies = run.stage_latencies_ms ?? {};
  const steps = [
    { label: "Load Context", ms: latencies.conversation_history_ms ?? 0 },
    { label: "Analyze Query", ms: latencies.check_retrieval_ms ?? 0 },
    { label: "Retrieve Evidence", ms: (latencies.retrieval_ms ?? 0) + (latencies.evidence_packaging_ms ?? 0) },
    { label: "Generate Answer", ms: latencies.answering_ms ?? 0 },
  ].filter((step) => step.ms > 0);
  const total = steps.reduce((sum, step) => sum + step.ms, 0) || run.total_latency_ms || 1;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-2xl overflow-hidden rounded-[2rem] border border-border/30 bg-background/90 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-border/15 px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Query Journey</p>
          <p className="mt-1 text-xs text-muted-foreground">{run.effective_tier} tier · {formatMs(run.total_latency_ms)}</p>
        </div>
        <div className="grid gap-3 p-5">
          {steps.length === 0 ? (
            <p className="rounded-2xl border border-border/15 bg-foreground/[0.02] p-4 text-sm text-muted-foreground">
              Detailed stage timing is not available for this run yet.
            </p>
          ) : (
            steps.map((step) => {
              const percent = Math.max(4, Math.round((step.ms / total) * 100));
              return (
                <div key={step.label} className="rounded-2xl border border-border/15 bg-foreground/[0.02] p-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{step.label}</span>
                    <span className="text-muted-foreground">{formatMs(step.ms)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                    <div className="h-full rounded-full bg-foreground/70" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })
          )}
          <div className="rounded-2xl border border-border/15 bg-foreground/[0.02] p-4 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Routing reason</p>
            <p>{run.routing_reason}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageTrustReview({
  run,
  feedback,
  onJourney,
  onFeedback,
}: {
  run: Run;
  feedback?: "positive" | "negative";
  onJourney: () => void;
  onFeedback: (rating: "positive" | "negative") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const rating = feedback ?? run.feedback_rating ?? null;

  return (
    <div className="mt-2 pl-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 rounded-full border border-border/20 bg-foreground/[0.02] px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-foreground/[0.04]"
        >
          <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-500">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {Math.round(run.confidence_score * 100)}% Confidence
          </span>
          <div className="mx-1 h-3 w-px bg-border/40" />
          <span className="flex items-center gap-1.5">
            <FileText className="h-3 w-3" />
            {run.citations.length} Citations
          </span>
          <ChevronDown className={cn("ml-1 h-3 w-3 transition-transform duration-200", expanded && "rotate-180")} />
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
          className={cn("rounded-full border border-border/20 p-1.5 text-muted-foreground hover:text-foreground", rating === "positive" && "bg-emerald-500/10 text-emerald-600")}
          title="Helpful"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onFeedback("negative")}
          className={cn("rounded-full border border-border/20 p-1.5 text-muted-foreground hover:text-foreground", rating === "negative" && "bg-red-500/10 text-red-500")}
          title="Needs work"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded ? (
        <div className="glass mt-3 origin-top animate-fade-in overflow-hidden rounded-2xl border border-border/20 bg-foreground/[0.02]">
          <div className="grid gap-px bg-border/20">
            <div className="bg-background/80 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Routing Reason</p>
              <p className="text-[13px] leading-relaxed text-foreground/80">{run.routing_reason}</p>
            </div>
            {run.degraded_reasons.length > 0 ? (
              <div className="bg-background/80 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  <Flag className="h-3 w-3" />
                  Degraded Reasons
                </p>
                <div className="flex flex-wrap gap-2">
                  {run.degraded_reasons.map((reason) => (
                    <span key={reason} className="rounded-full border border-border/15 px-2 py-1 text-[11px] text-muted-foreground">{reason}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {run.citations.length > 0 ? (
              <div className="bg-background/80 p-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Supporting Evidence</p>
                <div className="grid gap-2.5">
                  {run.citations.map((cite, index) => (
                    <div key={cite.citation_id ?? index} className="flex items-start gap-3 rounded-xl border border-border/15 bg-secondary/10 p-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-foreground/10 text-[10px] font-bold text-foreground">{index + 1}</div>
                      <div>
                        <p className="text-[13px] leading-relaxed text-foreground/90">&ldquo;{cite.quote}&rdquo;</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">Chunk {cite.chunk_index} · {cite.document_id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AgentChatScreen({ id }: { id: string }) {
  const { apiKey, workspaceId } = useAuth();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const agentQuery = useApiQuery(() => getAgent(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const conversationsQuery = useApiQuery(() => listAgentConversations(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const capabilitiesQuery = useApiQuery(() => getCapabilities(apiKey!), [apiKey], Boolean(apiKey));
  const datasetsQuery = useApiQuery(() => listDatasets(apiKey!, workspaceId), [apiKey, workspaceId], Boolean(apiKey && workspaceId));
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesQuery = useApiQuery(() => getConversationMessages(apiKey!, conversationId!), [apiKey, conversationId], Boolean(apiKey && conversationId));
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
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "positive" | "negative">>({});

  const agent = agentQuery.data;
  const conversations = conversationsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const modes = capabilitiesQuery.data?.modes.filter((item) => item.enabled) ?? [];
  const datasets = datasetsQuery.data ?? [];
  const attachedDatasets = useMemo(() => {
    const attachedIds = new Set(agent?.dataset_ids ?? []);
    return datasets.filter((dataset) => attachedIds.has(dataset.dataset_id));
  }, [agent?.dataset_ids, datasets]);

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
    if (!apiKey) return;
    const missingRunIds = messages
      .map((item) => item.run_id)
      .filter((runId): runId is string => Boolean(runId && !runById[runId]));

    if (missingRunIds.length === 0) return;

    let cancelled = false;
    async function hydrateRuns() {
      const rows = await Promise.all(
        Array.from(new Set(missingRunIds)).map(async (runId) => {
          try {
            return await getRun(apiKey!, runId);
          } catch {
            return null;
          }
        }),
      );
      if (cancelled) return;
      setRunById((current) => {
        const next = { ...current };
        for (const row of rows) {
          if (row) next[row.run_id] = row;
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
  }, [messages.length, localExchange?.status, conversationId]);

  async function newConversation() {
    if (!apiKey) return;
    const created = await createAgentConversation(apiKey, id, { title: "New conversation", mode });
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
        const created = await createAgentConversation(apiKey, id, { title: trimmed.slice(0, 80) || "New conversation", mode });
        activeConversationId = created.conversation_id;
        setConversationId(activeConversationId);
      }

      let streamedSteps: WorkflowStep[] = [];
      for await (const event of streamAgentChat(apiKey, id, { conversation_id: activeConversationId, message: trimmed, mode, dataset_id: datasetId })) {
        if (event.type === "step_started") {
          streamedSteps = streamedSteps.find((step) => step.step === event.step)
            ? streamedSteps.map((step) => step.step === event.step ? { ...step, status: "running" } : step)
            : [...streamedSteps, { step: event.step, label: event.label, status: "running" }];
          setWorkflowSteps(streamedSteps);
        }

        if (event.type === "step_completed") {
          streamedSteps = streamedSteps.map((step) =>
              step.step === event.step
                ? {
                    ...step,
                    status: "completed",
                    durationMs: event.duration_ms,
                    metadata: {
                      ...(event.evidence_count !== undefined ? { evidence_count: event.evidence_count } : {}),
                      ...(event.message_count !== undefined ? { message_count: event.message_count } : {}),
                    },
                  }
                : step,
          );
          setWorkflowSteps(streamedSteps);
        }

        if (event.type === "answer") {
          const fallbackRun = {
            ...buildRunFromResponse(event.data, trimmed),
            stage_latencies_ms: stageLatenciesFromSteps(streamedSteps),
          };
          let run: Run = fallbackRun;
          try {
            run = await getRun(apiKey, event.data.run_id);
          } catch {
            // The streamed answer is already complete; keep local run details if hydration is delayed.
          }
          setRunById((current) => ({ ...current, [run.run_id]: run }));
          setConversationId(event.data.conversation_id);
          setLocalExchange(null);
          await messagesQuery.reload();
          await conversationsQuery.reload();
        }

        if (event.type === "error") {
          throw new Error(event.detail);
        }
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unable to send the message.";
      setErrorMessage(detail);
      setLocalExchange({ ...local, status: "error", error: detail });
    } finally {
      setIsSending(false);
    }
  }

  async function handleFeedback(runId: string, feedback: FeedbackSubmission) {
    if (!apiKey) return;
    const updated = await submitFeedback(apiKey, runId, feedback);
    setRunById((current) => ({ ...current, [runId]: updated }));
    setMessageFeedback((current) => ({ ...current, [runId]: feedback.rating }));
  }

  const visibleMessages = useMemo<VisibleMessage[]>(() => {
    const rows: VisibleMessage[] = messages.map((item) => ({ ...item, local: false }));
    if (!localExchange) return rows;
    const matchesConversation =
      !localExchange.conversationId ||
      !conversationId ||
      localExchange.conversationId === conversationId ||
      messages.length === 0;
    if (!matchesConversation) return rows;

    const serverAlreadyHasUserMessage = rows.some(
      (item) =>
        item.role === "user" &&
        item.content.trim() === localExchange.message.trim() &&
        new Date(item.created_at).getTime() >=
          new Date(localExchange.submittedAt).getTime() - 5000,
    );

    const optimisticUser: VisibleMessage[] = serverAlreadyHasUserMessage
      ? []
      : [{
        message_id: localExchange.userKey,
        conversation_id: localExchange.conversationId ?? "local",
        created_by_api_key_id: null,
        run_id: null,
        role: "user",
        content: localExchange.message,
        created_at: localExchange.submittedAt,
        local: true,
      }];

    return [
      ...rows,
      ...optimisticUser,
      {
        message_id: localExchange.assistantKey,
        conversation_id: localExchange.conversationId ?? "local",
        created_by_api_key_id: null,
        run_id: null,
        role: "assistant",
        content: localExchange.status === "error" ? localExchange.error : "",
        created_at: localExchange.submittedAt,
        local: true,
        pending: localExchange.status === "pending",
        error: localExchange.status === "error",
      },
    ];
  }, [conversationId, localExchange, messages]);

  return (
    <div className="glass relative flex h-full w-full overflow-hidden rounded-[2.5rem] border border-border/30 shadow-2xl shadow-black/5 dark:shadow-black/20">
      <div className="hidden w-72 shrink-0 flex-col border-r border-border/20 bg-foreground/[0.01] xl:flex">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/15 px-4">
          <h2 className="text-[13px] font-semibold text-foreground">Chat History</h2>
          <button onClick={newConversation} className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-foreground/5">
            <Plus className="h-4 w-4 text-foreground/70" />
          </button>
        </div>
        <div className="scrollbar-none flex-1 overflow-y-auto px-3 py-3">
          <div className="grid gap-2">
            {conversations.map((conv) => (
              <button
                key={conv.conversation_id}
                onClick={() => {
                  setConversationId(conv.conversation_id);
                  setLocalExchange(null);
                }}
                className={cn(
                  "block w-full min-w-0 rounded-xl border px-3 py-3 text-left transition-all duration-200",
                  conv.conversation_id === conversationId
                    ? "border-border/20 bg-foreground/[0.055] shadow-sm"
                    : "border-transparent hover:bg-foreground/[0.03]",
                )}
              >
                <p className="block max-w-full truncate pr-1 text-[13px] font-medium leading-5 text-foreground">{conv.title}</p>
                <div className="mt-1.5 flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground/70">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="truncate">{formatDate(conv.updated_at)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex h-full flex-1 flex-col bg-gradient-to-b from-transparent to-background/50">
        <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/15 bg-background/40 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/20 bg-foreground/[0.05]">
              <Bot className="h-4 w-4 text-foreground/80" />
            </div>
            <div>
              <h1 className="text-[14px] font-semibold leading-tight text-foreground">{agent?.name ?? "Agent"}</h1>
              <p className="text-[11px] leading-tight text-muted-foreground/70">{agent?.dataset_ids.length ?? 0} datasets connected</p>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="mx-4 mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-500">{errorMessage}</div>
        ) : null}

        <div className="scrollbar-none flex-1 overflow-y-auto px-4">
          <div className="mx-auto max-w-3xl space-y-8 pb-56 pt-8">
            {visibleMessages.length === 0 ? (
              <div className="grid place-items-center pt-20 text-center text-sm text-muted-foreground">Start a grounded conversation with this agent.</div>
            ) : (
              visibleMessages.map((item) => {
                const msgRun = item.run_id ? runById[item.run_id] : null;
                return (
                  <div key={item.message_id} className={cn("flex w-full animate-slide-up", item.role === "user" ? "justify-end" : "justify-start")}>
                    {item.role === "user" ? (
                      <div className="max-w-[80%] md:max-w-[70%]">
                        <div className="rounded-[1.5rem] rounded-tr-sm bg-foreground px-5 py-3.5 text-background shadow-md">
                          <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{item.content}</p>
                        </div>
                        <p className="mt-1.5 px-2 text-right text-[10px] text-muted-foreground/50">{formatDate(item.created_at)}</p>
                      </div>
                    ) : (
                      <div className="flex max-w-[85%] gap-4 md:max-w-[75%]">
                        <div className="mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/20 bg-foreground/[0.05] sm:flex">
                          <Bot className="h-4 w-4 text-foreground/80" />
                        </div>
                        <div>
                          <div className={cn("glass rounded-[1.5rem] rounded-tl-sm border border-border/20 px-5 py-4 shadow-sm", item.error && "border-red-500/25 bg-red-500/10")}>
                            {item.pending ? (
                              <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Working through the grounded pipeline
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">{item.content}</p>
                            )}
                          </div>
                          {msgRun ? (
                            <MessageTrustReview
                              run={msgRun}
                              feedback={messageFeedback[msgRun.run_id]}
                              onJourney={() => setJourneyRun(msgRun)}
                              onFeedback={(rating) => {
                                setFeedbackRunId(msgRun.run_id);
                                setFeedbackRating(rating);
                              }}
                            />
                          ) : null}
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

        {(isSending || workflowSteps.length > 0) ? <WorkflowStrip steps={workflowSteps} /> : null}

        <div className="pointer-events-none absolute bottom-6 left-0 right-0 px-4">
          <div className="mx-auto max-w-3xl">
            <div className="pointer-events-auto rounded-[1.75rem] border border-border/40 bg-background p-2 shadow-xl shadow-black/10">
              <div className="relative flex items-end gap-2 px-2 pb-1">
                <textarea
                  className="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent py-3 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50"
                  placeholder="Ask a question..."
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
                <Button onClick={handleSend} disabled={isSending || !message.trim()} className="mb-0.5 h-10 w-10 shrink-0 rounded-full p-0 shadow-sm">
                  {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="ml-0.5 h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-border/10 px-3 pb-1.5 pt-1">
                <div className="flex min-w-0 items-center gap-2">
                  <SelectPill value={mode} onChange={(value) => setMode(value as UserFacingMode)}>
                    {(modes.length > 0 ? modes : [{ mode: "auto", label: "Auto" }]).map((item) => (
                      <option key={item.mode} value={item.mode}>{item.label}</option>
                    ))}
                  </SelectPill>
                  {attachedDatasets.length > 1 ? (
                    <SelectPill value={selectedDatasetId} onChange={setSelectedDatasetId}>
                      {attachedDatasets.map((dataset: Dataset) => (
                        <option key={dataset.dataset_id} value={dataset.dataset_id}>{dataset.name}</option>
                      ))}
                    </SelectPill>
                  ) : null}
                  <div className="hidden items-center gap-1.5 text-[10px] font-medium text-muted-foreground/60 sm:flex">
                    <Zap className="h-3 w-3" />
                    Grounded securely in your datasets
                  </div>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/40">Return to send</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {journeyRun ? <QueryJourneyModal run={journeyRun} onClose={() => setJourneyRun(null)} /> : null}
      {feedbackRunId ? (
        <ChatFeedbackModal
          rating={feedbackRating}
          onClose={() => setFeedbackRunId(null)}
          onSubmit={(feedback) => handleFeedback(feedbackRunId, feedback)}
        />
      ) : null}
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
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-w-0">
      <select
        className="max-w-36 appearance-none truncate rounded-full border border-border/20 bg-foreground/[0.04] py-1 pl-2.5 pr-6 text-[10px] font-medium text-foreground outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
