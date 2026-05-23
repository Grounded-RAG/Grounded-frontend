"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Boxes,
  Check,
  ChevronRight,
  Database,
  FileText,
  Network,
  Package,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { capabilities, datasets, documents } from "@/lib/mock-data";
import type { GroundingPolicy, UserFacingMode } from "@/lib/types";
import { cn, workspaceHref } from "@/lib/utils";

const setupOptions = [
  {
    value: "template",
    label: "Template",
    description: "Start with a pre-built agent designed for specific tasks and workflows.",
    icon: Package,
    badge: null,
  },
  {
    value: "prompt",
    label: "Prompt",
    description: "Describe your goal and generate a custom agent configuration.",
    icon: Sparkles,
    badge: "Beta",
  },
  {
    value: "blank",
    label: "Blank Canvas",
    description: "Build your agent from scratch with full control using the Agent Composer.",
    icon: Network,
    badge: null,
  },
] as const;

const templates = [
  { value: "agentic", label: "Agentic Search", description: "Multi-step reasoning, tool use, and customizable outputs" },
  { value: "simple", label: "Simple Search", description: "Fast multi-modal retrieval from enterprise documents" },
  { value: "policy", label: "Policy Copilot", description: "Answer operating-policy questions with grounded citations" },
];

const groundingPolicies = [
  { value: "strict", label: "Strict" },
  { value: "balanced", label: "Balanced" },
  { value: "live", label: "Live" },
] as const;

