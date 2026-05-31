
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, Check, Database, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { attachDatasetToAgent, createAgent, getCapabilities, listDatasetDocuments, listDatasets } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { ModeCapability, UserFacingMode } from "@/lib/types";
import { useApiQuery } from "@/lib/use-api-query";
import { cn, workspaceHref } from "@/lib/utils";

const fallbackModes: ModeCapability[] = [
  { mode: "auto", label: "Auto", enabled: true, backing_tier: null, description: "Recommended mode.", availability_reason: null },
  { mode: "instant", label: "Instant", enabled: true, backing_tier: "standard", description: "Fast grounded answers.", availability_reason: null },
  { mode: "thinking", label: "Thinking", enabled: true, backing_tier: "enterprise", description: "Deeper retrieval for harder questions.", availability_reason: null },
];

export function CreateAgentScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const router = useRouter();
  const { apiKey, workspaceId } = useAuth();
  const agentsHref = workspaceHref(workspaceSlug, "/agents");
  const datasetsHref = workspaceHref(workspaceSlug, "/datasets/new");
  const capabilitiesQuery = useApiQuery(() => getCapabilities(apiKey!), [apiKey], Boolean(apiKey));
  const datasetsQuery = useApiQuery(() => listDatasets(apiKey!, workspaceId), [apiKey, workspaceId], Boolean(apiKey && workspaceId));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemInstructions, setSystemInstructions] = useState("");
  const [defaultMode, setDefaultMode] = useState<UserFacingMode>("auto");
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modeOptions = useMemo(
    () => (capabilitiesQuery.data?.modes ?? fallbackModes).filter((mode) => mode.mode !== "verified"),
    [capabilitiesQuery.data?.modes],
  );
  const enabledModes = useMemo(() => modeOptions.filter((mode) => mode.enabled).map((mode) => mode.mode), [modeOptions]);

  useEffect(() => {
    if (enabledModes.length > 0 && !enabledModes.includes(defaultMode)) {
      setDefaultMode(enabledModes[0]);
    }
  }, [defaultMode, enabledModes]);

  function toggleDataset(datasetId: string) {
    setSelectedDatasets((current) =>
      current.includes(datasetId)
        ? current.filter((id) => id !== datasetId)
        : [...current, datasetId],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!apiKey || !workspaceId || !name.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const agent = await createAgent(apiKey, {
        workspace_id: workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        system_instructions: systemInstructions.trim() || undefined,
        default_mode: defaultMode,
        allowed_modes: enabledModes.length ? enabledModes : [defaultMode],
      });
      for (const datasetId of selectedDatasets) {
        await attachDatasetToAgent(apiKey, agent.agent_id, datasetId);
      }
      router.push(workspaceHref(workspaceSlug, `/agents/${agent.agent_id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the agent.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl animate-fade-in">
      <Link href={agentsHref} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to agents
      </Link>

      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.04] text-foreground/70">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create an agent</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build an agent that reasons over workspace datasets with grounded answers and inspectable runs.
          </p>
        </div>
      </div>

      <Card variant="glass" className="rounded-2xl">
        <CardHeader title="Agent details" />
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Policy Analyst" required />
            <div className="grid gap-1.5">
              <label className="pl-0.5 text-[13px] font-medium text-foreground/80">Default mode</label>
              <div className="flex flex-wrap items-center gap-2">
                {modeOptions.map((mode) => (
                  <button
                    key={mode.mode}
                    type="button"
                    onClick={() => mode.enabled && setDefaultMode(mode.mode)}
                    disabled={!mode.enabled}
                    title={mode.description}
                    className={cn(
                      "h-10 rounded-full border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                      defaultMode === mode.mode
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/60 bg-card text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Textarea
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Answers questions about policy with citations."
              rows={5}
            />
            <Textarea
              label="System instructions"
              value={systemInstructions}
              onChange={(event) => setSystemInstructions(event.target.value)}
              placeholder="Prefer concise grounded answers and cite evidence."
              rows={5}
            />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Knowledge sources</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Attach datasets this agent can use for grounded answers.</p>
              </div>
              <Link href={datasetsHref} className="shrink-0 text-xs font-semibold text-foreground underline-offset-4 hover:underline">
                New dataset
              </Link>
            </div>

            {datasetsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading datasets...</p>
            ) : (datasetsQuery.data?.length ?? 0) === 0 ? (
              <div className="rounded-xl border border-border/60 bg-secondary/35 px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground"><Database className="h-4 w-4" /> No datasets yet</div>
                <p className="mt-1">Create and upload a dataset first so this agent has source material to answer from.</p>
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {(datasetsQuery.data ?? []).map((dataset) => (
                  <DatasetChoice
                    key={dataset.dataset_id}
                    apiKey={apiKey!}
                    datasetId={dataset.dataset_id}
                    name={dataset.name}
                    domain={dataset.domain}
                    selected={selectedDatasets.includes(dataset.dataset_id)}
                    onToggle={() => toggleDataset(dataset.dataset_id)}
                  />
                ))}
              </div>
            )}
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-border/15 pt-5">
            <Link href={agentsHref}>
              <Button type="button" variant="secondary" className="rounded-full">Cancel</Button>
            </Link>
            <Button type="submit" disabled={!name.trim() || isSubmitting} className="rounded-full">
              {isSubmitting ? "Creating..." : selectedDatasets.length > 0 ? "Create and attach" : "Create agent"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}


function DatasetChoice({
  apiKey,
  datasetId,
  name,
  domain,
  selected,
  onToggle,
}: {
  apiKey: string;
  datasetId: string;
  name: string;
  domain: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const documentsQuery = useApiQuery(() => listDatasetDocuments(apiKey, datasetId), [apiKey, datasetId], Boolean(apiKey));
  const indexedCount = (documentsQuery.data ?? []).filter((document) => document.status === "indexed").length;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
        selected
          ? "border-foreground/30 bg-secondary/70"
          : "border-border/60 bg-background/40 hover:bg-secondary/35",
      )}
    >
      <span className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
        selected ? "border-foreground bg-foreground text-background" : "border-border bg-card",
      )}>
        {selected ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      <Database className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
        <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          {documentsQuery.isLoading ? "Checking documents..." : `${indexedCount}/${documentsQuery.data?.length ?? 0} indexed`} · {domain}
        </span>
      </span>
    </button>
  );
}
