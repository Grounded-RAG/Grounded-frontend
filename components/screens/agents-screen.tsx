import Link from "next/link";
import { Bot, MoreHorizontal, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { agents, datasets } from "@/lib/mock-data";
import { cn, formatDate, workspaceHref } from "@/lib/utils";

export function AgentsScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const newAgentHref = workspaceHref(workspaceSlug, "/agents/new");

  return (
    <div className="animate-fade-in mx-auto w-full max-w-[1000px]">
      <div className="mb-6 flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Agents</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex h-9 w-full items-center gap-2 rounded-lg border border-border/60 bg-card px-3 shadow-sm transition-colors focus-within:border-foreground/20 sm:w-[260px]">
            <Search className="h-4 w-4 text-muted-foreground/50" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/45"
              placeholder="Search Agents"
            />
          </div>
          <Link href={newAgentHref}>
            <Button className="h-9 w-full rounded-lg px-3 text-[13px] shadow-sm sm:w-auto">
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </Link>
        </div>
      </div>

      {agents.length === 0 ? (
        <EmptyState icon={<Bot className="h-10 w-10" />} title="No agents yet" description="Create your first agent to start asking grounded questions." action={<Link href={newAgentHref}><Button><Plus className="h-4 w-4" /> Create agent</Button></Link>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="hidden grid-cols-[minmax(120px,0.7fr)_minmax(240px,1.25fr)_minmax(120px,0.6fr)_minmax(130px,0.7fr)_minmax(130px,0.7fr)_40px] border-b border-border/60 bg-secondary/30 px-4 py-3 text-[12px] font-semibold text-foreground/80 md:grid">
            <div>ID</div>
            <div>Name</div>
            <div>Status</div>
            <div>Datasets</div>
            <div>Updated</div>
            <div />
          </div>
          <div className="divide-y divide-border/60">
            {agents.map((agent, index) => {
              const attachedDatasets = agent.dataset_ids
                .map((id) => datasets.find((dataset) => dataset.dataset_id === id)?.name)
                .filter(Boolean);

              return (
                <Link
                  href={workspaceHref(workspaceSlug, `/agents/${agent.agent_id}`)}
                  key={agent.agent_id}
                  className={cn(
                    "group grid gap-3 px-4 py-4 transition-colors hover:bg-secondary/30 md:grid-cols-[minmax(120px,0.7fr)_minmax(240px,1.25fr)_minmax(120px,0.6fr)_minmax(130px,0.7fr)_minmax(130px,0.7fr)_40px] md:items-center",
                    `animate-slide-up delay-${Math.min(index + 1, 6)}`,
                  )}
                >
                  <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground md:block">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">ID</span>
                    <span className="font-mono">{agent.agent_id.replace("ag_", "")}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-[14px] font-semibold text-foreground">{agent.name}</span>
                      <Badge tone="neutral" size="sm" className="h-5 text-[10px] capitalize">
                        {agent.default_mode}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-[12px] text-muted-foreground md:hidden">{agent.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">Status</span>
                    <Badge tone={agent.status === "active" ? "success" : "neutral"} dot size="sm" className="capitalize">
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">Datasets</span>
                    <span className="truncate">
                      {attachedDatasets.length > 0 ? attachedDatasets.join(", ") : "None"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 md:hidden">Updated</span>
                    {formatDate(agent.updated_at)}
                  </div>
                  <div className="hidden justify-end md:flex">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:bg-secondary group-hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