export function CreateAgentScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const router = useRouter();
  const agentsHref = workspaceHref(workspaceSlug, "/agents");
  const datasetsHref = workspaceHref(workspaceSlug, "/datasets/new");

  const [setupType, setSetupType] = useState<(typeof setupOptions)[number]["value"]>("template");
  const [template, setTemplate] = useState("agentic");
  const [tab, setTab] = useState<"prebuilt" | "custom">("prebuilt");
  const [name, setName] = useState("Agentic Search");
  const [description, setDescription] = useState("Search across trusted datasets with multi-step reasoning.");
  const [instructions, setInstructions] = useState("Answer with citations from attached datasets and call out uncertainty.");
  const [datasetSearch, setDatasetSearch] = useState("");
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([datasets[0]?.dataset_id].filter(Boolean) as string[]);
  const [groundingPolicy, setGroundingPolicy] = useState<GroundingPolicy>("strict");
  const [defaultMode, setDefaultMode] = useState<UserFacingMode>("auto");

  const filteredDatasets = datasets.filter((dataset) => {
    const query = datasetSearch.toLowerCase();
    return dataset.name.toLowerCase().includes(query) || dataset.domain.toLowerCase().includes(query);
  });

  const ready = name.trim().length > 0 && selectedDatasets.length > 0;

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    const selected = templates.find((item) => item.value === value);
    if (selected) {
      setName(selected.label);
      setDescription(selected.description);
    }
  };

  const toggleDataset = (datasetId: string) => {
    setSelectedDatasets((prev) =>
      prev.includes(datasetId) ? prev.filter((id) => id !== datasetId) : [...prev, datasetId],
    );
  };

  const getDocCount = (datasetId: string) =>
    documents.filter((document) => document.dataset_id === datasetId).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ready) router.push(agentsHref);
  };

  return (
    <div className="animate-fade-in mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-[1040px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto bg-background/35">
          <div className="relative border-b border-border/60 bg-card px-5 py-5">
            <Link
              href={agentsHref}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-secondary/70 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close create agent"
            >
              <X className="h-4 w-4" />
            </Link>
            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300">
                <Bot className="h-5 w-5" />
              </div>
              <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Create Agent</h1>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="border-b border-border/60 bg-secondary/30 px-4 py-3">
                <h2 className="text-[14px] font-semibold text-foreground">Setup</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">Choose how you&apos;d like to build your agent.</p>
              </div>

              <div className="grid md:grid-cols-3">
                {setupOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = setupType === option.value;

                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => {
                        setSetupType(option.value);
                        setTab(option.value === "blank" ? "custom" : "prebuilt");
                      }}
                      className={cn(
                        "relative min-h-[132px] border-b border-border/60 p-4 text-left transition-colors hover:bg-secondary/30 md:border-b-0 md:border-r md:last:border-r-0",
                        selected && "bg-secondary/20",
                      )}
                    >
                      <div className="mb-7 flex items-center justify-between gap-3">
                        <Icon className="h-5 w-5 text-foreground" />
                        <span className="flex items-center gap-2">
                          {option.badge ? (
                            <Badge tone="neutral" size="sm" className="h-5 text-[10px] text-violet-600 dark:text-violet-300">
                              {option.badge}
                            </Badge>
                          ) : null}
                          <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", selected ? "border-sky-500 bg-sky-500 text-white" : "border-border bg-card")}>
                            {selected ? <Check className="h-3 w-3" /> : null}
                          </span>
                        </span>
                      </div>
                      <h3 className="text-[15px] font-semibold text-foreground">{option.label}</h3>
                      <p className="mt-1 max-w-[20rem] text-[13px] leading-5 text-muted-foreground">{option.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 border-t border-border/60 bg-card text-center text-[13px] font-semibold">
                <button
                  type="button"
                  onClick={() => setTab("prebuilt")}
                  className={cn("h-9 border-b transition-colors", tab === "prebuilt" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:bg-secondary/30 hover:text-foreground")}
                >
                  Pre-Built
                </button>
                <button
                  type="button"
                  onClick={() => setTab("custom")}
                  className={cn("h-9 border-b transition-colors", tab === "custom" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:bg-secondary/30 hover:text-foreground")}
                >
                  Custom
                </button>
              </div>

              {tab === "prebuilt" ? (
                <div className="grid gap-1 px-4 py-3">
                  {templates.map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => handleTemplateChange(item.value)}
                      className="flex items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary/40"
                    >
                      <span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", template === item.value ? "border-sky-500 bg-sky-500 text-white" : "border-border bg-card")}>
                        {template === item.value ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <span>
                        <span className="block text-[13px] font-semibold text-foreground">{item.label}</span>
                        <span className="block text-[12px] text-muted-foreground">{item.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
                  <Input label="Agent name" placeholder="Policy Copilot" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input label="Short description" placeholder="What should this agent do?" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-5">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                  <div className="border-b border-border/60 bg-secondary/30 px-4 py-3">
                    <h2 className="text-[15px] font-semibold text-foreground">Agent Composer</h2>
                  </div>
                  <div className="grid gap-4 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input label="Name" placeholder="Agentic Search" value={name} onChange={(e) => setName(e.target.value)} required />
                      <div className="grid gap-1.5">
                        <label className="pl-0.5 text-[13px] font-medium text-foreground/80">Default mode</label>
                        <div className="grid grid-cols-4 overflow-hidden rounded-xl border border-border/60 bg-card">
                          {capabilities.map((capability) => (
                            <button
                              key={capability.mode}
                              type="button"
                              onClick={() => setDefaultMode(capability.mode)}
                              className={cn(
                                "h-11 px-2 text-[12px] font-semibold capitalize transition-colors",
                                defaultMode === capability.mode ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                              )}
                            >
                              {capability.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Textarea label="Instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4} />
                    <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-border/60 bg-card">
                      {groundingPolicies.map((policy) => (
                        <button
                          key={policy.value}
                          type="button"
                          onClick={() => setGroundingPolicy(policy.value)}
                          className={cn(
                            "h-10 text-[12px] font-semibold transition-colors",
                            groundingPolicy === policy.value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                          )}
                        >
                          {policy.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                  <div className="border-b border-border/60 bg-secondary/30 px-4 py-3">
                    <h2 className="text-[15px] font-semibold text-foreground">Knowledge Sources</h2>
                  </div>
                  <div className="p-4">
                    <div className="mb-3 flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-card px-3 transition-colors focus-within:border-foreground/20">
                      <Search className="h-4 w-4 text-muted-foreground/50" />
                      <input
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/45"
                        placeholder="Search Datasets"
                        value={datasetSearch}
                        onChange={(e) => setDatasetSearch(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      {filteredDatasets.map((dataset) => {
                        const selected = selectedDatasets.includes(dataset.dataset_id);

                        return (
                          <button
                            type="button"
                            key={dataset.dataset_id}
                            onClick={() => toggleDataset(dataset.dataset_id)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                              selected ? "border-foreground/30 bg-secondary/70" : "border-border/60 bg-card hover:bg-secondary/40",
                            )}
                          >
                            <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", selected ? "border-sky-500 bg-sky-500 text-white" : "border-border bg-card")}>
                              {selected ? <Check className="h-3 w-3" /> : null}
                            </span>
                            <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-semibold text-foreground">{dataset.name}</span>
                              <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                {getDocCount(dataset.dataset_id)} documents
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <Link
                      href={datasetsHref}
                      className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-border/60 px-3 py-3 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-secondary/30 hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create a new dataset
                    </Link>
                  </div>
                </div>
              </div>

              <aside className="grid content-start gap-5">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                  <h2 className="text-[15px] font-semibold text-foreground">Summary</h2>
                  <dl className="mt-3 grid gap-2.5 text-[13px]">
                    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">Setup</dt>
                      <dd className="font-semibold capitalize text-foreground">{setupType}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">Template</dt>
                      <dd className="max-w-[150px] truncate font-semibold text-foreground">{tab === "prebuilt" ? name : "Custom"}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">Policy</dt>
                      <dd className="font-semibold capitalize text-foreground">{groundingPolicy}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Datasets</dt>
                      <dd className="font-semibold text-foreground">{selectedDatasets.length}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                  <h2 className="text-[15px] font-semibold text-foreground">Readiness</h2>
                  <div className="mt-3 grid gap-2">
                    {[
                      { label: "Name provided", met: name.trim().length > 0 },
                      { label: "Dataset attached", met: selectedDatasets.length > 0 },
                      { label: "Instructions set", met: instructions.trim().length > 0 },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2.5 text-[13px]">
                        <span className={cn("flex h-[18px] w-[18px] items-center justify-center rounded-full border", item.met ? "border-foreground bg-foreground text-background" : "border-border bg-card")}>
                          {item.met ? <Check className="h-3 w-3" /> : null}
                        </span>
                        <span className={item.met ? "font-medium text-foreground" : "text-muted-foreground"}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-card px-5 py-4">
          <Link
            href="https://docs.grounded.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[14px] font-medium text-sky-600 transition-colors hover:text-sky-700 dark:text-sky-300"
          >
            Need Help?
            <ChevronRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="secondary" disabled={!ready} className="rounded-lg">
              Create & Customize
            </Button>
            <Button type="submit" disabled={!ready} className="rounded-lg">
              Start Chatting
              <Boxes className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
