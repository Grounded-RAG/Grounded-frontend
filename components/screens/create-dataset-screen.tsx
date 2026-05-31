
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createDataset } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { workspaceHref } from "@/lib/utils";

export function CreateDatasetScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const router = useRouter();
  const { apiKey, workspaceId } = useAuth();
  const datasetsHref = workspaceHref(workspaceSlug, "/datasets");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("general");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!apiKey || !workspaceId || !name.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const dataset = await createDataset(apiKey, {
        workspace_id: workspaceId,
        name: name.trim(),
        domain: domain.trim() || "general",
      });
      router.push(workspaceHref(workspaceSlug, `/datasets/${dataset.dataset_id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the dataset.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl animate-fade-in">
      <Link href={datasetsHref} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to datasets
      </Link>

      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.04] text-foreground/70">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create a dataset</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Datasets are the source of truth for grounded agents. After creating one, you can upload documents into it.
          </p>
        </div>
      </div>

      <Card variant="glass" className="rounded-2xl">
        <CardHeader title="Dataset details" />
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Policy Library"
              required
            />
            <Input
              label="Domain"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="compliance"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-border/15 pt-5">
            <Link href={datasetsHref}>
              <Button type="button" variant="secondary" className="rounded-full">Cancel</Button>
            </Link>
            <Button type="submit" disabled={!name.trim() || isSubmitting} className="rounded-full">
              {isSubmitting ? "Creating..." : "Create dataset"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
