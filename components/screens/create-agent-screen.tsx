"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Database,
  FileText,
  Plus,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { datasets, documents, capabilities } from "@/lib/mock-data";
import type { UserFacingMode, GroundingPolicy } from "@/lib/types";

export function CreateAgentScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [groundingPolicy, setGroundingPolicy] = useState<GroundingPolicy>("strict");
  const [defaultMode, setDefaultMode] = useState<UserFacingMode>("auto");
  const [allowedModes, setAllowedModes] = useState<UserFacingMode[]>(["auto", "instant"]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [datasetSearch, setDatasetSearch] = useState("");

  const toggleMode = (mode: UserFacingMode) => {
    setAllowedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const toggleDataset = (id: string) => {
    setSelectedDatasets((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/app/agents");
  };

  /* helpers */
  const getDocCount = (datasetId: string) =>
    documents.filter((d) => d.dataset_id === datasetId).length;
  const getIndexedCount = (datasetId: string) =>
    documents.filter((d) => d.dataset_id === datasetId && d.status === "indexed").length;

  const filteredDatasets = datasets.filter((ds) =>
    ds.name.toLowerCase().includes(datasetSearch.toLowerCase()) ||
    ds.domain.toLowerCase().includes(datasetSearch.toLowerCase())
  );

  const sensitivityTone = (level: string) => {
    switch (level) {
      case "restricted": return "danger" as const;
      case "confidential": return "warn" as const;
      default: return "neutral" as const;
    }
  };

  return (
    <div className="page-grid animate-fade-in">
      {/* Back link */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/app/agents"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to agents
        </Link>
      </div>

      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-foreground/[0.06] border border-border/30 flex items-center justify-center">
            <Bot className="h-5 w-5 text-foreground/70" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create new agent</h1>
            <p className="text-sm text-muted-foreground">Configure an intelligent assistant backed by your datasets.</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-foreground/[0.02] border border-border/20 text-[12px] text-muted-foreground">
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${step === 1 ? 'bg-foreground text-background ring-2 ring-foreground/30 ring-offset-1 ring-offset-background' : 'bg-foreground/20 text-foreground'}`}>1</span>
          <span className={`font-medium ${step === 1 ? 'text-foreground' : 'text-foreground/60'}`}>Agent configuration</span>
          <span className="text-muted-foreground/40">→</span>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${step === 2 ? 'bg-foreground text-background ring-2 ring-foreground/30 ring-offset-1 ring-offset-background' : 'bg-foreground/20 text-foreground'}`}>2</span>
          <span className={`font-medium ${step === 2 ? 'text-foreground' : 'text-foreground/60'}`}>Knowledge sources</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
          {/* Main column */}
          <div className="grid gap-6">
            {step === 1 && (
              <>
            {/* Basics */}
            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-5">Basic information</h2>
              <div className="grid gap-5">
                <Input
                  label="Agent name"
                  placeholder="e.g. Policy Copilot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Textarea
                  label="Description"
                  placeholder="Briefly describe what this agent does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
                <Textarea
                  label="System instructions"
                  placeholder="Provide the agent's system prompt — how it should behave, what to prioritize..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                />
              </div>
            </Card>

            {/* Mode Configuration */}
            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-5">Mode configuration</h2>

              {/* Default mode */}
              <div className="mb-6">
                <label className="text-[13px] font-medium text-foreground/80 pl-0.5 mb-2 block">Default mode</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {capabilities.map((cap) => (
                    <button
                      key={cap.mode}
                      type="button"
                      disabled={!cap.enabled}
                      onClick={() => setDefaultMode(cap.mode)}
                      className={`relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-200 ${
                        defaultMode === cap.mode
                          ? "border-foreground/30 bg-foreground/[0.06] shadow-sm"
                          : "border-border/30 bg-foreground/[0.01] hover:bg-foreground/[0.03]"
                      } ${!cap.enabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className="text-[13px] font-semibold text-foreground">{cap.label}</span>
                      <span className="text-[11px] text-muted-foreground leading-snug">{cap.description}</span>
                      {defaultMode === cap.mode && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allowed modes */}
              <div>
                <label className="text-[13px] font-medium text-foreground/80 pl-0.5 mb-2 block">Allowed modes</label>
                <div className="flex flex-wrap gap-2">
                  {capabilities.map((cap) => (
                    <button
                      key={cap.mode}
                      type="button"
                      disabled={!cap.enabled}
                      onClick={() => toggleMode(cap.mode)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                        allowedModes.includes(cap.mode)
                          ? "border-foreground/30 bg-foreground/[0.06] text-foreground"
                          : "border-border/30 bg-transparent text-muted-foreground hover:bg-foreground/[0.02]"
                      } ${!cap.enabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={`h-4 w-4 rounded border flex items-center justify-center text-[10px] ${
                        allowedModes.includes(cap.mode)
                          ? "border-foreground bg-foreground text-background"
                          : "border-border/60"
                      }`}>
                        {allowedModes.includes(cap.mode) && "✓"}
                      </span>
                      {cap.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Grounding Policy Configuration */}
            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-1">Source-usage policy</h2>
              <p className="text-[13px] text-muted-foreground mb-5">
                Determine how strictly the agent must adhere to the attached datasets versus general knowledge.
              </p>

              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { policy: "strict", label: "Strict", desc: "Only answer if information exists in the attached datasets." },
                  { policy: "balanced", label: "Balanced", desc: "Prioritize datasets, but use general knowledge to fill gaps." },
                  { policy: "live", label: "Live", desc: "Use datasets as a baseline, but freely search the web for recent info." },
                ].map((item) => (
                  <button
                    key={item.policy}
                    type="button"
                    onClick={() => setGroundingPolicy(item.policy as GroundingPolicy)}
                    className={`relative flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all duration-200 ${
                      groundingPolicy === item.policy
                        ? "border-foreground/30 bg-foreground/[0.06] shadow-sm"
                        : "border-border/30 bg-foreground/[0.01] hover:bg-foreground/[0.03]"
                    }`}
                  >
                    <span className="text-[14px] font-semibold text-foreground">{item.label}</span>
                    <span className="text-[12px] text-muted-foreground leading-relaxed mt-1">{item.desc}</span>
                    {groundingPolicy === item.policy && (
                      <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </>
          )}

          {step === 2 && (
            <>
            {/* ─── Knowledge Sources (Datasets) — PRIMARY SECTION ─── */}
            <Card variant="glass" className="rounded-2xl">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-4 w-4 text-foreground/70" />
                    <h2 className="text-base font-semibold text-foreground">Knowledge sources</h2>
                  </div>
                  <p className="text-[13px] text-muted-foreground">
                    Attach the datasets this agent can access. The agent&apos;s answers will be grounded in these documents.
                  </p>
                </div>
                {selectedDatasets.length > 0 && (
                  <Badge tone="accent" size="md" className="shrink-0">
                    {selectedDatasets.length} attached
                  </Badge>
                )}
              </div>

              {/* Selected dataset pills */}
              {selectedDatasets.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 mb-4 p-3 rounded-xl bg-foreground/[0.02] border border-border/15">
                  {selectedDatasets.map((id) => {
                    const ds = datasets.find((d) => d.dataset_id === id);
                    return ds ? (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/15 bg-foreground/[0.04] px-2.5 py-1.5 text-[12px] font-medium text-foreground transition-all hover:bg-foreground/[0.07]"
                      >
                        <Database className="h-3 w-3 text-foreground/50" />
                        {ds.name}
                        <button
                          type="button"
                          onClick={() => toggleDataset(id)}
                          className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {datasets.length === 0 ? (
                /* No datasets exist at all */
                <EmptyState
                  icon={<Database className="h-8 w-8" />}
                  title="No datasets available"
                  description="You need to create a dataset and upload documents before configuring an agent."
                  action={
                    <Link href="/app/datasets/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create dataset
                      </Button>
                    </Link>
                  }
                  className="mt-4"
                />
              ) : (
                <>
                  {/* Dataset search */}
                  <div className="flex h-10 items-center gap-3 rounded-xl border border-border/30 bg-foreground/[0.02] px-3.5 mt-4 mb-3 transition-all focus-within:ring-1 focus-within:ring-foreground/15 focus-within:border-foreground/25">
                    <Search className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <input
                      className="flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/40"
                      placeholder="Search datasets by name or domain..."
                      value={datasetSearch}
                      onChange={(e) => setDatasetSearch(e.target.value)}
                    />
                  </div>

                  {/* Dataset cards */}
                  <div className="grid gap-2">
                    {filteredDatasets.map((ds) => {
                      const selected = selectedDatasets.includes(ds.dataset_id);
                      const docCount = getDocCount(ds.dataset_id);
                      const indexedCount = getIndexedCount(ds.dataset_id);

                      return (
                        <button
                          type="button"
                          key={ds.dataset_id}
                          onClick={() => toggleDataset(ds.dataset_id)}
                          className={`group flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                            selected
                              ? "border-foreground/25 bg-foreground/[0.05] shadow-sm"
                              : "border-border/20 hover:bg-foreground/[0.02] hover:border-border/30"
                          }`}
                        >
                          {/* Checkbox */}
                          <span className={`h-5 w-5 rounded-md border flex items-center justify-center text-[11px] shrink-0 transition-all duration-200 ${
                            selected
                              ? "border-foreground bg-foreground text-background"
                              : "border-border/50 group-hover:border-foreground/30"
                          }`}>
                            {selected && "✓"}
                          </span>

                          {/* Dataset icon */}
                          <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border transition-all duration-200 ${
                            selected
                              ? "bg-foreground/[0.08] border-foreground/15"
                              : "bg-foreground/[0.03] border-border/20"
                          }`}>
                            <Database className="h-4 w-4 text-foreground/60" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-semibold text-foreground truncate">{ds.name}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                {docCount} document{docCount !== 1 ? "s" : ""}
                                {docCount > 0 && (
                                  <span className="text-muted-foreground/50 ml-0.5">
                                    · {indexedCount} indexed
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] text-muted-foreground/60">
                                {ds.domain}
                              </span>
                            </div>
                          </div>

                          {/* Metadata badges */}
                          <div className="hidden sm:flex items-center gap-2 shrink-0">
                            <Badge tone={sensitivityTone(ds.sensitivity_level)} size="sm" className="h-5 text-[10px]">
                              <ShieldAlert className="h-3 w-3 mr-0.5" />
                              {ds.sensitivity_level}
                            </Badge>
                          </div>
                        </button>
                      );
                    })}

                    {filteredDatasets.length === 0 && datasetSearch && (
                      <div className="text-center py-8 text-sm text-muted-foreground/60">
                        No datasets match &quot;{datasetSearch}&quot;
                      </div>
                    )}
                  </div>

                  {/* Link to create more */}
                  <Link
                    href="/app/datasets/new"
                    className="flex items-center gap-2 mt-3 px-4 py-3 rounded-xl border border-dashed border-border/25 text-[13px] text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-foreground/[0.02] transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create a new dataset
                  </Link>
                </>
              )}
            </Card>
          </>
          )}
        </div>

          {/* Sidebar column */}
          <div className="grid content-start gap-6">
            {/* Summary */}
            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-3">Summary</h2>
              <dl className="grid gap-2.5 text-sm">
                <div className="flex justify-between gap-4 border-b border-border/10 pb-2">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium text-foreground/80 truncate max-w-[140px]">{name || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/10 pb-2">
                  <dt className="text-muted-foreground">Source policy</dt>
                  <dd className="font-medium text-foreground/80 capitalize">{groundingPolicy}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/10 pb-2">
                  <dt className="text-muted-foreground">Default mode</dt>
                  <dd className="font-medium text-foreground/80 capitalize">{defaultMode}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/10 pb-2">
                  <dt className="text-muted-foreground">Modes</dt>
                  <dd className="font-medium text-foreground/80">{allowedModes.length} selected</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Datasets</dt>
                  <dd className="font-medium text-foreground/80">{selectedDatasets.length} attached</dd>
                </div>
              </dl>

              {/* Show attached dataset names */}
              {selectedDatasets.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border/10">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">Knowledge sources</p>
                  <div className="grid gap-1.5">
                    {selectedDatasets.map((id) => {
                      const ds = datasets.find((d) => d.dataset_id === id);
                      return ds ? (
                        <div key={id} className="flex items-center gap-2 text-[12px]">
                          <Database className="h-3 w-3 text-foreground/40" />
                          <span className="text-foreground/80 truncate">{ds.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* Readiness check */}
            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-3">Readiness</h2>
              <div className="grid gap-2.5">
                {[
                  { label: "Name provided", met: name.trim().length > 0 },
                  { label: "Dataset attached", met: selectedDatasets.length > 0 },
                  { label: "Instructions set", met: instructions.trim().length > 0 },
                  { label: "Policy configured", met: !!groundingPolicy },
                  { label: "Mode selected", met: allowedModes.length > 0 },
                ].map((check) => (
                  <div key={check.label} className="flex items-center gap-2.5">
                    <div className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      check.met
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/40 bg-foreground/[0.02]"
                    }`} style={{ height: 18, width: 18 }}>
                      {check.met && (
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[13px] ${check.met ? "text-foreground font-medium" : "text-muted-foreground/60"}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <div className="grid gap-3">
              {step === 1 ? (
                <>
                  <Button
                    type="button"
                    size="lg"
                    className="w-full rounded-xl"
                    disabled={!name.trim() || !instructions.trim()}
                    onClick={() => setStep(2)}
                  >
                    Next: Add datasets
                  </Button>
                  <Link href="/app/agents">
                    <Button type="button" variant="ghost" size="md" className="w-full rounded-xl">
                      Cancel
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-xl"
                    disabled={selectedDatasets.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create agent
                  </Button>
                  {selectedDatasets.length === 0 && (
                    <p className="text-[11px] text-center text-amber-600 dark:text-amber-400">
                      Attach at least one dataset to create the agent
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    className="w-full rounded-xl"
                    onClick={() => setStep(1)}
                  >
                    Back to configuration
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
