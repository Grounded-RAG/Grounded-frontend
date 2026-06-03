"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, Check, Database, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import {
  attachDatasetToAgent,
  deleteAgent,
  detachDatasetFromAgent,
  getAgent,
  getCapabilities,
  listDatasetDocuments,
  listDatasets,
  updateAgent,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { ModeCapability, UserFacingMode } from "@/lib/types";
import { useApiQuery } from "@/lib/use-api-query";
import { cn, workspaceHref } from "@/lib/utils";

const fallbackModes: ModeCapability[] = [
  { mode: "auto", label: "Auto", enabled: true, backing_tier: null, description: "Recommended mode.", availability_reason: null },
  { mode: "instant", label: "Instant", enabled: true, backing_tier: "standard", description: "Fast grounded answers.", availability_reason: null },
  { mode: "thinking", label: "Thinking", enabled: true, backing_tier: "enterprise", description: "Deeper retrieval for harder questions.", availability_reason: null },
  { mode: "verified", label: "Verified", enabled: true, backing_tier: "critical", description: "Highest-assurance answers.", availability_reason: null },
];

export function EditAgentScreen({ id, workspaceSlug }: { id: string; workspaceSlug?: string }) {
  const router = useRouter();
  const { apiKey, workspaceId } = useAuth();
  const agentsHref = workspaceHref(workspaceSlug, "/agents");
  const agentHref = workspaceHref(workspaceSlug, `/agents/${id}`);

  const agentQuery = useApiQuery(() => getAgent(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const capabilitiesQuery = useApiQuery(() => getCapabilities(apiKey!), [apiKey], Boolean(apiKey));
  const datasetsQuery = useApiQuery(() => listDatasets(apiKey!, workspaceId), [apiKey, workspaceId], Boolean(apiKey && workspaceId));

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemInstructions, setSystemInstructions] = useState("");
  const [defaultMode, setDefaultMode] = useState<UserFacingMode>("auto");
  const [attachedDatasetIds, setAttachedDatasetIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Pre-fill form once agent loads
  useEffect(() => {
    if (agentQuery.data && !initialized) {
      setName(agentQuery.data.name);
      setDescription(agentQuery.data.description ?? "");
      setSystemInstructions(agentQuery.data.system_instructions ?? "");
      setDefaultMode(agentQuery.data.default_mode);
      setAttachedDatasetIds(agentQuery.data.dataset_ids);
      setInitialized(true);
    }
  }, [agentQuery.data, initialized]);

  const modeOptions = useMemo(
    () => (capabilitiesQuery.data?.modes ?? fallbackModes).filter((m) => m.mode !== "verified" || m.enabled),
    [capabilitiesQuery.data?.modes],
  );
  const enabledModes = useMemo(() => modeOptions.filter((m) => m.enabled).map((m) => m.mode), [modeOptions]);

  function toggleDataset(datasetId: string) {
    setAttachedDatasetIds((current) =>
      current.includes(datasetId)
        ? current.filter((id) => id !== datasetId)
        : [...current, datasetId],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!apiKey || !name.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await updateAgent(apiKey, id, {
        name: name.trim(),
        description: description.trim() || undefined,
        system_instructions: systemInstructions.trim() || undefined,
        default_mode: defaultMode,
        allowed_modes: enabledModes.length ? enabledModes : [defaultMode],
      });

      // Reconcile dataset attachments
      const original = agentQuery.data?.dataset_ids ?? [];
      const toAttach = attachedDatasetIds.filter((dsId) => !original.includes(dsId));
      const toDetach = original.filter((dsId) => !attachedDatasetIds.includes(dsId));
      await Promise.all([
        ...toAttach.map((dsId) => attachDatasetToAgent(apiKey, id, dsId)),
        ...toDetach.map((dsId) => detachDatasetFromAgent(apiKey, id, dsId)),
      ]);

      router.push(agentHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the agent.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!apiKey) return;
    setIsDeleting(true);
    try {
      await deleteAgent(apiKey, id);
      router.push(agentsHref);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete the agent.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (agentQuery.isLoading) return <p className="text-sm text-muted-foreground">Loading agent…</p>;

  return (
    <div className="mx-auto w-full max-w-4xl animate-fade-in">
      <Link href={agentHref} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to agent
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.04]">
            <Bot className="h-6 w-6 text-foreground/70" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit agent</h1>
            <p className="mt-1 text-sm text-muted-foreground">Update settings, instructions, and dataset connections.</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 rounded-full border-red-500/30 text-red-500 hover:bg-red-500/5 hover:text-red-600"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>

      <Card variant="glass" className="rounded-2xl">
        <CardHeader title="Agent details" />
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Policy Analyst" required />
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
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Answers questions with citations." rows={5} />
            <Textarea label="System instructions" value={systemInstructions} onChange={(e) => setSystemInstructions(e.target.value)} placeholder="Prefer concise grounded answers." rows={5} />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">Knowledge sources</h3>
            <p className="mb-3 text-xs text-muted-foreground">Datasets this agent searches for grounded answers.</p>
            {datasetsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading datasets…</p>
            ) : (datasetsQuery.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No datasets available.</p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {(datasetsQuery.data ?? []).map((dataset) => (
                  <DatasetChoice
                    key={dataset.dataset_id}
                    apiKey={apiKey!}
                    datasetId={dataset.dataset_id}
                    name={dataset.name}
                    domain={dataset.domain}
                    selected={attachedDatasetIds.includes(dataset.dataset_id)}
                    onToggle={() => toggleDataset(dataset.dataset_id)}
                  />
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-border/15 pt-5">
            <Link href={agentHref}>
              <Button type="button" variant="secondary" className="rounded-full">Cancel</Button>
            </Link>
            <Button type="submit" disabled={!name.trim() || isSubmitting} className="rounded-full">
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/30 bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground">Delete agent?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This will permanently delete <strong>{name}</strong> and all its conversations. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" className="rounded-full" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button
                className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete agent"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DatasetChoice({ apiKey, datasetId, name, domain, selected, onToggle }: {
  apiKey: string; datasetId: string; name: string; domain: string; selected: boolean; onToggle: () => void;
}) {
  const docsQuery = useApiQuery(() => listDatasetDocuments(apiKey, datasetId), [apiKey, datasetId], Boolean(apiKey));
  const indexedCount = (docsQuery.data ?? []).filter((d) => d.status === "indexed").length;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
        selected ? "border-foreground/30 bg-secondary/70" : "border-border/60 bg-background/40 hover:bg-secondary/35",
      )}
    >
      <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-foreground bg-foreground text-background" : "border-border bg-card")}>
        {selected ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      <Database className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
        <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          {docsQuery.isLoading ? "…" : `${indexedCount}/${docsQuery.data?.length ?? 0} indexed`} · {domain}
        </span>
      </span>
    </button>
  );
}
