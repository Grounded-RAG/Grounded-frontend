"use client";

import { useState } from "react";
import { KeyRound, Shield } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { capabilities, organization, workspaces } from "@/lib/mock-data";

export function SettingsScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const workspace = workspaces.find((w) => w.slug === workspaceSlug) ?? workspaces[0];
  const [wsName, setWsName] = useState(workspace.name);
  const [wsSlug, setWsSlug] = useState(workspace.slug);
  const [wsDesc, setWsDesc] = useState(workspace.description);

  return (
    <div className="page-grid animate-fade-in">
      <PageHeader eyebrow="Settings" title="Workspace settings" description="Configure workspace identity, plan, modes, and security preferences." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workspace identity */}
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Workspace identity" />
          <div className="grid gap-4">
            <Input label="Workspace name" value={wsName} onChange={(e) => setWsName(e.target.value)} />
            <Input label="Slug" value={wsSlug} onChange={(e) => setWsSlug(e.target.value)} helperText="Used in URLs: /app/workspace/your-slug" />
            <Input label="Description" value={wsDesc} onChange={(e) => setWsDesc(e.target.value)} />
            <Button className="w-fit rounded-xl" size="sm">Save changes</Button>
          </div>
        </Card>

        {/* Plan and entitlement */}
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Plan and entitlement" />
          <dl className="grid gap-3 text-sm">
            <Row label="Plan" value={organization.subscription_plan} />
            <Row label="Maximum execution tier" value={organization.max_execution_tier} />
            <Row label="Manual mode override" value="Allowed" />
            <Row label="Organization" value={organization.name} />
          </dl>
          <div className="mt-5 pt-4 border-t border-border/15">
            <Button variant="outline" size="sm" className="rounded-xl text-xs">Upgrade plan</Button>
          </div>
        </Card>

        {/* Mode availability */}
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Mode availability" />
          <div className="grid gap-2">
            {capabilities.map((mode) => (
              <div className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-3" key={mode.mode}>
                <div>
                  <p className="text-sm font-semibold text-foreground">{mode.label}</p>
                  <p className="text-xs text-muted-foreground">{mode.description}</p>
                </div>
                <Badge tone={mode.enabled ? "success" : "neutral"} dot size="sm">
                  {mode.enabled ? "Live" : "Restricted"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Security" />
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-foreground/[0.04] flex items-center justify-center">
                  <Shield className="h-4 w-4 text-foreground/60" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Single Sign-On (SSO)</p>
                  <p className="text-xs text-muted-foreground">SAML 2.0 or OIDC configuration</p>
                </div>
              </div>
              <Badge tone="neutral" size="sm">Not configured</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-foreground/[0.04] flex items-center justify-center">
                  <KeyRound className="h-4 w-4 text-foreground/60" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Multi-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Require MFA for all team members</p>
                </div>
              </div>
              <Badge tone="accent" size="sm">Admin only</Badge>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-border/15">
            <p className="text-xs text-muted-foreground">Session management and advanced security settings are available for Enterprise plans.</p>
          </div>
        </Card>
      </div>

      {/* Danger zone */}
      <Card variant="glass" className="rounded-2xl border-destructive/20">
        <CardHeader title="Danger zone" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Delete workspace</p>
            <p className="text-xs text-muted-foreground mt-0.5">Permanently remove this workspace and all associated data. This cannot be undone.</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0">
            Delete workspace
          </Button>
        </div>
      </Card>
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
