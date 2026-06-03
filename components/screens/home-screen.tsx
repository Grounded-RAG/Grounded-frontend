"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  FileText,
  GitBranch,
  Lock,
  Layers,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─── Interactive product demo ─── */
function HeroVisual() {
  const [activeEvidence, setActiveEvidence] = useState<number | null>(null);

  return (
    <div className="relative w-full max-w-[520px] mx-auto lg:mx-0 lg:ml-auto select-none">
      {/* Soft glow behind card */}
      <div className="pointer-events-none absolute -inset-10 rounded-[4rem] bg-gradient-to-br from-blue-500/[0.07] via-transparent to-emerald-500/[0.05] blur-3xl dark:from-blue-500/10 dark:to-emerald-500/8" />

      {/* Main chat card */}
      <div className="relative rounded-[2rem] border border-black/[0.08] bg-white shadow-[0_8px_60px_rgba(0,0,0,0.12)] dark:border-white/[0.08] dark:bg-zinc-900 dark:shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-3.5 dark:border-white/[0.06]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Bot className="h-3.5 w-3.5 text-zinc-500" />
          </div>
          <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">Policy Analyst</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-zinc-400">Grounded</span>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-[1.25rem] rounded-tr-sm bg-zinc-900 px-4 py-3 dark:bg-zinc-100">
              <p className="text-[13px] leading-relaxed text-white dark:text-zinc-900">
                What are the key data retention requirements in our compliance policy?
              </p>
            </div>
          </div>

          {/* Evidence pill */}
          <button className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-600 transition-colors dark:hover:text-zinc-300">
            <FileText className="h-3 w-3" />
            Retrieved 3 pieces of evidence
            <ChevronRight className="h-3 w-3" />
          </button>

          {/* AI answer with inline citations */}
          <div className="rounded-[1.25rem] rounded-tl-sm border border-black/[0.06] bg-zinc-50/80 px-4 py-4 dark:border-white/[0.06] dark:bg-zinc-800/60">
            <p className="text-[13px] leading-[1.75] text-zinc-700 dark:text-zinc-300">
              The compliance policy requires all customer data to be retained for a minimum of{" "}
              <button
                onClick={() => setActiveEvidence(activeEvidence === 1 ? null : 1)}
                className={cn(
                  "inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold transition-all",
                  activeEvidence === 1
                    ? "bg-blue-600 text-white scale-110"
                    : "bg-zinc-200 text-zinc-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-zinc-700 dark:text-zinc-300",
                )}
              >1</button>{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">7 years</strong>, with financial records subject to a{" "}
              <button
                onClick={() => setActiveEvidence(activeEvidence === 2 ? null : 2)}
                className={cn(
                  "inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold transition-all",
                  activeEvidence === 2
                    ? "bg-blue-600 text-white scale-110"
                    : "bg-zinc-200 text-zinc-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-zinc-700 dark:text-zinc-300",
                )}
              >2</button>{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">10-year retention window</strong> under Section 4.2.
              Deletion must be documented and approved by the Data Governance team.{" "}
              <button
                onClick={() => setActiveEvidence(activeEvidence === 3 ? null : 3)}
                className={cn(
                  "inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold transition-all",
                  activeEvidence === 3
                    ? "bg-blue-600 text-white scale-110"
                    : "bg-zinc-200 text-zinc-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-zinc-700 dark:text-zinc-300",
                )}
              >3</button>
            </p>

            {activeEvidence !== null && (
              <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 dark:border-blue-800/50 dark:bg-blue-950/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                  Source {activeEvidence} · compliance-policy-v4.pdf
                </p>
                <p className="text-[12px] text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                  {activeEvidence === 1
                    ? "\"All customer records must be retained for no less than 7 calendar years from date of creation.\""
                    : activeEvidence === 2
                    ? "\"Financial records are subject to a 10-year retention period per Section 4.2 regulatory requirements.\""
                    : "\"Deletion within the retention period requires written approval from the Data Governance Officer.\""}
                </p>
              </div>
            )}
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              94% Confidence
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-zinc-50 px-3 py-1.5 text-[11px] font-medium text-zinc-500 dark:border-white/[0.08] dark:bg-zinc-800">
              <FileText className="h-3 w-3" />
              3 Citations
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-zinc-50 px-3 py-1.5 text-[11px] font-medium text-zinc-500 dark:border-white/[0.08] dark:bg-zinc-800">
              <GitBranch className="h-3 w-3" />
              Journey
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t border-black/[0.06] px-4 py-3 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-zinc-50 px-4 py-2.5 dark:border-white/[0.08] dark:bg-zinc-800">
            <span className="flex-1 text-[12px] text-zinc-400">Ask a question…</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100">
              <ArrowRight className="h-3.5 w-3.5 text-white dark:text-zinc-900" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating mode badge */}
      <div className="absolute -top-3 -right-3 flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 shadow-lg dark:border-white/[0.08] dark:bg-zinc-900">
        <Zap className="h-3 w-3 text-amber-500" />
        <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">Thinking mode</span>
      </div>

      {/* Floating source chip */}
      <div className="absolute -bottom-4 -left-2 flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 py-2.5 shadow-lg dark:border-white/[0.08] dark:bg-zinc-900">
        <Shield className="h-4 w-4 text-emerald-500" />
        <div>
          <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">Verified · Grounded</p>
          <p className="text-[10px] text-zinc-400 leading-tight">compliance-policy-v4.pdf</p>
        </div>
      </div>
    </div>
  );
}

