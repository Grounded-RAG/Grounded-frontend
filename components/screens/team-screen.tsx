import { KeyRound, Mail, Plus, RotateCcw, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { teamMembers, workspaces } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";

const roleTones: Record<string, "accent" | "warn" | "neutral"> = { admin: "accent", member: "neutral", viewer: "neutral" };

export function TeamScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const active = teamMembers.filter((m) => m.joined_at);
  const pending = teamMembers.filter((m) => !m.joined_at);

  return (
    <div className="page-grid animate-fade-in">
      <PageHeader description="Manage members, roles, and workspace access for your organization." action="Invite member" />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title={`Members (${active.length})`} />
            <div className="grid gap-2">
              {active.map((m) => (
                <div key={m.user_id} className="flex flex-col gap-3 rounded-xl border border-border/15 bg-secondary/8 p-4 transition-colors hover:bg-secondary/15 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-foreground/[0.06] flex items-center justify-center border border-border/20 text-sm font-bold text-foreground/70">
                      {m.full_name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.full_name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {m.has_api_key && <Badge tone="neutral" size="sm" className="text-[9px]"><KeyRound className="h-2.5 w-2.5 mr-1" />API</Badge>}
                    <Badge tone={roleTones[m.role]} size="sm" className="capitalize">{m.role}</Badge>
                    {m.last_active_at && <span className="text-[10px] text-muted-foreground/50 hidden sm:block">{formatDate(m.last_active_at)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {pending.length > 0 && (
            <Card variant="glass" className="rounded-2xl">
              <CardHeader title={`Pending invites (${pending.length})`} />
              <div className="grid gap-2">
                {pending.map((m) => (
                  <div key={m.user_id} className="flex flex-col gap-3 rounded-xl border border-border/15 bg-secondary/8 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-foreground/[0.03] border border-dashed border-border/40 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.email}</p>
                        <p className="text-xs text-muted-foreground">Invited {formatDate(m.invited_at)} · {m.role}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-1"><RotateCcw className="h-3 w-3" />Resend</Button>
                      <Badge tone="warn" size="sm">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
        <div className="grid content-start gap-6">
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Roles" />
            <div className="grid gap-3">
              {[
                { role: "Admin", desc: "Full access to all settings, billing, and governance" },
                { role: "Member", desc: "Create and manage datasets, agents, and conversations" },
                { role: "Viewer", desc: "Read-only access to runs, dashboards, and reports" },
              ].map((r) => (
                <div key={r.role} className="rounded-xl border border-border/15 bg-secondary/8 p-3">
                  <p className="text-[13px] font-semibold text-foreground">{r.role}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Quick invite" />
            <div className="grid gap-3">
              <Input label="Email" type="email" placeholder="colleague@company.com" />
              <select className="flex h-9 w-full rounded-full border border-border/80 bg-input px-4 text-[13px] text-foreground outline-none focus:ring-2 focus:ring-foreground/10">
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
              <Button className="w-full rounded-xl" size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />Send invite</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
