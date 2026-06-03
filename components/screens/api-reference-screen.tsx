"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Data ─── */
type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface Endpoint {
  method: Method;
  path: string;
  summary: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: { name: string; type: string; required: boolean; description: string }[];
  response: string;
  curl: string;
}

interface EndpointGroup {
  tag: string;
  prefix: string;
  endpoints: Endpoint[];
}

const API_GROUPS: EndpointGroup[] = [
  {
    tag: "/datasets",
    prefix: "/v1/datasets",
    endpoints: [
      {
        method: "GET", path: "/v1/datasets", summary: "List Datasets",
        description: "Return all datasets owned by the authenticated tenant, optionally scoped to a workspace.",
        params: [{ name: "workspace_id", type: "uuid", required: false, description: "Filter by workspace" }],
        response: `[\n  {\n    "dataset_id": "a43c343d-...",\n    "name": "Policy Docs",\n    "domain": "legal",\n    "sensitivity_level": "internal",\n    "created_at": "2026-03-24T10:00:00Z"\n  }\n]`,
        curl: `curl https://localhost:8000/v1/datasets \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "POST", path: "/v1/datasets", summary: "Create Dataset",
        description: "Create a new dataset. Datasets are the knowledge containers that agents search.",
        body: [
          { name: "workspace_id", type: "uuid", required: true, description: "Workspace to create the dataset in" },
          { name: "name", type: "string", required: true, description: "Display name for this dataset" },
          { name: "domain", type: "string", required: false, description: "Domain hint for query analysis (e.g. legal, medical)" },
          { name: "sensitivity_level", type: "public|internal|confidential|restricted", required: false, description: "Access control tier" },
          { name: "min_execution_tier", type: "standard|enterprise|critical", required: false, description: "Minimum pipeline tier for this dataset" },
          { name: "allow_web_fallback", type: "boolean", required: false, description: "Allow web search when document evidence is insufficient" },
        ],
        response: `{\n  "dataset_id": "a43c343d-...",\n  "name": "Policy Docs",\n  "domain": "legal",\n  "created_at": "2026-06-01T10:00:00Z"\n}`,
        curl: `curl -X POST https://localhost:8000/v1/datasets \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"workspace_id":"ws-id","name":"My Dataset","domain":"legal"}'`,
      },
      {
        method: "GET", path: "/v1/datasets/{dataset_id}", summary: "Get Dataset",
        description: "Retrieve a single dataset by ID.",
        params: [{ name: "dataset_id", type: "uuid", required: true, description: "ID of the dataset" }],
        response: `{\n  "dataset_id": "a43c343d-...",\n  "name": "Policy Docs",\n  "sensitivity_level": "internal",\n  "freshness_profile": "balanced",\n  "allow_web_fallback": false\n}`,
        curl: `curl https://localhost:8000/v1/datasets/a43c343d-... \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
  {
    tag: "/datasets/{id}/documents",
    prefix: "/v1/datasets/{id}/documents",
    endpoints: [
      {
        method: "POST", path: "/v1/datasets/{dataset_id}/upload", summary: "Upload Document",
        description: "Upload a file to a dataset. Supported formats: PDF, DOCX, TXT, HTML, PPTX, PNG, JPG. Max 300 MB. The document is automatically chunked, embedded, and indexed.",
        params: [{ name: "dataset_id", type: "uuid", required: true, description: "Target dataset" }],
        body: [
          { name: "file", type: "multipart/form-data", required: true, description: "The file to upload" },
          { name: "title", type: "string", required: false, description: "Optional display title for the document" },
        ],
        response: `{\n  "document_id": "19c4d941-...",\n  "job_id": "job-xyz",\n  "document_status": "uploaded",\n  "job_status": "queued"\n}`,
        curl: `curl -X POST https://localhost:8000/v1/datasets/DATASET_ID/upload \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -F "file=@/path/to/document.pdf" \\\n  -F "title=My Document"`,
      },
      {
        method: "GET", path: "/v1/datasets/{dataset_id}/documents", summary: "List Documents",
        description: "List all documents in a dataset with their status (uploaded, processing, indexed, failed).",
        params: [{ name: "dataset_id", type: "uuid", required: true, description: "Target dataset" }],
        response: `[\n  {\n    "document_id": "19c4d941-...",\n    "title": "Policy Handbook",\n    "status": "indexed",\n    "file_size_bytes": 122880,\n    "mime_type": "application/pdf"\n  }\n]`,
        curl: `curl https://localhost:8000/v1/datasets/DATASET_ID/documents \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "GET", path: "/v1/datasets/{dataset_id}/ingestion-jobs", summary: "List Ingestion Jobs",
        description: "Get the status of all ingestion jobs for a dataset. Poll this endpoint to track indexing progress.",
        params: [{ name: "dataset_id", type: "uuid", required: true, description: "Target dataset" }],
        response: `[\n  {\n    "job_id": "job-xyz",\n    "status": "indexed",\n    "attempt_count": 1,\n    "started_at": "2026-06-01T10:01:00Z",\n    "completed_at": "2026-06-01T10:01:45Z"\n  }\n]`,
        curl: `curl https://localhost:8000/v1/datasets/DATASET_ID/ingestion-jobs \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
  {
    tag: "/agents",
    prefix: "/v1/agents",
    endpoints: [
      {
        method: "GET", path: "/v1/agents", summary: "List Agents",
        description: "Return all agents for the authenticated tenant.",
        params: [{ name: "workspace_id", type: "uuid", required: false, description: "Filter by workspace" }],
        response: `[\n  {\n    "agent_id": "2078ce3e-...",\n    "name": "Policy Analyst",\n    "default_mode": "auto",\n    "status": "active",\n    "dataset_ids": ["a43c343d-..."]\n  }\n]`,
        curl: `curl https://localhost:8000/v1/agents \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "POST", path: "/v1/agents", summary: "Create Agent",
        description: "Create a grounded agent. Agents are the question-answering interface to your datasets.",
        body: [
          { name: "workspace_id", type: "uuid", required: true, description: "Workspace for the agent" },
          { name: "name", type: "string", required: true, description: "Agent display name" },
          { name: "system_instructions", type: "string", required: false, description: "System prompt to guide agent behaviour" },
          { name: "default_mode", type: "auto|instant|thinking|verified", required: false, description: "Default execution mode" },
          { name: "allowed_modes", type: "string[]", required: false, description: "Modes users can select (default: all)" },
        ],
        response: `{\n  "agent_id": "2078ce3e-...",\n  "name": "Policy Analyst",\n  "default_mode": "auto",\n  "status": "active"\n}`,
        curl: `curl -X POST https://localhost:8000/v1/agents \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"workspace_id":"ws-id","name":"Policy Analyst","default_mode":"thinking"}'`,
      },
      {
        method: "PATCH", path: "/v1/agents/{agent_id}", summary: "Update Agent",
        description: "Update agent name, instructions, default mode, or allowed modes.",
        params: [{ name: "agent_id", type: "uuid", required: true, description: "Agent to update" }],
        body: [
          { name: "name", type: "string", required: false, description: "New display name" },
          { name: "system_instructions", type: "string", required: false, description: "Updated system prompt" },
          { name: "default_mode", type: "string", required: false, description: "New default mode" },
        ],
        response: `{ "agent_id": "...", "name": "Updated Name", "default_mode": "thinking" }`,
        curl: `curl -X PATCH https://localhost:8000/v1/agents/AGENT_ID \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"default_mode":"verified"}'`,
      },
      {
        method: "POST", path: "/v1/agents/{agent_id}/datasets", summary: "Attach Dataset",
        description: "Connect a dataset to an agent so it can search it during queries.",
        params: [{ name: "agent_id", type: "uuid", required: true, description: "Agent to attach to" }],
        body: [{ name: "dataset_id", type: "uuid", required: true, description: "Dataset to attach" }],
        response: `{ "agent_id": "...", "dataset_ids": ["a43c343d-..."] }`,
        curl: `curl -X POST https://localhost:8000/v1/agents/AGENT_ID/datasets \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"dataset_id":"DATASET_ID"}'`,
      },
    ],
  },
  {
    tag: "/agents/{id}/chat",
    prefix: "/v1/agents/{id}/chat",
    endpoints: [
      {
        method: "POST", path: "/v1/agents/{agent_id}/chat/stream", summary: "Stream Agent Chat (SSE)",
        description: "Send a message to an agent and receive a grounded, cited answer as a Server-Sent Events (SSE) stream. Each event reports a pipeline step (step_started, step_completed) followed by the final answer event. This is the primary endpoint for the chat UI.",
        params: [{ name: "agent_id", type: "uuid", required: true, description: "Agent to query" }],
        body: [
          { name: "conversation_id", type: "uuid", required: true, description: "Conversation thread ID" },
          { name: "message", type: "string", required: true, description: "User question" },
          { name: "mode", type: "auto|instant|thinking|verified", required: false, description: "Override execution mode for this turn" },
          { name: "dataset_id", type: "uuid", required: false, description: "Dataset to search (required if agent has multiple)" },
        ],
        response: `data: {"type":"step_started","step":"check_retrieval","label":"Analyze Query"}\ndata: {"type":"step_completed","step":"research","duration_ms":1240,"evidence_count":5}\ndata: {"type":"answer","data":{"answer":"...","citations":[...],"confidence_score":0.92}}`,
        curl: `curl -X POST https://localhost:8000/v1/agents/AGENT_ID/chat/stream \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -H "Accept: text/event-stream" \\\n  -d '{"conversation_id":"CONV_ID","message":"What is the data retention policy?","mode":"thinking"}'`,
      },
      {
        method: "POST", path: "/v1/agents/{agent_id}/conversations", summary: "Create Conversation",
        description: "Create a new conversation thread for an agent. Pass the returned conversation_id in subsequent chat requests.",
        params: [{ name: "agent_id", type: "uuid", required: true, description: "Agent for the conversation" }],
        body: [
          { name: "title", type: "string", required: false, description: "Conversation title (auto-generated from first message if omitted)" },
          { name: "mode", type: "string", required: false, description: "Default mode for this conversation" },
        ],
        response: `{\n  "conversation_id": "dce74302-...",\n  "agent_id": "2078ce3e-...",\n  "title": "New conversation",\n  "last_used_mode": "auto"\n}`,
        curl: `curl -X POST https://localhost:8000/v1/agents/AGENT_ID/conversations \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"title":"My first conversation","mode":"thinking"}'`,
      },
    ],
  },
  {
    tag: "/runs",
    prefix: "/v1/runs",
    endpoints: [
      {
        method: "GET", path: "/v1/runs", summary: "List Runs",
        description: "Return run history. Each run is a completed query with full trace data — answer, citations, confidence, latency, routing reason.",
        params: [
          { name: "limit", type: "integer", required: false, description: "Max results (default 50, max 200)" },
          { name: "dataset_id", type: "uuid", required: false, description: "Filter to a specific dataset" },
        ],
        response: `[\n  {\n    "run_id": "...",\n    "query": "What is the retention policy?",\n    "answer": "Customer data must be retained for 7 years...",\n    "confidence_score": 0.92,\n    "citations": [...],\n    "effective_tier": "enterprise",\n    "total_latency_ms": 2140\n  }\n]`,
        curl: `curl "https://localhost:8000/v1/runs?limit=20" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "PATCH", path: "/v1/runs/{run_id}/feedback", summary: "Submit Feedback",
        description: "Rate a run as positive or negative. Feedback is used for monitoring and quality analysis.",
        params: [{ name: "run_id", type: "uuid", required: true, description: "Run to rate" }],
        body: [
          { name: "rating", type: "positive|negative", required: true, description: "Quality rating" },
          { name: "reasons", type: "string[]", required: false, description: "Reason codes (HALLUCINATION, WRONG_CITATIONS, etc.)" },
          { name: "freeform_text", type: "string", required: false, description: "Optional written feedback" },
        ],
        response: `{ "run_id": "...", "feedback_rating": "positive" }`,
        curl: `curl -X PATCH https://localhost:8000/v1/runs/RUN_ID/feedback \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"rating":"positive","reasons":[],"freeform_text":null}'`,
      },
    ],
  },
  {
    tag: "/capabilities",
    prefix: "/v1/capabilities",
    endpoints: [
      {
        method: "GET", path: "/v1/capabilities", summary: "Get Capabilities",
        description: "Return the execution modes and product features available for the current tenant. Use this to populate mode selectors in your UI.",
        response: `{\n  "subscription_plan": "free",\n  "default_mode": "auto",\n  "modes": [\n    {"mode":"auto","label":"Auto","enabled":true},\n    {"mode":"thinking","label":"Thinking","enabled":true},\n    {"mode":"verified","label":"Verified","enabled":true}\n  ],\n  "features": [\n    {"key":"agent_chat","enabled":true},\n    {"key":"run_history","enabled":true}\n  ]\n}`,
        curl: `curl https://localhost:8000/v1/capabilities \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
  {
    tag: "/api-keys",
    prefix: "/v1/api-keys",
    endpoints: [
      {
        method: "GET", path: "/v1/api-keys", summary: "List API Keys",
        description: "List all API keys for the tenant. Raw key values are never returned after creation.",
        response: `[\n  {\n    "key_id": "...",\n    "label": "Frontend key",\n    "revoked_at": null,\n    "last_used_at": "2026-06-01T12:00:00Z",\n    "created_at": "2026-05-01T10:00:00Z"\n  }\n]`,
        curl: `curl https://localhost:8000/v1/api-keys \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "POST", path: "/v1/api-keys", summary: "Create API Key",
        description: "Create a new API key. The raw key value is returned exactly once in this response — copy it immediately.",
        body: [{ name: "label", type: "string", required: true, description: "Human-readable label for this key" }],
        response: `{\n  "key_id": "...",\n  "label": "My key",\n  "api_key": "key-XXXXXXXXXXXX",\n  "created_at": "2026-06-01T10:00:00Z"\n}`,
        curl: `curl -X POST https://localhost:8000/v1/api-keys \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"label":"Production key"}'`,
      },
      {
        method: "POST", path: "/v1/api-keys/{key_id}/revoke", summary: "Revoke API Key",
        description: "Permanently revoke an API key. This cannot be undone.",
        params: [{ name: "key_id", type: "uuid", required: true, description: "Key to revoke" }],
        response: `{ "key_id": "...", "revoked_at": "2026-06-01T12:00:00Z" }`,
        curl: `curl -X POST https://localhost:8000/v1/api-keys/KEY_ID/revoke \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
];

/* ─── Method badge ─── */
const METHOD_STYLES: Record<Method, string> = {
  GET:    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  POST:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  PATCH:  "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  PUT:    "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

function MethodBadge({ method }: { method: Method }) {
  return (
    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", METHOD_STYLES[method])}>
      {method}
    </span>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="relative rounded-xl bg-zinc-900 dark:bg-zinc-950">
      <button
        onClick={copy}
        className="absolute right-3 top-3 text-zinc-500 transition-colors hover:text-zinc-300"
        title="Copy"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre className="overflow-x-auto p-4 pr-10 text-[12px] leading-relaxed text-zinc-300 font-mono whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

function EndpointDetail({ ep }: { ep: Endpoint }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      {/* Left — description */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <MethodBadge method={ep.method} />
          <code className="text-[14px] font-mono font-semibold text-zinc-800 dark:text-zinc-200">{ep.path}</code>
        </div>
        <p className="mb-6 text-[14px] leading-relaxed text-zinc-500 dark:text-zinc-400">{ep.description}</p>

        {ep.params && ep.params.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-zinc-400">Path / Query Parameters</p>
            <div className="grid gap-2">
              {ep.params.map((p) => (
                <div key={p.name} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-[13px] font-semibold font-mono text-zinc-800 dark:text-zinc-200">{p.name}</code>
                    <span className="text-[11px] text-zinc-400 font-mono">{p.type}</span>
                    {p.required && <span className="text-[10px] font-bold text-red-500">required</span>}
                  </div>
                  <p className="text-[12px] text-zinc-500">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {ep.body && ep.body.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-zinc-400">Request Body</p>
            <div className="grid gap-2">
              {ep.body.map((b) => (
                <div key={b.name} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-[13px] font-semibold font-mono text-zinc-800 dark:text-zinc-200">{b.name}</code>
                    <span className="text-[11px] text-zinc-400 font-mono">{b.type}</span>
                    {b.required && <span className="text-[10px] font-bold text-red-500">required</span>}
                  </div>
                  <p className="text-[12px] text-zinc-500">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-wider text-zinc-400">Response</p>
          <CodeBlock code={ep.response} />
        </div>
      </div>

      {/* Right — curl */}
      <div>
        <div className="sticky top-24">
          <div className="flex items-center justify-between rounded-t-xl bg-zinc-800 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <MethodBadge method={ep.method} />
              <code className="text-[11px] text-zinc-400 font-mono">{ep.path}</code>
            </div>
            <span className="text-[11px] text-zinc-500">Shell · curl</span>
          </div>
          <CodeBlock code={ep.curl} />
        </div>
      </div>
    </div>
  );
}

/* ─── Main screen ─── */
export function ApiReferenceScreen() {
  const [openGroup, setOpenGroup] = useState<string>(API_GROUPS[0].tag);
  const [selectedEp, setSelectedEp] = useState<Endpoint>(API_GROUPS[0].endpoints[0]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      {/* Header */}
      <div className="mb-6 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Developer</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">API Reference</h1>
        <p className="mt-1.5 text-[14px] text-zinc-500">
          Base URL: <code className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[13px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">http://localhost:8000</code>
          {" "}· Authenticate with header <code className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[13px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">X-API-Key: YOUR_KEY</code>
        </p>
      </div>

      <div className="grid flex-1 gap-8 lg:grid-cols-[240px_1fr]">
        {/* Left nav */}
        <aside className="shrink-0">
          <div className="sticky top-20 space-y-1">
            {API_GROUPS.map((group) => {
              const isOpen = openGroup === group.tag;
              return (
                <div key={group.tag}>
                  <button
                    onClick={() => setOpenGroup(isOpen ? "" : group.tag)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <code className="font-mono">{group.tag}</code>
                    {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />}
                  </button>
                  {isOpen && (
                    <div className="ml-3 mt-1 space-y-0.5 border-l border-zinc-100 pl-3 dark:border-zinc-800">
                      {group.endpoints.map((ep) => (
                        <button
                          key={ep.path + ep.method}
                          onClick={() => setSelectedEp(ep)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors",
                            selectedEp === ep
                              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
                          )}
                        >
                          <MethodBadge method={ep.method} />
                          <span className="truncate">{ep.summary}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedEp.summary}</h2>
          </div>
          <EndpointDetail ep={selectedEp} />
        </div>
      </div>
    </div>
  );
}
