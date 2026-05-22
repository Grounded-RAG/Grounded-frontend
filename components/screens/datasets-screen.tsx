import Link from "next/link";
import { Database, Plus, Search, ShieldAlert, Globe, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { datasets } from "@/lib/mock-data";
import { cn, formatDate, workspaceHref } from "@/lib/utils";

export function DatasetsScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const newDatasetHref = workspaceHref(workspaceSlug, "/datasets/new");
  return (
    <div className="animate-fade-in w-full max-w-[1200px] mx-auto space-y-6 sm:space-y-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Knowledge Base</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">Datasets</h1>
          <p className="text-[14px] text-muted-foreground/80 mt-2 max-w-xl font-light">
            Manage the source-of-truth collections that power your grounded intelligence agents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={newDatasetHref}>
            <Button className="h-10 px-5 rounded-full shadow-sm text-[13px]">
              <Plus className="mr-2 h-4 w-4" />
              New Dataset
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Controls ─── */}
      <div className="flex items-center gap-4">
        <div className="flex h-11 flex-1 max-w-md items-center gap-3 rounded-2xl border border-border/30 bg-foreground/[0.02] px-4 transition-all focus-within:bg-foreground/[0.04] focus-within:ring-1 focus-within:ring-foreground/20 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground/70" />
          <input className="flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/50" placeholder="Search by name, domain, or policy..." />
        </div>
      </div>

      {/* ─── Data List ─── */}
      {datasets.length === 0 ? (
        <EmptyState icon={<Database className="h-10 w-10" />} title="No datasets yet" description="Create your first dataset to start building a source of truth." action={<Link href={newDatasetHref}><Button><Plus className="h-4 w-4" /> Create dataset</Button></Link>} />
      ) : (
        <Card variant="glass" className="rounded-[2rem] overflow-hidden p-2 sm:p-3">
          <div className="grid gap-2">
            {datasets.map((dataset, i) => (
              <Link href={workspaceHref(workspaceSlug, `/datasets/${dataset.dataset_id}`)} key={dataset.dataset_id}>
                <div className={cn("group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[1.5rem] p-4 sm:p-5 border border-transparent transition-all duration-300 hover:bg-foreground/[0.03] hover:border-border/20", `animate-slide-up delay-${Math.min(i + 1, 6)}`)}>
                  
                  {/* Left Column: Icon & Name */}
                  <div className="flex items-center gap-4 sm:w-[35%]">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-foreground/[0.04] border border-border/20 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <Database className="h-5 w-5 text-foreground/70" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[15px] font-semibold text-foreground truncate">{dataset.name}</h2>
                      <p className="text-[13px] text-muted-foreground/70 truncate">{dataset.domain}</p>
                    </div>
                  </div>

                  {/* Middle Column: Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-3 sm:w-[45%]">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/20 border border-border/10 text-[11px] text-muted-foreground font-medium">
                      <ShieldAlert className="h-3.5 w-3.5 text-foreground/50" />
                      {dataset.sensitivity_level}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/20 border border-border/10 text-[11px] text-muted-foreground font-medium">
                      <Clock className="h-3.5 w-3.5 text-foreground/50" />
                      {dataset.freshness_profile}
                    </div>
                    {dataset.allow_web_fallback && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/20 border border-border/10 text-[11px] text-muted-foreground font-medium">
                        <Globe className="h-3.5 w-3.5 text-foreground/50" />
                        Web allowed
                      </div>
                    )}
                  </div>

                  {/* Right Column: Status & Arrow */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-[20%]">
                    <div className="text-right hidden sm:block">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground/50 mb-0.5">Execution</p>
                      <Badge tone={dataset.min_execution_tier === "standard" ? "accent" : "warn"} size="sm" className="h-5 text-[10px]">
                        {dataset.min_execution_tier}
                      </Badge>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-foreground/[0.05] border border-border/10 flex items-center justify-center transition-all duration-300 group-hover:bg-foreground/[0.1] group-hover:border-border/30">
                      <ChevronRight className="h-4 w-4 text-foreground/60 group-hover:text-foreground" />
                    </div>
                  </div>
                  
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
