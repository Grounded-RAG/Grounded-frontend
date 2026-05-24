import { AlertTriangle, Database, FileText, RefreshCw, UploadCloud } from "lucide-react";
import { DetailPageHeader } from "@/components/ui/detail-page-header";
import { PageHeader } from "@/components/page-header";
import { flatDetailCardClass } from "@/components/ui/card-surface";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentStatusBadge } from "@/components/ui/status";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { datasets, documents, ingestionJobs } from "@/lib/mock-data";
import { formatBytes, formatDate, workspaceHref } from "@/lib/utils";

export function DatasetDetailScreen({ id, workspaceSlug }: { id: string; workspaceSlug?: string }) {
  const dataset = datasets.find((d) => d.dataset_id === id) ?? datasets[0];
  const docs = documents.filter((d) => d.dataset_id === dataset.dataset_id);
  const jobs = ingestionJobs.filter((j) => j.dataset_id === dataset.dataset_id);
  const indexedCount = docs.filter((d) => d.status === "indexed").length;
  const datasetsHref = workspaceHref(workspaceSlug, "/datasets");

  return (
    <div className="page-grid animate-fade-in">
      <DetailPageHeader href={datasetsHref} backLabel="Back" />

      <div className={`${flatDetailCardClass} flex items-center gap-3 px-4 py-3`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          <Database className="h-5 w-5" />
        </div>
        <h2 className="min-w-0 truncate text-lg font-bold text-foreground">{dataset.name}</h2>
      </div>

      <PageHeader description="Inspect documents, upload source material, monitor ingestion, and review dataset policy." />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Upload documents" eyebrow="Ingestion" action={<UploadCloud className="h-4 w-4 text-foreground" />} />
            <div className="grid place-items-center rounded-2xl border border-dashed border-border/30 bg-secondary/8 p-10 text-center transition-colors hover:border-foreground/15 hover:bg-secondary/15">
              <UploadCloud className="h-8 w-8 text-muted-foreground/30" />
              <p className="mt-3 text-sm font-medium text-foreground">Drag files here or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">.txt, .pdf, .docx supported, max 50 MB</p>
            </div>
          </Card>

          <Card variant="glass" className="rounded-2xl">
            <CardHeader title={`Documents (${docs.length})`} />
            {docs.length === 0 ? (
              <EmptyState icon={<FileText className="h-8 w-8" />} title="No documents yet" description="Upload your first document." />
            ) : (
              <div className="grid gap-2">
                {docs.map((doc) => (
                  <div className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-3 transition-colors hover:bg-secondary/15" key={doc.document_id}>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground/50" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(doc.file_size_bytes)} · {doc.mime_type.split("/").pop()}</p>
                      </div>
                    </div>
                    <DocumentStatusBadge status={doc.status} />
                    {(doc.status === "failed" || doc.status === "indexed") && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs rounded-2xl">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reindex
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card variant="glass" className="rounded-2xl">
            <CardHeader title={`Ingestion jobs (${jobs.length})`} />
            <div className="grid gap-2">
              {jobs.map((job) => (
                <div className="rounded-xl border border-border/15 bg-secondary/8 p-3" key={job.job_id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-foreground">{job.job_id}</span>
                      {job.attempt_count > 1 && <span className="ml-2 text-xs text-muted-foreground">Attempt {job.attempt_count}</span>}
                    </div>
                    <DocumentStatusBadge status={job.status} />
                  </div>
                  {job.started_at && <p className="mt-1 text-xs text-muted-foreground">Started {formatDate(job.started_at)}{job.completed_at && ` · Completed ${formatDate(job.completed_at)}`}</p>}
                  {job.error_detail && (
                    <div className="mt-2 flex items-start gap-2 rounded-xl border border-border bg-muted/50 p-3">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground" />
                      <div>
                        {job.error_code && <p className="text-xs font-medium text-red-600 dark:text-red-400">{job.error_code}</p>}
                        <p className="text-sm text-red-600/80 dark:text-red-300/80">{job.error_detail}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Policy" eyebrow="Dataset controls" />
            <dl className="grid gap-3 text-sm">
              <PolicyRow label="Sensitivity" value={dataset.sensitivity_level} />
              <PolicyRow label="Freshness" value={dataset.freshness_profile} />
              <PolicyRow label="Minimum tier" value={dataset.min_execution_tier} />
              <PolicyRow label="Web fallback" value={dataset.allow_web_fallback ? "Allowed" : "Off"} />
              <PolicyRow label="Model retrieval" value={dataset.allow_internal_model_retrieval ? "Enabled" : "Disabled"} />
            </dl>
          </Card>

          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Readiness" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Documents indexed</span>
              <span className="font-semibold text-foreground">{indexedCount} / {docs.length}</span>
            </div>
            <ProgressBar value={indexedCount} max={Math.max(docs.length, 1)} tone={indexedCount === docs.length && docs.length > 0 ? "success" : "warn"} className="mt-2" />
            {docs.some((d) => d.status === "failed") && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" /><span>Some documents failed ingestion</span>
              </div>
            )}
          </Card>

          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Details" />
            <dl className="grid gap-2 text-sm">
              <PolicyRow label="Domain" value={dataset.domain} />
              <PolicyRow label="Created" value={formatDate(dataset.created_at)} />
              <PolicyRow label="Dataset ID" value={dataset.dataset_id} />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/10 pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground/80">{value}</dd>
    </div>
  );
}
