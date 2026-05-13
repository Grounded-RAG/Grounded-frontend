import { Lock, Users, Shield, BookOpen, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { capabilities, tenant } from "@/lib/mock-data";

export function SettingsScreen() {
  return (
    <div className="page-grid animate-fade-in">
      <PageHeader eyebrow="Settings" title="Workspace settings" description="Live settings are complete. Future admin surfaces are clearly marked." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Plan and entitlement" />
          <dl className="grid gap-3 text-sm">
            <Row label="Plan" value={tenant.subscription_plan} />
            <Row label="Maximum execution tier" value={tenant.max_execution_tier} />
            <Row label="Manual mode override" value="Allowed" />
            <Row label="Organization" value={tenant.tenant_name} />
          </dl>
        </Card>

        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Mode availability" />
          <div className="grid gap-2">
            {capabilities.map((mode) => (
              <div className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-3" key={mode.mode}>
                <div>
                  <p className="text-sm font-semibold text-foreground">{mode.label}</p>
                  <p className="text-xs text-muted-foreground">{mode.description}</p>
                </div>
                <Badge tone={mode.enabled ? "success" : mode.availability_reason === "coming_soon" ? "warn" : "neutral"} dot size="sm">
                  {mode.enabled ? "Live" : mode.availability_reason === "coming_soon" ? "Coming soon" : "Restricted"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { icon: Users, label: "Team members" },
          { icon: Shield, label: "Roles & permissions" },
          { icon: Lock, label: "Security" },
          { icon: BookOpen, label: "Audit controls" },
          { icon: CreditCard, label: "Billing" },
        ].map((item) => (
          <Card variant="glass" key={item.label} className="text-center rounded-2xl">
            <item.icon className="mx-auto h-5 w-5 text-muted-foreground/30" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">{item.label}</h3>
            <Badge className="mt-2" tone="warn" size="sm">Coming soon</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/10 pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground/80">{value}</dd>
    </div>
  );
}
