import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, FileText, Lock, Layers, Terminal } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { capabilities } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

const builtForItems = [
  "Legal ops teams",
  "Policy analysts",
  "Research desks",
  "Compliance reviewers",
  "Support operations",
  "Risk management",
  "Internal audit",
  "Knowledge management",
];

export function HomeScreen() {
  return (
    <main className="min-h-screen bg-background transition-colors duration-500 relative overflow-hidden">
      {/* ─── Nav ─── */}
      <header className="relative z-50 mx-auto w-full max-w-6xl px-6 pt-8">
        <div className="flex items-center justify-between">
          <BrandMark />
          <nav className="hidden items-center gap-8 text-[14px] text-muted-foreground md:flex">
            <Link href="#how-it-works" className="transition-colors hover:text-foreground">How it works</Link>
            <Link href="#features" className="transition-colors hover:text-foreground">Features</Link>
            <Link href="#modes" className="transition-colors hover:text-foreground">Execution modes</Link>
          </nav>
          <div className="flex items-center gap-5">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="rounded-lg">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — copy */}
          <div className="max-w-xl">
            <p className="text-[13px] font-semibold text-muted-foreground tracking-wide uppercase mb-6">
              Document-backed intelligence
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Stop guessing.<br />
              Start citing.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mb-10">
              Grounded connects your LLMs to your actual documents — every answer comes with sentence-level citations back to your source material.
            </p>

            <div className="flex items-center gap-5">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-7 text-[15px] rounded-lg shadow-sm">
                  Start building
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="#how-it-works" className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                See how it works
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right — product image */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Glow behind image */}
            <div className="absolute inset-0 bg-foreground/[0.03] rounded-[3rem] blur-[60px] scale-90 pointer-events-none" />
            <Image
              src="/hero-product.png"
              alt="Grounded product — document intelligence with citations"
              width={580}
              height={580}
              className="relative z-10 w-full max-w-[540px] h-auto drop-shadow-2xl rounded-2xl"
              priority
            />
          </div>
        </div>

        {/* Accent line — subtle geometric detail */}
        <div className="absolute top-20 right-0 w-px h-48 bg-gradient-to-b from-transparent via-border/60 to-transparent hidden lg:block" />
        <div className="absolute top-44 right-16 w-32 h-px bg-gradient-to-r from-border/60 to-transparent hidden lg:block" />
      </section>

      {/* ─── Social proof strip — scrolling marquee ─── */}
      <section className="relative z-10 border-y border-border/20 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center gap-10">
          <p className="text-[13px] text-muted-foreground/60 font-medium uppercase tracking-wider shrink-0">Built for</p>
          <div className="overflow-hidden flex-1 relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            {/* Scrolling content — duplicated for seamless loop */}
            <div className="animate-marquee flex items-center gap-8 whitespace-nowrap w-max">
              {[...builtForItems, ...builtForItems].map((item, i) => (
                <span key={`${item}-${i}`} className="flex items-center gap-3 text-[14px] font-medium text-muted-foreground/80">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/30 shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div>
            <p className="text-[12px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight mb-6">
              Three steps to<br />grounded answers
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-md">
              No fine-tuning. No prompt engineering. Upload your documents, create an agent, and start asking questions with full traceability.
            </p>
          </div>

          <div className="grid gap-0">
            {[
              {
                step: "01",
                title: "Upload your documents",
                desc: "PDF, DOCX, TXT — drag them into a dataset. We index, chunk, and track provenance automatically.",
              },
              {
                step: "02",
                title: "Configure an agent",
                desc: "Attach datasets, set a system prompt, choose an execution mode. Your agent is ready in seconds.",
              },
              {
                step: "03",
                title: "Get cited answers",
                desc: "Every response traces back to exact passages in your documents. Confidence scores and routing transparency included.",
              },
            ].map((item, i) => (
              <div key={item.step} className={`flex gap-6 py-7 ${i < 2 ? "border-b border-border/20" : ""}`}>
                <span className="text-[32px] font-bold text-border/50 dark:text-border/30 leading-none tabular-nums pt-1 shrink-0 w-12">{item.step}</span>
                <div>
                  <h3 className="text-[16px] font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features — staggered layout ─── */}
      <section id="features" className="relative z-10 border-t border-border/20">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <p className="text-[12px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-4">Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight mb-16 max-w-lg">
            Everything you need for reliable, auditable AI
          </h2>

          <div className="grid sm:grid-cols-2 gap-x-16 gap-y-14">
            {[
              {
                icon: FileText,
                title: "Sentence-level citations",
                desc: "Every claim maps to a specific passage in your source documents. Not summaries — actual quotes with document names and chunk indices.",
              },
              {
                icon: Lock,
                title: "Sensitivity & access policies",
                desc: "Label datasets as internal, confidential, or restricted. Control web fallback, model retrieval, and execution tiers per dataset.",
              },
              {
                icon: Layers,
                title: "Multi-dataset agents",
                desc: "Combine multiple document collections into one agent. Cross-reference policies, memos, and support playbooks in a single query.",
              },
              {
                icon: Terminal,
                title: "Full run transparency",
                desc: "Inspect confidence scores, routing decisions, provider fallbacks, and degraded-reason flags for every single run your agents make.",
              },
            ].map((feat) => (
              <div key={feat.title} className="group">
                <feat.icon className="h-5 w-5 text-foreground/50 mb-4" strokeWidth={1.5} />
                <h3 className="text-[16px] font-semibold text-foreground mb-2.5">{feat.title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Modes ─── */}
      <section id="modes" className="relative z-10 border-t border-border/20">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24 items-start">
            <div>
              <p className="text-[12px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-4">Execution</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight mb-6">
                Right mode,<br />right question
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed">
                Not every question needs the same level of reasoning. Choose between speed, depth, and assurance based on what the situation demands.
              </p>
            </div>

            <div className="grid gap-3">
              {capabilities.map((mode) => (
                <div
                  key={mode.mode}
                  className="flex items-center justify-between rounded-xl border border-border/25 bg-foreground/[0.015] p-5 transition-colors hover:bg-foreground/[0.03]"
                >
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">{mode.label}</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">{mode.description}</p>
                  </div>
                  <Badge
                    tone="success"
                    dot size="sm" className="ml-4 shrink-0"
                  >
                    Live
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-10 border-t border-border/20">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">Ready to ground your AI?</h2>
          <p className="text-[15px] text-muted-foreground mb-8 max-w-md mx-auto">
            Create a workspace, upload your first document, and get a cited answer in under five minutes.
          </p>
          <div className="flex items-center justify-center gap-5">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-7 text-[15px] rounded-lg">
                Start your workspace
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              or sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-border/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-10">
          <BrandMark size="sm" />
          <p className="text-[13px] text-muted-foreground/50">© 2026 Grounded AI</p>
        </div>
      </footer>
    </main>
  );
}
