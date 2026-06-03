"use client";

import { useEffect, useState } from "react";
import { KeyRound, Shield } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCapabilities, updateWorkspace } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApiQuery } from "@/lib/use-api-query";

export function SettingsScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const { apiKey, auth, workspaces, workspaceId, refreshWorkspaces, setWorkspace } = useAuth();
  const workspace = workspaces.find((item) => item.slug === workspaceSlug) ?? workspaces.find((item) => item.workspace_id === workspaceId) ?? workspaces[0];
  const capabilities = useApiQuery(() => getCapabilities(apiKey!), [apiKey], Boolean(apiKey));
  const [wsName, setWsName] = useState("");
  const [wsSlug, setWsSlug] = useState("");
  const [wsDesc, setWsDesc] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { if (workspace) { setWsName(workspace.name); setWsSlug(workspace.slug); setWsDesc(workspace.description ?? ""); } }, [workspace?.workspace_id]);

  async function saveWorkspace() {
    if (!apiKey || !workspace) return;
    const updated = await updateWorkspace(apiKey, workspace.workspace_id, { name: wsName, slug: wsSlug, description: wsDesc });
    setWorkspace(updated.workspace_id, updated.name, updated.slug);
    await refreshWorkspaces();
    setMessage("Workspace updated.");
  }

  return (
    <div className="page-grid animate-fade-in">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Configure workspace identity, plan, modes, and security preferences."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Workspace identity" />
          <div className="grid gap-4">
            <Input label="Workspace name" value={wsName} onChange={(event) => setWsName(event.target.value)} />
            <Input label="Slug" value={wsSlug} onChange={(event) => setWsSlug(event.target.value)} helperText="Used in URLs: /app/workspace/your-slug" />
            <Input label="Description" value={wsDesc} onChange={(event) => setWsDesc(event.target.value)} />
            <Button className="w-fit rounded-xl" size="sm" onClick={saveWorkspace}>Save changes</Button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </div>
        </Card>
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Plan and entitlement" />
          <dl className="grid gap-3 text-sm">
            <Row label="Plan" value={auth?.subscription_plan ?? "-"} />
            <Row label="Maximum execution tier" value={auth?.max_execution_tier ?? "-"} />
            <Row label="Manual mode override" value={capabilities.data?.manual_mode_override_allowed ? "Allowed" : "Not allowed"} />
            <Row label="Organization" value={auth?.tenant_name ?? "-"} />
          </dl>
        </Card>
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Mode availability" />
          <div className="grid gap-2">
            {(capabilities.data?.modes ?? []).map((mode) => (
              <div className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-3" key={mode.mode}>
                <div>
                  <p className="text-sm font-semibold text-foreground">{mode.label}</p>
                  <p className="text-xs text-muted-foreground">{mode.description}</p>
                </div>
                <Badge tone="success" dot size="sm">Live</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="glass" className="rounded-2xl">
          <CardHeader title="Security" />
          <div className="grid gap-4">
            <SecurityRow icon={<Shield className="h-4 w-4 text-foreground/60" />} title="Single Sign-On (SSO)" desc="SAML 2.0 or OIDC configuration" badge="Not configured" />
            <SecurityRow icon={<KeyRound className="h-4 w-4 text-foreground/60" />} title="Multi-Factor Authentication" desc="Require MFA for all team members" badge="Admin only" />
          </div>
          <div className="mt-5 border-t border-border/15 pt-4">
            <p className="text-xs text-muted-foreground">Session management and advanced security settings are not exposed by the current backend contract.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-border/10 pb-2 last:border-0 last:pb-0"><dt className="text-muted-foreground">{label}</dt><dd className="font-medium text-foreground/80">{value}</dd></div>; }
function SecurityRow({ icon, title, desc, badge }: { icon: React.ReactNode; title: string; desc: string; badge: string }) { return <div className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/[0.04]">{icon}</div><div><p className="text-sm font-semibold text-foreground">{title}</p><p className="text-xs text-muted-foreground">{desc}</p></div></div><Badge tone="neutral" size="sm">{badge}</Badge></div>; }
