import Link from "next/link";
import { Database, MoreHorizontal, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { datasets, documents } from "@/lib/mock-data";
import { cn, formatDate, workspaceHref } from "@/lib/utils";

export function DatasetsScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const newDatasetHref = workspaceHref(workspaceSlug, "/datasets/new");
  const documentCounts = documents.reduce<Record<string, number>>((acc, document) => {
    acc[document.dataset_id] = (acc[document.dataset_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in mx-auto w-full max-w-[1000px]">
      <div className="mb-6 flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Datasets</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex h-9 w-full items-center gap-2 rounded-lg border border-border/60 bg-card px-3 shadow-sm transition-colors focus-within:border-foreground/20 sm:w-[260px]">
            <Search className="h-4 w-4 text-muted-foreground/50" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/45"
              placeholder="Search Datasets"
            />
          </div>
          <Link href={newDatasetHref}>
            <Button className="h-9 w-full rounded-lg px-3 text-[13px] shadow-sm sm:w-auto">
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </Link>
        </div>
      </div>

      {datasets.length === 0 ? (
        <EmptyState icon={<Database className="h-10 w-10" />} title="No datasets yet" description="Create your first dataset to start building a source of truth." action={<Link href={newDatasetHref}><Button><Plus className="h-4 w-4" /> Create dataset</Button></Link>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="hidden grid-cols-[minmax(120px,0.7fr)_minmax(240px,1.3fr)_minmax(150px,0.8fr)_minmax(110px,0.6fr)_40px] border-b border-border/60 bg-secondary/30 px-4 py-3 text-[12px] font-semibold text-foreground/80 md:grid">
            <div>ID</div>
            <div>Name</div>
            <div>Created</div>
            <div>Documents</div>
            <div />
          </div>
          <div className="divide-y divide-border/60">
            {datasets.map((dataset, index) => (
              <Link
                href={workspaceHref(workspaceSlug, `/datasets/${dataset.dataset_id}`)}
                key={dataset.dataset_id}
                className={cn(
                  "group grid gap-3 px-4 py-4 transition-colors hover:bg-secondary/30 md:grid-cols-[minmax(120px,0.7fr)_minmax(240px,1.3fr)_minmax(150px,0.8fr)_minmax(110px,0.6fr)_40px] md:items-center",
                  `animate-slide-up delay-${Math.min(index + 1, 6)}`,
                )}
              >
                <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground md:block">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">ID</span>
                  <span className="font-mono">{dataset.dataset_id.replace("ds_", "")}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-[14px] font-semibold text-foreground">{dataset.name}</span>
                    {dataset.allow_web_fallback ? (
                      <Badge tone="accent" size="sm" className="h-5 bg-sky-100 text-[10px] text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        Web
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-[12px] text-muted-foreground md:hidden">{dataset.description}</p>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">Created</span>
                  {formatDate(dataset.created_at)}
                </div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">Documents</span>
                  {documentCounts[dataset.dataset_id] ?? 0}
                </div>
                <div className="hidden justify-end md:flex">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:bg-secondary group-hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
