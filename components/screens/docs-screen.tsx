"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Code2,
  Database,
  FileText,
  GitBranch,
  Layers,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Sidebar sections ─── */
const SECTIONS = [
  { id: "intro", label: "What is Grounded?" },
  { id: "concepts", label: "Core Concepts" },
  { id: "quickstart", label: "Quick Start" },
  { id: "modes", label: "Execution Modes" },
  { id: "pipeline", label: "Pipeline Architecture" },
  { id: "api", label: "Using the API" },
  { id: "trust", label: "Trust & Citations" },
  { id: "faq", label: "FAQ" },
];

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="-mt-20 pt-20" />;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-[22px] font-bold tracking-tight text-zinc-900 dark:text-white">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-6 text-[16px] font-bold text-zinc-800 dark:text-zinc-200">{children}</h3>;
}

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mb-4 text-[14px] leading-[1.75] text-zinc-600 dark:text-zinc-400", className)}>{children}</p>;
}

function InfoBox({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "amber" | "emerald" }) {
  const styles = {
    blue: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/40 dark:bg-blue-950/30 dark:text-blue-300",
    amber: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300",
  };
  return (
    <div className={cn("mb-6 rounded-xl border px-4 py-3.5 text-[13px] leading-relaxed", styles[tone])}>
      {children}
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[12px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{children}</code>;
}

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{lang}</span>
      </div>
      <pre className="overflow-x-auto bg-white p-4 text-[12px] leading-relaxed font-mono text-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

function StepCard({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[13px] font-bold text-white dark:bg-white dark:text-zinc-900">
        {step}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="mb-1 text-[15px] font-semibold text-zinc-900 dark:text-white">{title}</p>
        <div className="text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export function DocsScreen() {
  const [active, setActive] = useState("intro");

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      {/* Left nav */}
      <aside className="shrink-0">
        <div className="sticky top-20 space-y-0.5">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">On this page</p>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={() => setActive(s.id)}
              className={cn(
                "block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                active === s.id
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
              )}
            >
              {s.label}
            </a>
          ))}
        </div>
      </aside>

      {/* Content */}
      <div className="min-w-0 max-w-[760px]">
        {/* Header */}
        <div className="mb-10 border-b border-zinc-100 pb-8 dark:border-zinc-800">
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-zinc-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Documentation</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">User Guide</h1>
          <P className="mt-3 mb-0">
            Everything you need to build reliable, auditable AI applications on top of your own documents using Grounded.
          </P>
        </div>

        {/* ── What is Grounded? ── */}
        <SectionAnchor id="intro" />
        <H2>What is Grounded?</H2>
        <P>
          Grounded is an <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Enhanced Adaptive RAG (Retrieval-Augmented Generation) platform</strong> that connects AI agents directly to your documents. Every answer it produces is grounded in evidence retrieved from your files — not hallucinated from parametric memory.
        </P>
        <P>
          Unlike a generic LLM wrapper, Grounded runs a <strong className="font-semibold text-zinc-800 dark:text-zinc-200">multi-stage trust pipeline</strong>: it retrieves candidate passages using hybrid dense + sparse search, reranks them with a cross-encoder model, packages supporting evidence, generates a cited answer, and optionally runs an independent verification pass — all in one request.
        </P>
        <InfoBox tone="emerald">
          <strong>Key principle:</strong> Grounded never trains on your data. Your documents stay in your own dataset. Agents you build remain your intellectual property.
        </InfoBox>

        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Database, title: "Datasets", desc: "Your document knowledge base" },
            { icon: Bot, title: "Agents", desc: "Question-answering interface" },
            { icon: Shield, title: "Trust pipeline", desc: "Citations + verification" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <item.icon className="mb-2 h-5 w-5 text-zinc-500" />
              <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">{item.title}</p>
              <p className="text-[12px] text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Core Concepts ── */}
        <SectionAnchor id="concepts" />
        <H2>Core Concepts</H2>

        <H3><span className="flex items-center gap-2"><Database className="h-4 w-4" /> Datasets</span></H3>
        <P>
          A <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Dataset</strong> is a collection of documents that agents can search. You upload PDFs, DOCX, TXT, HTML, or image files. Grounded automatically chunks each file into overlapping text segments using a structure-aware chunking algorithm that respects headings, bullet points, and table structure.
        </P>
        <P>
          Each dataset has policy controls: <Code>sensitivity_level</Code> (public / internal / confidential / restricted), <Code>min_execution_tier</Code> (minimum pipeline depth required to query it), and <Code>allow_web_fallback</Code> (whether the agent can fall back to web search when documents have no answer).
        </P>

        <H3><span className="flex items-center gap-2"><Bot className="h-4 w-4" /> Agents</span></H3>
        <P>
          An <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Agent</strong> is your configured question-answering interface. You attach one or more datasets, set a system prompt, and choose a default execution mode. Users then chat with the agent — it searches the attached datasets and returns a grounded, cited answer.
        </P>

        <H3><span className="flex items-center gap-2"><Activity className="h-4 w-4" /> Runs</span></H3>
        <P>
          Every query produces a <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Run</strong> — a full trace of the pipeline execution: the query, the retrieved chunks, the generated answer, citation details, confidence score, latency per stage, routing reason, and provider info. Runs are stored permanently and are the basis for your audit trail.
        </P>

        <H3><span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Citations</span></H3>
        <P>
          Every answer includes <strong className="font-semibold text-zinc-800 dark:text-zinc-200">sentence-level citations</strong> — quoted passages from your source documents with the chunk index and document ID. The UI renders these as clickable <Code>[1]</Code> <Code>[2]</Code> superscripts in the answer text.
        </P>

        {/* ── Quick Start ── */}
        <SectionAnchor id="quickstart" />
        <H2>Quick Start</H2>
        <P>Get a cited answer from your documents in four steps.</P>

        <StepCard step="1" title="Create an API key">
          Go to <strong>Developer → API Keys</strong> and click <strong>+ Create key</strong>. Give it a label (e.g. "My project"). Copy the raw key — it is shown only once.
        </StepCard>

        <StepCard step="2" title="Create a dataset and upload a document">
          Go to <strong>Workspace → Datasets</strong>, click <strong>+ Create</strong>, fill in a name and domain. Open the dataset and drag your PDF or DOCX into the upload zone. Wait for status to show <Code>Indexed</Code>.
        </StepCard>

        <StepCard step="3" title="Create an agent and attach the dataset">
          Go to <strong>Workspace → Agents</strong>, click <strong>+ Create</strong>. Select your dataset. Choose a default mode (start with <strong>Auto</strong>). Click <strong>Create and attach</strong>.
        </StepCard>

        <StepCard step="4" title="Start chatting">
          Open the agent. Type a question. You will see the pipeline steps stream in real time, followed by a cited answer with a confidence score. Click any citation number to read the source passage.
        </StepCard>

        <InfoBox tone="blue">
          You can also query programmatically. See <strong>Using the API</strong> below.
        </InfoBox>

        {/* ── Execution Modes ── */}
        <SectionAnchor id="modes" />
        <H2>Execution Modes</H2>
        <P>
          Modes control how deeply the pipeline retrieves and verifies. You can switch modes per conversation turn — the agent adapts automatically.
        </P>

        <div className="mb-6 grid gap-3">
          {[
            {
              icon: Bot, mode: "Auto", color: "text-zinc-600",
              steps: "Analyze → Route → Retrieve → Generate",
              desc: "Smart routing selects the best mode per query. Use this as the default.",
            },
            {
              icon: Zap, mode: "Instant", color: "text-amber-600",
              steps: "Analyze → Hybrid Retrieve → Generate",
              desc: "Fast standard retrieval. Best for simple factual questions where speed matters.",
            },
            {
              icon: Sparkles, mode: "Thinking", color: "text-blue-600",
              steps: "Analyze → Deep Retrieve ×24 → Rerank → Generate",
              desc: "Enterprise-tier: fetches 24 candidates, cross-encoder reranks them, then generates. Best for complex multi-part questions.",
            },
            {
              icon: Shield, mode: "Verified", color: "text-emerald-600",
              steps: "Analyze → Deep Retrieve → Rerank → Generate → Independent Verify",
              desc: "Critical-tier: adds an independent verification pass after generation. Every claim is checked against retrieved evidence. Use for high-stakes answers.",
            },
          ].map((m) => (
            <div key={m.mode} className="rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className={cn("h-4 w-4", m.color)} />
                <span className="text-[14px] font-bold text-zinc-900 dark:text-white">{m.mode}</span>
                <span className="ml-auto font-mono text-[11px] text-zinc-400">{m.steps}</span>
              </div>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Pipeline Architecture ── */}
        <SectionAnchor id="pipeline" />
        <H2>Pipeline Architecture</H2>
        <P>
          Grounded implements an <strong className="font-semibold text-zinc-800 dark:text-zinc-200">Enhanced Advanced Adaptive RAG pipeline</strong> — a CRAG-inspired (Corrective RAG) system with multi-attempt retrieval correction.
        </P>

        <H3>1. Query Analysis</H3>
        <P>
          The query is first analysed to determine: is this a smalltalk query that needs no retrieval? Does it require document search? What is the conversation context from prior messages? This step produces a <em>query plan</em> that guides the rest of the pipeline.
        </P>

        <H3>2. Hybrid Retrieval</H3>
        <P>
          Grounded runs <strong className="font-semibold text-zinc-800 dark:text-zinc-200">dense + sparse retrieval in parallel</strong>. Dense retrieval uses Gemini embeddings (128-dim) stored in Qdrant. Sparse retrieval uses BM25-style keyword matching. Results are fused using Reciprocal Rank Fusion (RRF) with a smoothing constant of 60.
        </P>

        <H3>3. Reranking (Thinking + Verified)</H3>
        <P>
          When using Thinking or Verified mode, a Gemini-powered cross-encoder reranker scores each candidate chunk against the query. The top-ranked chunks are selected as evidence. This significantly improves precision for complex queries.
        </P>

        <H3>4. Evidence Packaging</H3>
        <P>
          Selected chunks are packaged with their source metadata (document ID, chunk index, section title). The evidence package is sent to the generator along with the system prompt and conversation history.
        </P>

        <H3>5. Generation</H3>
        <P>
          Gemini generates an answer strictly grounded in the evidence. The system prompt instructs it to cite sources using numbered references. If the evidence is insufficient, the pipeline returns a degraded response with a clear reason (e.g. <Code>NO_GROUNDED_EVIDENCE</Code>).
        </P>

        <H3>6. Verification (Verified mode only)</H3>
        <P>
          An independent verification pass re-reads the generated answer and cross-checks each claim against the retrieved evidence. This produces a <Code>verification_status</Code> of <Code>passed</Code> or <Code>degraded</Code>.
        </P>

        <div className="mb-6 rounded-xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-zinc-400">Full pipeline flow (Verified mode)</p>
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-mono">
            {["Query Analysis", "→", "Hybrid Retrieve", "→", "RRF Fusion", "→", "Rerank ×24", "→", "Package Evidence", "→", "Generate", "→", "Verify"].map((step, i) => (
              <span key={i} className={step === "→" ? "text-zinc-300 dark:text-zinc-600" : "rounded-md bg-white px-2 py-1 text-zinc-700 shadow-sm border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* ── Using the API ── */}
        <SectionAnchor id="api" />
        <H2>Using the API</H2>
        <P>
          Grounded exposes a REST API at <Code>http://51.20.18.111:8000</Code>. All endpoints require an <Code>X-API-Key</Code> header. Get your key from <strong>Developer → API Keys</strong>.
        </P>

        <H3>Authentication</H3>
        <CodeBlock lang="bash" code={`# Every request needs this header\ncurl https://localhost:8000/v1/datasets \\\n  -H "X-API-Key: key-XXXXXXXXXX"`} />

        <H3>Upload a document and poll for indexing</H3>
        <CodeBlock lang="bash" code={`# 1. Upload\ncurl -X POST https://localhost:8000/v1/datasets/DATASET_ID/upload \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -F "file=@policy-handbook.pdf"\n\n# 2. Poll job status until status = "indexed"\ncurl https://localhost:8000/v1/datasets/DATASET_ID/ingestion-jobs \\\n  -H "X-API-Key: YOUR_KEY"`} />

        <H3>Stream a grounded answer</H3>
        <CodeBlock lang="bash" code={`curl -X POST https://localhost:8000/v1/agents/AGENT_ID/chat/stream \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -H "Accept: text/event-stream" \\\n  -d '{\n    "conversation_id": "CONV_ID",\n    "message": "What is the data retention period?",\n    "mode": "thinking"\n  }'`} />

        <P>The stream returns SSE events:</P>
        <CodeBlock lang="sse" code={`data: {"type":"step_started","step":"check_retrieval","label":"Analyze Query"}\ndata: {"type":"step_completed","step":"research","duration_ms":1240,"evidence_count":5}\ndata: {"type":"answer","data":{"answer":"...","citations":[...],"confidence_score":0.92,"verification_status":"passed"}}`} />

        <InfoBox tone="blue">
          See <strong>Developer → API Reference</strong> for the full list of endpoints with interactive examples.
        </InfoBox>

        {/* ── Trust & Citations ── */}
        <SectionAnchor id="trust" />
        <H2>Trust & Citations</H2>
        <P>
          Every run includes a full trust report:
        </P>
        <div className="mb-6 grid gap-2">
          {[
            { icon: CheckCircle2, label: "Confidence score", desc: "0–1 score. High (>0.8) = strong evidence support. Low (<0.5) = weak or missing support." },
            { icon: FileText, label: "Citations", desc: "Quoted passages from your documents with document ID and chunk index. Clickable in the chat UI." },
            { icon: Shield, label: "Verification status", desc: "passed = every claim verified. degraded = one or more claims not supported by evidence." },
            { icon: GitBranch, label: "Routing reason", desc: "Why the pipeline chose this tier and mode. Shown in the Query Journey panel." },
            { icon: Layers, label: "Degraded reasons", desc: "Codes like NO_GROUNDED_EVIDENCE or INSUFFICIENT_SUPPORT explain why confidence is low." },
          ].map((item) => (
            <div key={item.label} className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <div>
                <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</p>
                <p className="text-[12px] text-zinc-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FAQ ── */}
        <SectionAnchor id="faq" />
        <H2>FAQ</H2>

        {[
          {
            q: "What file formats are supported?",
            a: "PDF, DOCX, TXT, HTML, PPTX, PNG, JPG, JPEG. Maximum 300 MB per file and 2,000 pages per file.",
          },
          {
            q: "What is an API key?",
            a: "An API key is a secret credential that authenticates your requests to the Grounded backend. It is sent in the X-API-Key header. You create and revoke keys from Developer → API Keys. Never share your key — treat it like a password.",
          },
          {
            q: "What does 'Indexed' status mean?",
            a: "The document has been fully processed: extracted to text, split into chunks, embedded into the vector store (Qdrant), and indexed for sparse retrieval. Once indexed, agents can search it.",
          },
          {
            q: "Can an agent search multiple datasets?",
            a: "Yes. Attach multiple datasets to one agent. When querying, specify which dataset to search in the request (dataset_id parameter) or configure a default.",
          },
          {
            q: "What happens if the document has no answer?",
            a: "The pipeline returns a degraded response with reason NO_GROUNDED_EVIDENCE and a low confidence score. The agent does not hallucinate an answer from general knowledge.",
          },
          {
            q: "What is the difference between Thinking and Verified mode?",
            a: "Thinking fetches 24 candidates and reranks them — better evidence quality. Verified does everything Thinking does, then adds an independent verification pass that checks each claim in the generated answer against the retrieved evidence.",
          },
          {
            q: "How do I integrate Grounded into my own app?",
            a: "Use the REST API. Create an API key, create a dataset, upload documents, create an agent, then call POST /v1/agents/{id}/chat/stream with your user's question. Parse the SSE stream for step events and the final answer event.",
          },
        ].map((item) => (
          <div key={item.q} className="mb-4 rounded-xl border border-zinc-100 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-1.5 text-[14px] font-bold text-zinc-900 dark:text-white">{item.q}</p>
            <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">{item.a}</p>
          </div>
        ))}

        {/* Footer CTA */}
        <div className="mt-10 rounded-2xl border border-zinc-100 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-1 text-[15px] font-bold text-zinc-900 dark:text-white">Ready to integrate?</p>
          <p className="mb-4 text-[13px] text-zinc-500">Check the full API reference for every endpoint with curl examples and response schemas.</p>
          <a href="#" className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
            <Code2 className="h-3.5 w-3.5" />
            API Reference
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