const MODES = [
  { label: "Instant", icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40", desc: "Fast answers with full citations." },
  { label: "Thinking", icon: Sparkles, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40", desc: "Deeper retrieval with reranking." },
  { label: "Verified", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", desc: "Every claim independently verified." },
  { label: "Auto", icon: Bot, color: "text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-800", desc: "Smart routing per query." },
];

const FEATURES = [
  { icon: FileText, title: "Sentence-level citations", desc: "Every claim maps to an exact passage. Not summaries — quoted evidence with document name, chunk index, and page number." },
  { icon: Lock, title: "Sensitivity & access policies", desc: "Mark datasets as internal, confidential, or restricted. Control web fallback, model retrieval, and minimum execution tier." },
  { icon: Layers, title: "Multi-dataset agents", desc: "Combine multiple document collections into one agent. Cross-reference policies, memos, and playbooks in a single query." },
  { icon: Terminal, title: "Full pipeline transparency", desc: "Inspect confidence scores, routing decisions, provider fallbacks, latency per stage, and degraded reasons for every run." },
  { icon: GitBranch, title: "Adaptive retrieval", desc: "Hybrid dense + sparse search with cross-encoder reranking. Retrieval depth scales with query complexity automatically." },
  { icon: Shield, title: "Verification & trust scoring", desc: "Critical-tier queries get an independent verification pass. Confidence labels and support summaries on every response." },
];

export function HomeScreen() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 overflow-hidden">

      {/* ─── Nav ─── */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl dark:border-white/[0.06] dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandMark />
          <nav className="hidden items-center gap-8 md:flex">
            {["How it works", "Execution modes", "Features"].map((label) => (
              <Link
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-[14px] font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden text-[14px] font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:block"
            >
              Sign in
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
                Get started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          {/* Left */}
          <div className="max-w-lg">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-semibold text-zinc-600 dark:text-zinc-300">
                Adaptive RAG · Citations · Trust pipeline
              </span>
            </div>

            <h1 className="mb-6 text-[2.8rem] font-bold tracking-[-0.04em] text-zinc-900 sm:text-[3.4rem] md:text-[4rem] dark:text-white" style={{ lineHeight: 1.05 }}>
              Every answer,<br />
              traced to its<br />
              source.
            </h1>

            <p className="mb-10 max-w-[400px] text-[17px] leading-[1.7] text-zinc-500 dark:text-zinc-400">
              Grounded connects your agents to your documents — every response carries sentence-level citations back to the exact passage it came from.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-zinc-900 px-8 text-[15px] font-semibold text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:shadow-white/10 dark:hover:bg-zinc-200"
                >
                  Start building free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link
                href="/login"
                className="text-[14px] font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Sign in →
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { icon: Lock, text: "No training on your data" },
                { icon: Shield, text: "Sentence-level citations" },
                { icon: GitBranch, text: "Full pipeline transparency" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-[12px] font-medium text-zinc-400">
                  <item.icon className="h-3.5 w-3.5 text-zinc-400" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — interactive demo */}
          <div className="relative flex justify-center pt-8 pb-8 pr-4 pl-4 lg:justify-end lg:pt-4">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* ─── Marquee ─── */}
      <div className="border-y border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center gap-8">
            <p className="shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Built for</p>
            <div className="relative flex-1 overflow-hidden">
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-50 to-transparent z-10 dark:from-zinc-900" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-50 to-transparent z-10 dark:from-zinc-900" />
              <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
                {[
                  "Legal ops", "Policy analysts", "Research desks", "Compliance teams",
                  "Support ops", "Risk management", "Internal audit", "Knowledge management",
                  "Legal ops", "Policy analysts", "Research desks", "Compliance teams",
                  "Support ops", "Risk management", "Internal audit", "Knowledge management",
                ].map((item, i) => (
                  <span key={i} className="flex items-center gap-3 text-[13px] font-medium text-zinc-400">
                    <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400">How it works</p>
        <h2 className="mb-16 text-[2.2rem] font-bold tracking-[-0.03em] text-zinc-900 dark:text-white sm:text-[2.6rem]">
          From document to cited<br />answer in three steps
        </h2>

        <div className="grid gap-px bg-zinc-200 rounded-2xl overflow-hidden border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-800 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Upload your documents",
              desc: "Drag in PDFs, DOCX, or plain text. Grounded chunks, embeds, and indexes everything — dense and sparse — automatically.",
            },
            {
              step: "02",
              title: "Configure an agent",
              desc: "Attach one or more datasets, set system instructions, and choose an execution mode. Ready in seconds.",
            },
            {
              step: "03",
              title: "Get cited answers",
              desc: "Every response includes sentence-level citations, a confidence score, and full routing transparency. Nothing is fabricated.",
            },
          ].map((item) => (
            <div key={item.step} className="bg-white p-8 dark:bg-zinc-950">
              <span className="mb-6 block text-[3rem] font-black tracking-[-0.04em] text-zinc-900 dark:text-white leading-none">
                {item.step}
              </span>
              <h3 className="mb-3 text-[16px] font-bold text-zinc-900 dark:text-white">{item.title}</h3>
              <p className="text-[14px] leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Execution Modes ─── */}
      <section id="execution-modes" className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.35fr] lg:gap-24">
            <div className="lg:sticky lg:top-32">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400">Execution modes</p>
              <h2 className="mb-5 text-[2.2rem] font-bold tracking-[-0.03em] text-zinc-900 dark:text-white leading-tight">
                Match the depth<br />to the question
              </h2>
              <p className="text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                Switch modes mid-conversation. Grounded automatically adjusts retrieval depth, reranking, and verification to match.
              </p>
            </div>

            <div className="grid gap-3">
              {MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <div
                    key={mode.label}
                    className="group flex items-center gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-5 transition-all hover:border-zinc-200 hover:bg-white hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", mode.bg)}>
                      <Icon className={cn("h-5 w-5", mode.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[15px] font-bold text-zinc-900 dark:text-white">{mode.label}</p>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          Live
                        </span>
                      </div>
                      <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">{mode.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400">Capabilities</p>
          <h2 className="mb-16 text-[2.2rem] font-bold tracking-[-0.03em] text-zinc-900 dark:text-white sm:text-[2.6rem]">
            Everything you need for<br />reliable, auditable AI
          </h2>

          <div className="grid gap-x-16 gap-y-12 sm:grid-cols-2">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="flex gap-5">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                  <feat.icon className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="mb-2 text-[15px] font-bold text-zinc-900 dark:text-white">{feat.title}</h3>
                  <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="rounded-[2.5rem] bg-zinc-900 px-8 py-20 text-center dark:bg-white">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              Get started today
            </p>
            <h2 className="mb-4 text-[2.2rem] font-bold tracking-[-0.03em] text-white dark:text-zinc-900 sm:text-[2.6rem]">
              Ready to ground your AI?
            </h2>
            <p className="mx-auto mb-10 max-w-sm text-[16px] leading-relaxed text-zinc-400 dark:text-zinc-500">
              Create a workspace, upload your first document, and get a cited answer in under five minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-white px-8 text-[15px] font-bold text-zinc-900 shadow-lg hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                >
                  Start your workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link
                href="/login"
                className="text-[14px] font-semibold text-zinc-400 transition-colors hover:text-white dark:text-zinc-500 dark:hover:text-zinc-900"
              >
                or sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <BrandMark size="sm" />
          <p className="text-[12px] text-zinc-400">
            © 2026 Grounded AI · Built on evidence, not assumptions.
          </p>
        </div>
      </footer>
    </main>
  );
}
