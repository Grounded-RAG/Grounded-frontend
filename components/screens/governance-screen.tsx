import { Clock, Edit2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { governancePolicies, auditLog } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  Data: "bg-muted text-muted-foreground",
  Retrieval: "bg-muted text-muted-foreground",
  Execution: "bg-foreground/5 text-foreground",
  Security: "bg-foreground/5 text-foreground",
};

export function GovernanceScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  return (
    <div className="page-grid animate-fade-in">
      <PageHeader description="Configure organization-wide policies, data controls, and audit settings." />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-6">
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Policies" eyebrow="Organization defaults" />
            <div className="grid gap-2">
              {governancePolicies.map((p) => (
                <div key={p.policy_id} className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-4 hover:bg-secondary/15 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-foreground/[0.04] flex items-center justify-center border border-border/20">
                      <ShieldCheck className="h-4 w-4 text-foreground/60" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-medium rounded-md px-2 py-0.5 ${categoryColors[p.category] ?? "bg-foreground/5 text-muted-foreground"}`}>{p.category}</span>
                    <Badge tone="neutral" size="sm">{p.value}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Identity & Access" eyebrow="Security" />
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "SAML SSO", status: "Not configured", tone: "neutral" as const },
                { label: "OIDC SSO", status: "Not configured", tone: "neutral" as const },
                { label: "MFA enforcement", status: "Admin only", tone: "accent" as const },
                { label: "Session timeout", status: "24 hours", tone: "neutral" as const },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-3">
                  <span className="text-[13px] font-medium text-foreground">{item.label}</span>
                  <Badge tone={item.tone} size="sm">{item.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Audit log" eyebrow="Recent activity" />
          <div className="grid gap-3">
            {auditLog.map((entry) => (
              <div key={entry.entry_id} className="relative pl-6 pb-4 last:pb-0">
                <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-foreground/20 bg-background" />
                {entry.entry_id !== auditLog[auditLog.length - 1].entry_id && (
                  <div className="absolute left-[5px] top-4 bottom-0 w-px bg-border/30" />
                )}
                <p className="text-[13px] font-medium text-foreground">{entry.action}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{entry.detail}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground/60">{entry.actor}</span>
                  <span className="text-[10px] text-muted-foreground/40">·</span>
                  <span className="text-[10px] text-muted-foreground/60">{formatDate(entry.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
