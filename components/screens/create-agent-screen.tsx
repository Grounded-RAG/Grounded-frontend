"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { datasets, capabilities } from "@/lib/mock-data";
import type { UserFacingMode } from "@/lib/types";

export function CreateAgentScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [defaultMode, setDefaultMode] = useState<UserFacingMode>("auto");
  const [allowedModes, setAllowedModes] = useState<UserFacingMode[]>(["auto", "instant"]);
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "archived">("active");

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
    // In a real app, this would POST to the API
    // For now, navigate back to the agents list
    router.push("/app/agents");
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

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
          {/* Main column */}
          <div className="grid gap-6">
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

            {/* Dataset selection */}
            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-2">Attached datasets</h2>
              <p className="text-[13px] text-muted-foreground mb-5">Select the datasets this agent can access for grounded answers.</p>

              {selectedDatasets.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedDatasets.map((id) => {
                    const ds = datasets.find((d) => d.dataset_id === id);
                    return ds ? (
                      <Badge key={id} tone="accent" size="sm" className="gap-1.5 pr-1.5">
                        {ds.name}
                        <button
                          type="button"
                          onClick={() => toggleDataset(id)}
                          className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              <div className="grid gap-2">
                {datasets.map((ds) => {
                  const selected = selectedDatasets.includes(ds.dataset_id);
                  return (
                    <button
                      type="button"
                      key={ds.dataset_id}
                      onClick={() => toggleDataset(ds.dataset_id)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-200 ${
                        selected
                          ? "border-foreground/25 bg-foreground/[0.04]"
                          : "border-border/20 hover:bg-foreground/[0.02] hover:border-border/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-foreground">{ds.name}</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">{ds.domain} · {ds.sensitivity_level}</p>
                      </div>
                      <span className={`h-5 w-5 rounded-md border flex items-center justify-center text-[11px] shrink-0 transition-all ${
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border/50"
                      }`}>
                        {selected && "✓"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar column */}
          <div className="grid content-start gap-6">
            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-4">Status</h2>
              <div className="flex gap-2">
                {(["active", "archived"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 rounded-xl border py-2.5 text-[13px] font-medium capitalize transition-all duration-200 ${
                      status === s
                        ? "border-foreground/25 bg-foreground/[0.06] text-foreground"
                        : "border-border/30 text-muted-foreground hover:bg-foreground/[0.02]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Card>

            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-3">Summary</h2>
              <dl className="grid gap-2.5 text-sm">
                <div className="flex justify-between gap-4 border-b border-border/10 pb-2">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium text-foreground/80 truncate max-w-[140px]">{name || "—"}</dd>
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
            </Card>

            {/* Actions */}
            <div className="grid gap-3">
              <Button type="submit" size="lg" className="w-full rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Create agent
              </Button>
              <Link href="/app/agents">
                <Button type="button" variant="ghost" size="md" className="w-full rounded-xl">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
