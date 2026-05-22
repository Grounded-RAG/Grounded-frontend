import { AlertTriangle, Copy, KeyRound, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { apiKeys } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export function ApiKeysScreen() {
  return (
    <div className="page-grid animate-fade-in">
      <PageHeader eyebrow="API keys" title="Developer access" description="Create keys, revoke keys, and copy new raw keys exactly once after creation." action="Create key" />

      <Card variant="glass" className="rounded-2xl border-amber-500/15">
        <CardHeader title="New key created" eyebrow="Copy-once receipt" />
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">gr_live_a1b2c3d4e5f6g7h8i9j0</p>
            <p className="mt-1 text-xs text-amber-600/70 dark:text-amber-400/70">This key is shown once and cannot be recovered.</p>
          </div>
          <Button variant="outline" size="sm"><Copy className="h-3.5 w-3.5" /> Copy</Button>
        </div>
      </Card>

      <Card variant="glass" className="rounded-2xl">
        <CardHeader title={`Keys (${apiKeys.length})`} />
        <div className="grid gap-2">
          {apiKeys.map((key) => (
            <div className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-4 transition-colors hover:bg-secondary/15" key={key.key_id}>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary/50"><KeyRound className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{key.label}</p>
                  <p className="text-xs text-muted-foreground">Created {formatDate(key.created_at)}{key.last_used_at ? ` · Last used ${formatDate(key.last_used_at)}` : " · Never used"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={key.revoked_at ? "danger" : "success"} dot size="sm">{key.revoked_at ? "Revoked" : "Active"}</Badge>
                {!key.revoked_at && <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
