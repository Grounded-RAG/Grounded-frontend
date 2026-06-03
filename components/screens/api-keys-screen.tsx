"use client";

import { useState } from "react";
import { AlertTriangle, Check, Copy, KeyRound, Plus, Shield, Trash2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApiQuery } from "@/lib/use-api-query";
import { formatDate } from "@/lib/utils";

export function ApiKeysScreen() {
  const { apiKey } = useAuth();
  const keysQuery = useApiQuery(() => listApiKeys(apiKey!), [apiKey], Boolean(apiKey));
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!apiKey || !label.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createApiKey(apiKey, label.trim());
      setNewKey(created.api_key);
      setLabel("");
      await keysQuery.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create key");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRevoke(keyId: string) {
    if (!apiKey) return;
    await revokeApiKey(apiKey, keyId);
    await keysQuery.reload();
  }

  function copyKey() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeKeys = (keysQuery.data ?? []).filter((k) => !k.revoked_at);
  const revokedKeys = (keysQuery.data ?? []).filter((k) => k.revoked_at);

  return (
    <div className="mx-auto w-full max-w-3xl animate-fade-in space-y-8">
      {/* Page header */}
      <div className="border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Developer</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">API Keys</h1>
        <p className="mt-1.5 text-[14px] text-zinc-500 dark:text-zinc-400">
          Create and manage keys for programmatic access to Grounded.
        </p>
      </div>

      {/* What is an API key? */}
      <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-zinc-500" />
          <h2 className="text-[15px] font-bold text-zinc-900 dark:text-white">What is an API key?</h2>
        </div>
        <p className="mb-4 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          An <strong className="font-semibold text-zinc-800 dark:text-zinc-200">API key</strong> is a secret credential that lets your code, scripts, or external apps talk directly to the Grounded backend — bypassing the web UI entirely.
        </p>
        <p className="mb-5 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          You send it in every HTTP request as the <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700">X-API-Key</code> header. The server uses it to identify your account and enforce your plan limits.
        </p>

        {/* Use cases */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Zap, title: "Programmatic queries", desc: "Call /agents/{id}/chat/stream from your own app or script." },
            { icon: Shield, title: "CI/CD pipelines", desc: "Upload documents and trigger ingestion from automated workflows." },
            { icon: KeyRound, title: "Custom integrations", desc: "Embed Grounded into Slack bots, internal tools, or dashboards." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <item.icon className="mb-2 h-4 w-4 text-zinc-400" />
              <p className="text-[12px] font-bold text-zinc-800 dark:text-zinc-200">{item.title}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300">
          <strong>Security:</strong> Treat your API key like a password. Never commit it to Git or share it publicly. If compromised, revoke it immediately and create a new one.
        </div>

        {/* Example usage */}
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Example — list your datasets</p>
          <pre className="overflow-x-auto rounded-xl bg-zinc-900 px-4 py-3 text-[12px] font-mono text-zinc-300 dark:bg-zinc-950">
{`curl https://localhost:8000/v1/datasets \\
  -H "X-API-Key: key-YOUR_KEY_HERE"`}
          </pre>
        </div>
      </div>

      {/* New key revealed */}
      {newKey && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/40 dark:bg-amber-950/20">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-[14px] font-bold text-amber-800 dark:text-amber-300">Copy this key now — it won't be shown again</p>
          </div>
          <p className="mb-3 text-[12px] text-amber-700 dark:text-amber-400">
            For security, the full API key is only displayed once. Store it somewhere safe (e.g. your <code className="font-mono">.env</code> file).
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3 dark:border-amber-800/40 dark:bg-zinc-900">
            <code className="flex-1 break-all font-mono text-[13px] text-zinc-800 dark:text-zinc-200">{newKey}</code>
            <Button variant="outline" size="sm" className="shrink-0" onClick={copyKey}>
              {copied ? <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </Button>
          </div>
          <button
            className="mt-3 text-[12px] text-amber-600 hover:underline dark:text-amber-400"
            onClick={() => setNewKey(null)}
          >
            I've saved it — dismiss
          </button>
        </div>
      )}

      {/* Create key form */}
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-[15px] font-bold text-zinc-900 dark:text-white">Create a new key</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Key label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g. "Production app" or "Local dev"'
              onKeyDown={(e) => { if (e.key === "Enter") void handleCreate(); }}
            />
          </div>
          <Button onClick={handleCreate} disabled={isSubmitting || !label.trim()} className="h-10 rounded-lg">
            <Plus className="h-4 w-4" />
            {isSubmitting ? "Creating…" : "Create key"}
          </Button>
        </div>
        {error && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600 dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Active keys list */}
      <div>
        <h2 className="mb-3 text-[15px] font-bold text-zinc-900 dark:text-white">
          Active keys <span className="ml-1 text-zinc-400 font-normal">({activeKeys.length})</span>
        </h2>
        {keysQuery.isLoading ? (
          <p className="text-[13px] text-zinc-400">Loading…</p>
        ) : activeKeys.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <KeyRound className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-[13px] font-semibold text-zinc-600 dark:text-zinc-400">No active API keys</p>
            <p className="text-[12px] text-zinc-400 mt-1">Create your first key above to start using the API.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-100 bg-white divide-y divide-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:divide-zinc-800">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto] px-5 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Name</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pr-16">Last used & Created</span>
              <span />
            </div>
            {activeKeys.map((key) => (
              <div key={key.key_id} className="grid grid-cols-[1fr_auto_auto] items-center px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div>
                  <p className="text-[14px] font-semibold text-zinc-900 dark:text-white">{key.label}</p>
                  <p className="text-[12px] text-zinc-400 mt-0.5">
                    Hint: <code className="font-mono">key-{key.key_id.slice(0, 6)}…</code>
                  </p>
                </div>
                <div className="pr-6 text-right">
                  <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                    {key.last_used_at ? `Last used ${formatDate(key.last_used_at)}` : "Never used"}
                  </p>
                  <p className="text-[12px] text-zinc-400">Created {formatDate(key.created_at)}</p>
                </div>
                <button
                  onClick={() => handleRevoke(key.key_id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                  title="Revoke this key"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revoked keys */}
      {revokedKeys.length > 0 && (
        <div>
          <h2 className="mb-3 text-[14px] font-semibold text-zinc-500 dark:text-zinc-400">
            Revoked keys ({revokedKeys.length})
          </h2>
          <div className="rounded-2xl border border-zinc-100 bg-white divide-y divide-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:divide-zinc-800">
            {revokedKeys.map((key) => (
              <div key={key.key_id} className="flex items-center justify-between px-5 py-3 opacity-60">
                <p className="text-[13px] text-zinc-500 line-through">{key.label}</p>
                <Badge tone="neutral" size="sm">Revoked {formatDate(key.revoked_at!)}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
