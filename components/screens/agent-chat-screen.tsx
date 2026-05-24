"use client";

import { useState } from "react";
import {
  Bot,
  ChevronDown,
  CheckCircle2,
  Copy,
  FileText,
  Flag,
  GitBranch,
  RefreshCw,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
  Zap,
  Clock,
  Plus,
} from "lucide-react";
import { DetailPageHeader } from "@/components/ui/detail-page-header";
import { flatDetailCardClass } from "@/components/ui/card-surface";
import { Button } from "@/components/ui/button";
import { agents, conversations, messages, runs } from "@/lib/mock-data";
import { cn, formatDate, workspaceHref } from "@/lib/utils";

function MessageTrustReview({ run }: { run: (typeof runs)[number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-muted"
      >
        <span className="flex items-center gap-1.5 font-medium text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {run.confidence_score}% Confidence
        </span>
        <span className="h-3 w-px bg-border/40" />
        <span className="flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          {run.citations.length} Citations
        </span>
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", expanded && "rotate-180")} />
      </button>

      {expanded ? (
        <div className="mt-3 animate-fade-in rounded-[1.25rem] bg-background/60 p-4 ring-1 ring-border/30">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Routing Reason</p>
          <p className="text-sm leading-relaxed text-foreground/80">{run.routing_reason ?? "Information found in primary datasets."}</p>
          {run.citations.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {run.citations.map((cite, i) => (
                <div key={i} className="rounded-[1rem] bg-card/80 p-3 ring-1 ring-border/20">
                  <p className="text-sm leading-relaxed">&ldquo;{cite.quote}&rdquo;</p>
                  <p className="mt-1 text-xs text-muted-foreground">Chunk {cite.chunk_index} · {cite.document_id}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const docLines = [
  "SAMRAWIT GEBREMARYAM BAHTA",
  "Software Engineer",
  "",
  "EXPERIENCE",
  "Senior Developer · Tech Corp · 2022–Present",
  "• Led document intelligence platform rollout",
  "• Built RAG pipelines with citation grounding",
  "",
  "EDUCATION",
  "BSc Computer Science · 2018",
];

export function AgentChatScreen({ id, workspaceSlug }: { id: string; workspaceSlug?: string }) {
  const agent = agents.find((a) => a.agent_id === id) ?? agents[0];
  const agentConvos = conversations.filter((c) => c.agent_id === agent.agent_id);
  const [showDoc, setShowDoc] = useState(false);
  const agentsHref = workspaceHref(workspaceSlug, "/agents");

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <DetailPageHeader href={agentsHref} backLabel="Back" className="mb-0 shrink-0" />

      <div className={`${flatDetailCardClass} flex shrink-0 items-center gap-3 rounded-[2rem] px-4 py-3`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
          <Bot className="h-5 w-5" />
        </div>
        <h2 className="min-w-0 truncate text-lg font-bold text-foreground">{agent.name}</h2>
      </div>

      <div className="flex min-h-0 flex-1 w-full min-w-0 overflow-hidden rounded-[2rem] bg-card ring-1 ring-border/30 sm:rounded-[2.75rem]">
      <div className="hidden w-48 shrink-0 flex-col border-r border-border/20 md:flex md:w-56">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-sm font-semibold">Chat History</h2>
          <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted/50">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {agentConvos.map((conv, i) => (
            <div
              key={conv.conversation_id}
              className={cn(
                "cursor-pointer rounded-[1.25rem] p-3 transition-colors",
                i === 0 ? "bg-muted/50" : "hover:bg-muted/30",
              )}
            >
              <p className="truncate text-sm font-medium">{conv.title}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDate(conv.updated_at)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-10 shrink-0 flex-wrap items-center justify-between gap-2 px-3 sm:px-4">
          <button type="button" className="flex min-w-0 items-center gap-2 text-xs font-medium text-primary hover:underline sm:text-sm">
            <GitBranch className="h-4 w-4 shrink-0" />
            <span className="truncate">View Completed Workflow</span>
          </button>
          <button
            type="button"
            onClick={() => setShowDoc(true)}
            className="flex items-center gap-1.5 rounded-full bg-muted/50 px-4 py-2 text-xs font-medium text-foreground lg:hidden"
          >
            <FileText className="h-3.5 w-3.5" />
            Source
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="mx-auto max-w-2xl space-y-6 pt-2">
            {messages.map((message) => {
              const msgRun = message.run_id ? runs.find((r) => r.run_id === message.run_id) : null;
              return (
                <div key={message.message_id} className={cn("flex w-full animate-slide-up", message.role === "user" ? "justify-end" : "justify-start")}>
                  {message.role === "user" ? (
                    <div className="max-w-[92%] rounded-[1.75rem] rounded-br-md bg-muted/70 px-5 py-3.5 ring-1 ring-border/20 sm:max-w-[85%]">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ) : (
                    <div className="flex max-w-[92%] gap-3 sm:max-w-[88%]">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="rounded-[1.75rem] rounded-tl-md bg-muted/40 px-5 py-4 ring-1 ring-border/25 backdrop-blur-sm">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{message.content}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-0.5 pl-1 text-muted-foreground">
                          <button type="button" className="rounded-full p-2 hover:bg-muted/50"><ThumbsUp className="h-3.5 w-3.5" /></button>
                          <button type="button" className="rounded-full p-2 hover:bg-muted/50"><ThumbsDown className="h-3.5 w-3.5" /></button>
                          <button type="button" className="rounded-full p-2 hover:bg-muted/50"><Flag className="h-3.5 w-3.5" /></button>
                          <button type="button" className="rounded-full p-2 hover:bg-muted/50"><Copy className="h-3.5 w-3.5" /></button>
                          <button type="button" className="rounded-full p-2 hover:bg-muted/50"><RefreshCw className="h-3.5 w-3.5" /></button>
                        </div>
                        {msgRun ? <MessageTrustReview run={msgRun} /> : null}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 px-3 pb-3 sm:px-4 sm:pb-4">
          <div className="field-surface mx-auto max-w-2xl rounded-[2rem] px-3 py-2 sm:px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <textarea
                className="min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground sm:min-h-[44px] sm:py-3"
                placeholder="Type your question here..."
                rows={1}
              />
              <Button size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="hidden items-center px-2 pb-0.5 pt-0.5 text-[10px] text-muted-foreground sm:flex">
              <Zap className="mr-1 h-3 w-3" />
              Grounded in {agent.dataset_ids.length} datasets
            </div>
          </div>
        </div>
      </div>

      <div className="hidden w-[min(100%,380px)] shrink-0 flex-col overflow-hidden border-l border-border/20 bg-card/50 lg:flex lg:rounded-r-[2.5rem]">
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-border/20 px-3 sm:px-4">
          <p className="min-w-0 truncate text-sm font-medium">Samrawit-Gebremaryam-Resume.pdf</p>
          <div className="flex shrink-0 items-center gap-0.5">
            <button type="button" className="rounded-full p-2 hover:bg-muted/50"><ThumbsUp className="h-3.5 w-3.5" /></button>
            <button type="button" className="rounded-full p-2 hover:bg-muted/50"><ThumbsDown className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="overflow-hidden rounded-[1.5rem] bg-background/40 p-4 text-sm leading-relaxed ring-1 ring-border/20">
            <div className="space-y-1">
              {docLines.map((line, i) => (
                <p key={i} className={cn(i === 4 || i === 5 ? "rounded-lg bg-amber-100/70 px-1.5 py-0.5 dark:bg-amber-500/20" : "")}>{line || " "}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showDoc ? (
        <>
          <button
            type="button"
            aria-label="Close source panel"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setShowDoc(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw,24rem)] flex-col border-l border-border/20 bg-card lg:hidden">
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-border/20 px-3 sm:px-4">
              <p className="min-w-0 truncate text-sm font-medium">Samrawit-Gebremaryam-Resume.pdf</p>
              <button type="button" onClick={() => setShowDoc(false)} className="rounded-full p-2 hover:bg-muted/50"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="overflow-hidden rounded-[1.5rem] bg-background/40 p-4 text-sm leading-relaxed ring-1 ring-border/20">
                <div className="space-y-1">
                  {docLines.map((line, i) => (
                    <p key={i} className={cn(i === 4 || i === 5 ? "rounded-lg bg-amber-100/70 px-1.5 py-0.5 dark:bg-amber-500/20" : "")}>{line || " "}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
      </div>
    </div>
  );
}