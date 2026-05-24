import Link from "next/link";
import { Bot, MoreHorizontal, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { flatCardSurfaceClass } from "@/components/ui/card-surface";
import { agents } from "@/lib/mock-data";
import { cn, workspaceHref } from "@/lib/utils";

const tableCols = "md:grid-cols-[minmax(160px,0.45fr)_1fr_40px]";

export function AgentsScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const newAgentHref = workspaceHref(workspaceSlug, "/agents/new");

  return (
    <div className="animate-fade-in w-full space-y-5">
      <div className={cn(flatCardSurfaceClass, "w-full space-y-5 p-5")}>
        <div className="page-toolbar">
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="search-input w-full sm:min-w-[240px] sm:w-[280px]">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                placeholder="Search Agents"
              />
            </div>
            <Link href={newAgentHref} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                New Agent
              </Button>
            </Link>
          </div>
        </div>

        {agents.length === 0 ? (
          <EmptyState
            icon={<Bot className="h-10 w-10" />}
            title="No agents yet"
            description="Create your first agent to start asking grounded questions."
            action={
              <Link href={newAgentHref}>
                <Button>
                  <Plus className="h-4 w-4" /> Create agent
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="data-table-scroll">
            <div className="data-table-inner">
              <div className={cn("hidden border-b border-border/30 pb-3 text-xs font-semibold text-muted-foreground md:grid", tableCols)}>
                <div>Name</div>
                <div>Description</div>
                <div />
              </div>
              <div className="divide-y divide-border/20">
                {agents.map((agent, index) => (
                  <Link
                    href={workspaceHref(workspaceSlug, `/agents/${agent.agent_id}`)}
                    key={agent.agent_id}
                    className={cn(
                      "group grid gap-1 py-4 transition-colors hover:bg-muted/20 md:gap-3 md:items-center",
                      tableCols,
                      `animate-slide-up delay-${Math.min(index + 1, 6)}`,
                    )}
                  >
                    <div className="min-w-0">
                      <span className="truncate text-sm font-semibold text-foreground">{agent.name}</span>
                    </div>
                    <div className="min-w-0 text-sm text-muted-foreground">
                      <span className="line-clamp-2 md:line-clamp-1 md:truncate">{agent.description || "No description"}</span>
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
