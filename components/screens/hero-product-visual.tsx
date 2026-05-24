"use client";

import {
  Activity,
  Bot,
  Database,
  FileText,
  LayoutDashboard,
  MessageSquareText,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

function NavIcon({
  icon: Icon,
  active,
}: {
  icon: typeof LayoutDashboard;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground/80",
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
    </div>
  );
}

export function HeroProductVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full select-none [perspective:1200px]",
        className,
      )}
      aria-hidden
    >
      <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-foreground/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -right-8 top-1/4 h-32 w-32 rounded-full bg-foreground/[0.06] blur-2xl" />

      <div className="relative transform-gpu transition-transform duration-700 [transform:rotateY(-5deg)_rotateX(3deg)] hover:[transform:rotateY(-2deg)_rotateX(1.5deg)]">
        <div className="overflow-hidden rounded-[1.35rem] border border-border/80 bg-[#0a0a0a] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.55)] ring-1 ring-white/10 sm:rounded-[1.65rem]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[#0a0a0a]">
                <Sparkles className="h-3 w-3" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-semibold leading-none text-white">Policy Copilot</p>
                <p className="mt-0.5 text-[9px] text-white/45">Grounded · Document intelligence</p>
              </div>
            </div>
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/35" />
            </div>
          </div>

          <div className="flex min-h-[320px] sm:min-h-[360px]">
            <aside className="flex w-11 shrink-0 flex-col items-center gap-2 border-r border-white/10 py-3 sm:w-12">
              <NavIcon icon={LayoutDashboard} active />
              <NavIcon icon={Bot} />
              <NavIcon icon={Database} />
              <NavIcon icon={FileText} />
              <NavIcon icon={Activity} />
              <div className="mt-auto">
                <NavIcon icon={MessageSquareText} />
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col bg-[#111111]">
              <div className="border-b border-white/5 px-3 py-2 sm:px-4">
                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/35">
                  Grounded run · auto mode
                </p>
              </div>

              <div className="flex-1 space-y-4 overflow-hidden px-3 py-4 sm:px-4 sm:py-5">
                <div className="ml-auto max-w-[88%] rounded-[1rem] rounded-br-sm bg-white/12 px-3 py-2.5 sm:px-3.5">
                  <p className="text-[10px] leading-relaxed text-white/90 sm:text-[11px]">
                    Can a contractor receive temporary workspace access?
                  </p>
                </div>

                <div className="flex max-w-[95%] gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10">
                    <Bot className="h-3.5 w-3.5 text-white/90" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="rounded-[1rem] rounded-tl-sm border border-white/10 bg-white/[0.06] px-3 py-2.5 backdrop-blur-sm sm:px-3.5">
                      <p className="text-[10px] leading-relaxed text-white/85 sm:text-[11px]">
                        Yes — with owner approval and a scheduled review. Grounded cites your access
                        policy and flags missing expiration dates.
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {["Workspace Access Policy §4.1", "Vendor Onboarding", "Form A-113"].map(
                          (cite) => (
                            <span
                              key={cite}
                              className="rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 text-[8px] font-medium text-white/75 sm:text-[9px]"
                            >
                              {cite}
                            </span>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                      {[
                        { label: "Confidence", value: "91%" },
                        { label: "Citations", value: "3 sources" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5"
                        >
                          <p className="text-[8px] uppercase tracking-wider text-white/40">
                            {stat.label}
                          </p>
                          <p className="text-[10px] font-semibold text-white">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 p-2.5 sm:p-3">
                <div className="flex items-center gap-2 rounded-full border border-white/12 bg-black/50 px-2.5 py-1.5">
                  <FileText className="h-3 w-3 shrink-0 text-white/35" />
                  <span className="flex-1 text-[9px] text-white/35 sm:text-[10px]">
                    Ask across 12 indexed policy documents…
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0a0a0a]">
                    <Send className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-3 left-6 right-6 h-8 rounded-full bg-black/40 blur-xl" />
      </div>

      <div className="absolute -left-3 top-1/3 hidden rounded-xl border border-border/60 bg-card px-2.5 py-2 shadow-lg sm:block">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          Cited
        </p>
        <p className="text-xs font-bold text-foreground">Sentence-level</p>
      </div>

      <div className="absolute -right-2 bottom-1/4 hidden rounded-xl border border-border/60 bg-card px-2.5 py-2 shadow-lg sm:block">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          Verified
        </p>
        <p className="text-xs font-bold text-foreground">91% confidence</p>
      </div>
    </div>
  );
}
