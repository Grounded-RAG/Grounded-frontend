import Link from "next/link";
import { Database, MoreHorizontal, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { flatCardSurfaceClass } from "@/components/ui/card-surface";
import { datasets, documents } from "@/lib/mock-data";
import { cn, formatDate, workspaceHref } from "@/lib/utils";

const tableCols =
  "md:grid-cols-[minmax(100px,0.5fr)_minmax(180px,1.2fr)_minmax(120px,0.7fr)_minmax(90px,0.5fr)_40px]";

export function DatasetsScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const newDatasetHref = workspaceHref(workspaceSlug, "/datasets/new");
  const documentCounts = documents.reduce<Record<string, number>>((acc, document) => {
    acc[document.dataset_id] = (acc[document.dataset_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in w-full space-y-5">
      <div className={cn(flatCardSurfaceClass, "w-full space-y-5 p-5")}>
        <div className="page-toolbar">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="search-input w-full sm:min-w-[240px] sm:w-[280px]">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                placeholder="Search Datasets"
              />
            </div>
            <Link href={newDatasetHref} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </Link>
          </div>
        </div>

        {datasets.length === 0 ? (
          <EmptyState
            icon={<Database className="h-10 w-10" />}
            title="No datasets yet"
            description="Create your first dataset to start building a source of truth."
            action={
              <Link href={newDatasetHref}>
                <Button>
                  <Plus className="h-4 w-4" /> Create dataset
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="data-table-scroll">
            <div className="data-table-inner">
              <div className={cn("hidden border-b border-border/30 pb-3 text-xs font-semibold text-muted-foreground md:grid", tableCols)}>
                <div>ID</div>
                <div>Name</div>
                <div>Created</div>
                <div>Documents</div>
                <div />
              </div>
              <div className="divide-y divide-border/20">
                {datasets.map((dataset, index) => (
                  <Link
                    href={workspaceHref(workspaceSlug, `/datasets/${dataset.dataset_id}`)}
                    key={dataset.dataset_id}
                    className={cn(
                      "group grid gap-2 py-4 transition-colors hover:bg-muted/20 sm:gap-3 md:items-center",
                      tableCols,
                      `animate-slide-up delay-${Math.min(index + 1, 6)}`,
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground md:block">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">ID</span>
                      <span className="font-mono text-xs">{dataset.dataset_id.replace("ds_", "")}</span>
                      {dataset.allow_web_fallback ? (
                        <Badge tone="accent" size="sm" className="h-5 bg-sky-100 text-[10px] text-sky-700">
                          Demo
                        </Badge>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <span className="truncate text-sm font-semibold text-foreground">{dataset.name}</span>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground md:hidden">{dataset.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">Created</span>
                      {formatDate(dataset.created_at)}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">Documents</span>
                      {documentCounts[dataset.dataset_id] ?? 0}
                    </div>
                    <div className="hidden justify-end md:flex">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors group-hover:bg-muted/40 group-hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
