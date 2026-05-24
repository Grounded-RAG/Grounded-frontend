"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Database, MoreHorizontal, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listDatasetDocuments, listDatasets } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApiQuery } from "@/lib/use-api-query";
import { cn, formatDate, workspaceHref } from "@/lib/utils";

export function DatasetsScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const { apiKey, workspaceId } = useAuth();
  const [search, setSearch] = useState("");
  const datasetsQuery = useApiQuery(() => listDatasets(apiKey!, workspaceId), [apiKey, workspaceId], Boolean(apiKey));
  const datasets = datasetsQuery.data ?? [];
  const filtered = useMemo(() => datasets.filter((dataset) => `${dataset.name} ${dataset.domain}`.toLowerCase().includes(search.toLowerCase())), [datasets, search]);
  const newDatasetHref = workspaceHref(workspaceSlug, "/datasets/new");

  return (
    <div className="mx-auto w-full max-w-[1000px] animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between"><h1 className="text-[22px] font-semibold tracking-tight text-foreground">Datasets</h1><div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"><div className="flex h-9 w-full items-center gap-2 rounded-lg border border-border/60 bg-card px-3 shadow-sm sm:w-[260px]"><Search className="h-4 w-4 text-muted-foreground/50" /><input className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/45" placeholder="Search Datasets" value={search} onChange={(event) => setSearch(event.target.value)} /></div><Link href={newDatasetHref}><Button className="h-9 w-full rounded-lg px-3 text-[13px] shadow-sm sm:w-auto"><Plus className="h-4 w-4" />Create</Button></Link></div></div>
      {datasetsQuery.error ? <InlineError message={datasetsQuery.error} /> : datasetsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading datasets...</p> : filtered.length === 0 ? <EmptyState icon={<Database className="h-10 w-10" />} title="No datasets yet" description="Create your first dataset to start building a source of truth." action={<Link href={newDatasetHref}><Button><Plus className="h-4 w-4" /> Create dataset</Button></Link>} /> : <DatasetTable datasets={filtered} workspaceSlug={workspaceSlug} apiKey={apiKey!} />}
    </div>
  );
}

function DatasetTable({ datasets, workspaceSlug, apiKey }: { datasets: Awaited<ReturnType<typeof listDatasets>>; workspaceSlug?: string; apiKey: string }) {
  return <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"><div className="hidden grid-cols-[minmax(120px,0.7fr)_minmax(240px,1.3fr)_minmax(150px,0.8fr)_minmax(110px,0.6fr)_40px] border-b border-border/60 bg-secondary/30 px-4 py-3 text-[12px] font-semibold text-foreground/80 md:grid"><div>ID</div><div>Name</div><div>Created</div><div>Documents</div><div /></div><div className="divide-y divide-border/60">{datasets.map((dataset, index) => <DatasetRow key={dataset.dataset_id} dataset={dataset} index={index} workspaceSlug={workspaceSlug} apiKey={apiKey} />)}</div></div>;
}

function DatasetRow({ dataset, index, workspaceSlug, apiKey }: { dataset: Awaited<ReturnType<typeof listDatasets>>[number]; index: number; workspaceSlug?: string; apiKey: string }) {
  const docs = useApiQuery(() => listDatasetDocuments(apiKey, dataset.dataset_id), [apiKey, dataset.dataset_id], Boolean(apiKey));
  return <Link href={workspaceHref(workspaceSlug, `/datasets/${dataset.dataset_id}`)} className={cn("group grid gap-3 px-4 py-4 transition-colors hover:bg-secondary/30 md:grid-cols-[minmax(120px,0.7fr)_minmax(240px,1.3fr)_minmax(150px,0.8fr)_minmax(110px,0.6fr)_40px] md:items-center", `animate-slide-up delay-${Math.min(index + 1, 6)}`)}><div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground md:block"><span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">ID</span><span className="font-mono">{dataset.dataset_id.slice(0, 8)}</span></div><div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><span className="truncate text-[14px] font-semibold text-foreground">{dataset.name}</span>{dataset.allow_web_fallback ? <Badge tone="accent" size="sm" className="h-5 bg-sky-100 text-[10px] text-sky-700 dark:bg-sky-950 dark:text-sky-300">Web</Badge> : null}</div><p className="mt-1 truncate text-[12px] text-muted-foreground md:hidden">{dataset.domain}</p></div><div className="flex items-center gap-2 text-[13px] text-muted-foreground"><span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">Created</span>{formatDate(dataset.created_at)}</div><div className="flex items-center gap-2 text-[13px] font-semibold text-foreground"><span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">Documents</span>{docs.data?.length ?? "..."}</div><div className="hidden justify-end md:flex"><span className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:bg-secondary group-hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></span></div></Link>;
}

function InlineError({ message }: { message: string }) {
  return <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{message}</div>;
}
