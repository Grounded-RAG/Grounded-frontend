import Link from "next/link";
import { Bot, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ModeBadge } from "@/components/ui/status";
import { agents } from "@/lib/mock-data";
import { formatDate, workspaceHref } from "@/lib/utils";

export function AgentsScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const newAgentHref = workspaceHref(workspaceSlug, "/agents/new");
  return (
    <div className="page-grid animate-fade-in">
      <PageHeader eyebrow="Agents" title="Reusable grounded assistants" description="Agents combine instructions, allowed modes, and attached datasets into a repeatable intelligence surface." action="New agent" actionHref={newAgentHref} />

      <div className="flex h-10 items-center gap-3 rounded-full glass px-4 transition-colors focus-within:ring-1 focus-within:ring-ring/20">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50" placeholder="Search agents..." />
      </div>

      {agents.length === 0 ? (
        <EmptyState icon={<Bot className="h-10 w-10" />} title="No agents yet" description="Create your first agent to start asking grounded questions." action={<Link href={newAgentHref}><Button><Plus className="h-4 w-4" /> Create agent</Button></Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent, i) => (
            <Link href={workspaceHref(workspaceSlug, `/agents/${agent.agent_id}`)} key={agent.agent_id}>
              <Card variant="glass" interactive className={`h-full rounded-2xl animate-slide-up delay-${Math.min(i + 1, 6)}`}>
                <div className="flex items-start justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-foreground/8">
                    <Bot className="h-4 w-4 text-foreground" />
                  </div>
                  <Badge tone={agent.status === "active" ? "success" : "neutral"} dot size="sm">{agent.status}</Badge>
                </div>
                <h2 className="mt-4 text-base font-semibold text-foreground">{agent.name}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">{agent.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <ModeBadge mode={agent.default_mode} />
                  <Badge size="sm">{agent.dataset_ids.length} dataset{agent.dataset_ids.length !== 1 ? "s" : ""}</Badge>
                </div>
                <div className="mt-4 border-t border-border/15 pt-3">
                  <p className="text-xs text-muted-foreground">Updated {formatDate(agent.updated_at)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
