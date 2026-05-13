"use client";

import { useState } from "react";
import { Bot, ChevronDown, ChevronRight, CheckCircle2, ShieldAlert, FileText, Send, Zap, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { agents, capabilities, conversations, messages, runs } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";

// ─── Inline Trust Component ───
function MessageTrustReview({ run }: { run: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2 pl-2">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 rounded-full border border-border/20 bg-foreground/[0.02] px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-foreground/[0.04]"
      >
        <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-500">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {run.confidence_score}% Confidence
        </span>
        <div className="h-3 w-px bg-border/40 mx-1" />
        <span className="flex items-center gap-1.5">
          <FileText className="h-3 w-3" />
          {run.citations.length} Citations
        </span>
        <ChevronDown className={cn("h-3 w-3 ml-1 transition-transform duration-200", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-border/20 bg-foreground/[0.02] glass animate-fade-in origin-top">
          <div className="grid gap-px bg-border/20">
            {/* Reasoning Row */}
            <div className="bg-background/80 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">Routing Reason</p>
              <p className="text-[13px] leading-relaxed text-foreground/80">{run.routing_reason ?? "Information found natively in primary datasets."}</p>
            </div>
            
            {/* Citations Row */}
            {run.citations.length > 0 && (
              <div className="bg-background/80 p-4">
                 <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">Supporting Evidence</p>
                 <div className="grid gap-2.5">
                    {run.citations.map((cite: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-border/15 bg-secondary/10 p-3">
                         <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-foreground/10 text-[10px] font-bold text-foreground">
                            {i + 1}
                         </div>
                         <div>
                            <p className="text-[13px] leading-relaxed text-foreground/90">&ldquo;{cite.snippet}&rdquo;</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">Source: {cite.document_name}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Screen ───
export function AgentChatScreen({ id }: { id: string }) {
  const agent = agents.find((a) => a.agent_id === id) ?? agents[0];
  const agentConvos = conversations.filter((c) => c.agent_id === agent.agent_id);
  const conversation = agentConvos[0] ?? conversations[0];
  const run = runs.find((r) => r.agent_id === agent.agent_id) ?? runs[0];

  return (
    <div className="flex h-full w-full rounded-[2.5rem] border border-border/30 glass shadow-2xl shadow-black/5 dark:shadow-black/20 overflow-hidden relative">
      
      {/* ─── Chat History Sidebar (Left) ─── */}
      <div className="w-64 border-r border-border/20 bg-foreground/[0.01] hidden xl:flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/15">
           <h2 className="text-[13px] font-semibold text-foreground">Chat History</h2>
           <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-foreground/5 transition-colors">
              <Plus className="h-4 w-4 text-foreground/70" />
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
          <div className="grid gap-1">
             {agentConvos.map((conv, i) => (
                <div key={conv.conversation_id} className={cn("rounded-xl p-3 cursor-pointer transition-all duration-200 group", i === 0 ? "bg-foreground/5 shadow-sm" : "hover:bg-foreground/[0.03]")}>
                   <p className="text-[13px] font-medium text-foreground truncate group-hover:text-foreground">{conv.title}</p>
                   <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground/70">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(conv.updated_at)}</span>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* ─── Main Focus Canvas (Center) ─── */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-b from-transparent to-background/50 h-full">
        
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-border/15 bg-background/40 backdrop-blur-md sticky top-0 z-20 shrink-0">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-foreground/[0.05] border border-border/20 flex items-center justify-center">
                 <Bot className="h-4 w-4 text-foreground/80" />
              </div>
              <div>
                 <h1 className="text-[14px] font-semibold text-foreground leading-tight">{agent.name}</h1>
                 <p className="text-[11px] text-muted-foreground/70 leading-tight">{agent.dataset_ids.length} Datasets Connected</p>
              </div>
           </div>
        </div>

        {/* Chat Transcript Area */}
        <div className="flex-1 overflow-y-auto px-4 scrollbar-none">
           <div className="max-w-3xl mx-auto space-y-8 pt-8 pb-40">
              {messages.map((message) => {
                 const msgRun = message.run_id ? runs.find((r) => r.run_id === message.run_id) : null;
                 return (
                    <div key={message.message_id} className={cn("flex w-full animate-slide-up", message.role === "user" ? "justify-end" : "justify-start")}>
                       {message.role === "user" ? (
                          <div className="max-w-[80%] md:max-w-[70%]">
                             <div className="rounded-[1.5rem] rounded-tr-sm bg-foreground text-background px-5 py-3.5 shadow-md">
                                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                             </div>
                             <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-right px-2">{formatDate(message.created_at)}</p>
                          </div>
                       ) : (
                          <div className="max-w-[85%] md:max-w-[75%] flex gap-4">
                             <div className="h-8 w-8 shrink-0 rounded-full bg-foreground/[0.05] border border-border/20 flex items-center justify-center mt-1 hidden sm:flex">
                                <Bot className="h-4 w-4 text-foreground/80" />
                             </div>
                             <div>
                                <div className="rounded-[1.5rem] rounded-tl-sm glass border border-border/20 px-5 py-4 shadow-sm">
                                   <p className="text-[14px] leading-relaxed text-foreground/90 whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {msgRun && <MessageTrustReview run={msgRun} />}
                             </div>
                          </div>
                       )}
                    </div>
                 )
              })}
           </div>
        </div>

        {/* Floating Input Command Bar */}
        <div className="absolute bottom-6 left-0 right-0 px-4 pointer-events-none">
           <div className="max-w-3xl mx-auto">
              <div className="pointer-events-auto rounded-[2rem] glass border border-border/30 p-2 shadow-2xl shadow-black/10 dark:shadow-black/30 transition-all duration-300 focus-within:ring-2 focus-within:ring-foreground/20 focus-within:border-foreground/30 bg-background/60 backdrop-blur-xl">
                 <div className="relative flex items-end gap-2 px-2 pb-1">
                    <textarea 
                       className="w-full max-h-[200px] min-h-[44px] resize-none bg-transparent py-3 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 scrollbar-none" 
                       placeholder="Ask the policy agent a question..." 
                       rows={1}
                    />
                    <Button className="h-10 w-10 shrink-0 rounded-full mb-0.5 shadow-sm p-0 transition-transform hover:scale-105 active:scale-95">
                       <Send className="h-4 w-4 ml-0.5" />
                    </Button>
                 </div>
                 <div className="flex items-center justify-between px-3 pb-1.5 pt-1 border-t border-border/10 mt-1">
                    <div className="flex items-center gap-2">
                       <div className="relative group/dropdown">
                          <select className="appearance-none bg-foreground/[0.04] border border-border/20 text-foreground text-[10px] font-medium rounded-full py-1 pl-2.5 pr-6 cursor-pointer outline-none focus:ring-1 focus:ring-foreground/20 transition-all hover:bg-foreground/[0.08]">
                             {capabilities.map((mode) => (
                                <option key={mode.mode} value={mode.mode} disabled={!mode.enabled}>
                                   {mode.label} {!mode.enabled ? "(Waitlist)" : ""}
                                </option>
                             ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                       </div>
                       <div className="h-3 w-px bg-border/40" />
                       <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-medium hidden sm:flex">
                          <Zap className="h-3 w-3" />
                          Grounded securely in your datasets
                       </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground/40 font-medium">Return to send</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
