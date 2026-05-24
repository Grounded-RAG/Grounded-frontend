"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, ChevronDown, Clock, FileText, Plus, Send, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAgentConversation, getAgent, getCapabilities, getConversationMessages, listAgentConversations, sendAgentChat } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Message, Run, UserFacingMode } from "@/lib/types";
import { useApiQuery } from "@/lib/use-api-query";
import { cn, formatDate } from "@/lib/utils";

function MessageTrustReview({ run }: { run: Run }) {
  const [expanded, setExpanded] = useState(false);
  return <div className="mt-2 pl-2"><button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 rounded-full border border-border/20 bg-foreground/[0.02] px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-foreground/[0.04]"><span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-500"><CheckCircle2 className="h-3.5 w-3.5" />{Math.round(run.confidence_score * 100)}% Confidence</span><div className="mx-1 h-3 w-px bg-border/40" /><span className="flex items-center gap-1.5"><FileText className="h-3 w-3" />{run.citations.length} Citations</span><ChevronDown className={cn("ml-1 h-3 w-3 transition-transform duration-200", expanded && "rotate-180")} /></button>{expanded ? <div className="glass mt-3 origin-top animate-fade-in overflow-hidden rounded-2xl border border-border/20 bg-foreground/[0.02]"><div className="grid gap-px bg-border/20"><div className="bg-background/80 p-4"><p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Routing Reason</p><p className="text-[13px] leading-relaxed text-foreground/80">{run.routing_reason}</p></div>{run.citations.length > 0 ? <div className="bg-background/80 p-4"><p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Supporting Evidence</p><div className="grid gap-2.5">{run.citations.map((cite, index) => <div key={cite.citation_id ?? index} className="flex items-start gap-3 rounded-xl border border-border/15 bg-secondary/10 p-3"><div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-foreground/10 text-[10px] font-bold text-foreground">{index + 1}</div><div><p className="text-[13px] leading-relaxed text-foreground/90">&ldquo;{cite.quote}&rdquo;</p><p className="mt-1 text-[11px] text-muted-foreground">Chunk {cite.chunk_index} · {cite.document_id}</p></div></div>)}</div></div> : null}</div></div> : null}</div>;
}

export function AgentChatScreen({ id }: { id: string }) {
  const { apiKey } = useAuth();
  const agentQuery = useApiQuery(() => getAgent(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const conversationsQuery = useApiQuery(() => listAgentConversations(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const capabilitiesQuery = useApiQuery(() => getCapabilities(apiKey!), [apiKey], Boolean(apiKey));
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesQuery = useApiQuery(() => getConversationMessages(apiKey!, conversationId!), [apiKey, conversationId], Boolean(apiKey && conversationId));
  const [localRuns, setLocalRuns] = useState<Record<string, Run>>({});
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<UserFacingMode>("auto");
  const [isSending, setIsSending] = useState(false);
  const agent = agentQuery.data;
  const conversations = conversationsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const modes = capabilitiesQuery.data?.modes.filter((item) => item.enabled) ?? [];

  useEffect(() => { if (!conversationId && conversations[0]) setConversationId(conversations[0].conversation_id); }, [conversationId, conversations]);

  const runById = useMemo(() => localRuns, [localRuns]);

  async function newConversation() {
    if (!apiKey) return;
    const created = await createAgentConversation(apiKey, id, { title: "New conversation", mode });
    setConversationId(created.conversation_id);
    await conversationsQuery.reload();
  }

  async function handleSend() {
    if (!apiKey || !message.trim()) return;
    setIsSending(true);
    try {
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const created = await createAgentConversation(apiKey, id, { title: message.slice(0, 80), mode });
        activeConversationId = created.conversation_id;
        setConversationId(activeConversationId);
      }
      const response = await sendAgentChat(apiKey, id, { conversation_id: activeConversationId, message: message.trim(), mode });
      setLocalRuns((prev) => ({ ...prev, [response.run_id]: { run_id: response.run_id, dataset_id: response.dataset_id, agent_id: response.agent_id, conversation_id: response.conversation_id, selected_mode: response.mode, requested_tier: null, router_recommendation: "standard", effective_tier: "standard", routing_reason: "Generated from agent chat", query: message.trim(), answer: response.answer, citations: response.citations, confidence_score: response.confidence_score, confidence_label: response.confidence_label, support_summary: response.support_summary, verification_status: response.verification_status, degraded_reasons: response.degraded_reasons, generator_provider: response.generator_provider, provider_backend: response.provider_backend, provider_model: response.provider_model, provider_fallback_used: response.provider_fallback_used, provider_fallback_from: response.provider_fallback_from, retrieved_chunk_ids: [], selected_evidence_ids: [], total_latency_ms: 0, created_at: new Date().toISOString() } }));
      setMessage("");
      await messagesQuery.reload();
      await conversationsQuery.reload();
    } finally { setIsSending(false); }
  }

  return <div className="glass relative flex h-full w-full overflow-hidden rounded-[2.5rem] border border-border/30 shadow-2xl shadow-black/5 dark:shadow-black/20"><div className="hidden w-64 flex-col border-r border-border/20 bg-foreground/[0.01] xl:flex"><div className="flex items-center justify-between border-b border-border/15 p-4"><h2 className="text-[13px] font-semibold text-foreground">Chat History</h2><button onClick={newConversation} className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-foreground/5"><Plus className="h-4 w-4 text-foreground/70" /></button></div><div className="scrollbar-none flex-1 overflow-y-auto p-2"><div className="grid gap-1">{conversations.map((conv) => <button key={conv.conversation_id} onClick={() => setConversationId(conv.conversation_id)} className={cn("rounded-xl p-3 text-left transition-all duration-200", conv.conversation_id === conversationId ? "bg-foreground/5 shadow-sm" : "hover:bg-foreground/[0.03]")}><p className="truncate text-[13px] font-medium text-foreground">{conv.title}</p><div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground/70"><Clock className="h-3 w-3" /><span>{formatDate(conv.updated_at)}</span></div></button>)}</div></div></div><div className="relative flex h-full flex-1 flex-col bg-gradient-to-b from-transparent to-background/50"><div className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/15 bg-background/40 px-6 backdrop-blur-md"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/20 bg-foreground/[0.05]"><Bot className="h-4 w-4 text-foreground/80" /></div><div><h1 className="text-[14px] font-semibold leading-tight text-foreground">{agent?.name ?? "Agent"}</h1><p className="text-[11px] leading-tight text-muted-foreground/70">{agent?.dataset_ids.length ?? 0} datasets connected</p></div></div></div><div className="scrollbar-none flex-1 overflow-y-auto px-4"><div className="mx-auto space-y-8 pb-40 pt-8 max-w-3xl">{messages.length === 0 ? <div className="grid place-items-center pt-20 text-center text-sm text-muted-foreground">Start a grounded conversation with this agent.</div> : messages.map((item: Message) => { const msgRun = item.run_id ? runById[item.run_id] : null; return <div key={item.message_id} className={cn("flex w-full animate-slide-up", item.role === "user" ? "justify-end" : "justify-start")}>{item.role === "user" ? <div className="max-w-[80%] md:max-w-[70%]"><div className="rounded-[1.5rem] rounded-tr-sm bg-foreground px-5 py-3.5 text-background shadow-md"><p className="whitespace-pre-wrap text-[14px] leading-relaxed">{item.content}</p></div><p className="mt-1.5 px-2 text-right text-[10px] text-muted-foreground/50">{formatDate(item.created_at)}</p></div> : <div className="flex max-w-[85%] gap-4 md:max-w-[75%]"><div className="mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/20 bg-foreground/[0.05] sm:flex"><Bot className="h-4 w-4 text-foreground/80" /></div><div><div className="glass rounded-[1.5rem] rounded-tl-sm border border-border/20 px-5 py-4 shadow-sm"><p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">{item.content}</p></div>{msgRun ? <MessageTrustReview run={msgRun} /> : null}</div></div>}</div>; })}</div></div><div className="pointer-events-none absolute bottom-6 left-0 right-0 px-4"><div className="mx-auto max-w-3xl"><div className="glass pointer-events-auto rounded-[2rem] border border-border/30 bg-background/60 p-2 shadow-2xl shadow-black/10 backdrop-blur-xl"><div className="relative flex items-end gap-2 px-2 pb-1"><textarea className="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent py-3 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50" placeholder="Ask a question..." rows={1} value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void handleSend(); } }} /><Button onClick={handleSend} disabled={isSending || !message.trim()} className="mb-0.5 h-10 w-10 shrink-0 rounded-full p-0 shadow-sm"><Send className="ml-0.5 h-4 w-4" /></Button></div><div className="mt-1 flex items-center justify-between border-t border-border/10 px-3 pb-1.5 pt-1"><div className="flex items-center gap-2"><div className="relative"><select className="appearance-none rounded-full border border-border/20 bg-foreground/[0.04] py-1 pl-2.5 pr-6 text-[10px] font-medium text-foreground outline-none" value={mode} onChange={(event) => setMode(event.target.value as UserFacingMode)}>{modes.map((item) => <option key={item.mode} value={item.mode}>{item.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" /></div><div className="hidden items-center gap-1.5 text-[10px] font-medium text-muted-foreground/60 sm:flex"><Zap className="h-3 w-3" />Grounded securely in your datasets</div></div><span className="text-[10px] font-medium text-muted-foreground/40">Return to send</span></div></div></div></div></div></div>;
}
