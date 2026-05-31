"use client";

import { useState } from "react";
import { AlertTriangle, Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApiQuery } from "@/lib/use-api-query";
import { formatDate } from "@/lib/utils";

export function ApiKeysScreen() {
  const { apiKey } = useAuth();
  const keysQuery = useApiQuery(() => listApiKeys(apiKey!), [apiKey], Boolean(apiKey));
  const [label, setLabel] = useState("Frontend key");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (!apiKey || !label.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createApiKey(apiKey, label.trim());
      setNewKey(created.api_key);
      setLabel("Frontend key");
      await keysQuery.reload();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create key"); }
    finally { setIsSubmitting(false); }
  }

  async function handleRevoke(keyId: string) {
    if (!apiKey) return;
    await revokeApiKey(apiKey, keyId);
    await keysQuery.reload();
  }

  return <div className="page-grid animate-fade-in"><PageHeader eyebrow="API keys" title="Developer access" description="Create keys, revoke keys, and copy new raw keys exactly once after creation." />
    <Card variant="glass" className="rounded-2xl"><CardHeader title="Create key" eyebrow="Authenticated endpoint" /><div className="flex flex-col gap-3 sm:flex-row"><Input label="Label" value={label} onChange={(event) => setLabel(event.target.value)} /><Button onClick={handleCreate} disabled={isSubmitting || !label.trim()} className="self-end"><Plus className="h-4 w-4" />{isSubmitting ? "Creating" : "Create key"}</Button></div>{error ? <p className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}</Card>
    {newKey ? <Card variant="glass" className="rounded-2xl border-amber-500/15"><CardHeader title="New key created" eyebrow="Copy-once receipt" /><div className="flex items-start gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 p-4"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" /><div className="min-w-0 flex-1"><p className="break-all text-sm font-medium text-amber-700 dark:text-amber-300">{newKey}</p><p className="mt-1 text-xs text-amber-600/70 dark:text-amber-400/70">This key is shown once and cannot be recovered.</p></div><Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(newKey)}><Copy className="h-3.5 w-3.5" /> Copy</Button></div></Card> : null}
    <Card variant="glass" className="rounded-2xl"><CardHeader title={`Keys (${keysQuery.data?.length ?? 0})`} />{keysQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading keys...</p> : <div className="grid gap-2">{(keysQuery.data ?? []).map((key) => <div className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-4 transition-colors hover:bg-secondary/15" key={key.key_id}><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/50"><KeyRound className="h-4 w-4 text-muted-foreground" /></div><div><p className="text-sm font-semibold text-foreground">{key.label}</p><p className="text-xs text-muted-foreground">Created {formatDate(key.created_at)}{key.last_used_at ? ` · Last used ${formatDate(key.last_used_at)}` : " · Never used"}</p></div></div><div className="flex items-center gap-2"><Badge tone={key.revoked_at ? "danger" : "success"} dot size="sm">{key.revoked_at ? "Revoked" : "Active"}</Badge>{!key.revoked_at && <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleRevoke(key.key_id)}><Trash2 className="h-4 w-4" /></Button>}</div></div>)}</div>}</Card>
  </div>;
}
