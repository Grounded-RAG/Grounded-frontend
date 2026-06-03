"use client";

import { useCallback, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Database, FileText, Loader2, UploadCloud, XCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentStatusBadge } from "@/components/ui/status";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { getDataset, listDatasetDocuments, listDatasetJobs, uploadDatasetDocument } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useApiQuery } from "@/lib/use-api-query";
import { formatBytes, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function DatasetDetailScreen({ id }: { id: string }) {
  const { apiKey } = useAuth();
  const datasetQuery = useApiQuery(() => getDataset(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const docsQuery = useApiQuery(() => listDatasetDocuments(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const jobsQuery = useApiQuery(() => listDatasetJobs(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const [isDragging, setIsDragging] = useState(false);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataset = datasetQuery.data;
  const docs = docsQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];

  const totalSize = docs.reduce((sum, doc) => sum + (doc.file_size_bytes ?? 0), 0);
  const processedCount = docs.filter((doc) => doc.status === "indexed").length;
  const processingCount = docs.filter((doc) => doc.status === "processing").length;
  const failedCount = docs.filter((doc) => doc.status === "failed").length;
  const indexedCount = processedCount;

  const statChips = [
    { label: "Documents", value: docs.length, icon: FileText, color: "text-foreground" },
    { label: "Size", value: formatBytes(totalSize), icon: Database, color: "text-foreground" },
    { label: "Processed", value: processedCount, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Processing", value: processingCount, icon: Loader2, color: "text-blue-600 dark:text-blue-400" },
    { label: "Failed", value: failedCount, icon: XCircle, color: failedCount > 0 ? "text-red-600" : "text-muted-foreground/50" },
  ];

  const stageFile = useCallback((file: File) => {
    setStagedFile(file);
    setError(null);
  }, []);

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) stageFile(file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) stageFile(file);
    event.target.value = "";
  }

  async function handleUpload() {
    if (!stagedFile || !apiKey) return;
    setIsUploading(true);
    setError(null);
    setUploadProgress(10);
    try {
      const ticker = setInterval(() => setUploadProgress((p) => Math.min(p + 15, 85)), 300);
      await uploadDatasetDocument(apiKey, id, stagedFile, stagedFile.name);
      clearInterval(ticker);
      setUploadProgress(100);
      setStagedFile(null);
      await docsQuery.reload();
      await jobsQuery.reload();
      setTimeout(() => setUploadProgress(0), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }

  if (datasetQuery.isLoading) return <p className="text-sm text-muted-foreground">Loading dataset...</p>;
  if (!dataset) return <EmptyState icon={<FileText className="h-8 w-8" />} title="Dataset not found" description={datasetQuery.error ?? "The backend did not return this dataset."} />;

  return (
    <div className="page-grid animate-fade-in">
      <PageHeader eyebrow="Dataset detail" title={dataset.name} description="Inspect documents, upload source material, monitor ingestion, and review dataset policy." />

      {/* Stats chips row — matches Contextual AI */}
      <div className="flex flex-wrap gap-3">
        {statChips.map((chip) => {
          const Icon = chip.icon;
          return (
            <div key={chip.label} className="flex items-center gap-2 rounded-2xl border border-border/30 bg-card px-4 py-3 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground/[0.04]">
                <Icon className={cn("h-4 w-4", chip.color)} />
              </div>
              <div>
                <p className={cn("text-lg font-bold leading-none", chip.color)}>{chip.value}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/60">{chip.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          {/* Upload zone */}
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Upload documents" eyebrow="Ingestion" action={<UploadCloud className="h-4 w-4 text-foreground" />} />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !stagedFile && fileInputRef.current?.click()}
              className={cn(
                "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all",
                isDragging
                  ? "border-foreground/50 bg-foreground/[0.04] scale-[1.01]"
                  : stagedFile
                  ? "border-emerald-500/40 bg-emerald-500/5 cursor-default"
                  : "border-border/30 bg-secondary/8 hover:border-border/50 hover:bg-secondary/15",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.docx,.html,.pptx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              {stagedFile ? (
                <div className="flex w-full items-center justify-between gap-3 px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{stagedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(stagedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setStagedFile(null); }}
                    className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/30 bg-foreground/[0.04]">
                    <UploadCloud className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Drag and drop files here, or click to select files</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">PDF, HTML, DOC(X), PPT(X), PNG, JPG, JPEG · Max 300 MB</p>
                  </div>
                </>
              )}
            </div>

            {isUploading && uploadProgress > 0 && (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Uploading {stagedFile?.name ?? "file"}…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <ProgressBar value={uploadProgress} max={100} tone="accent" className="h-1.5" />
              </div>
            )}

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-600/80">{error}</p>
              </div>
            )}

            {stagedFile && !isUploading && (
              <div className="mt-4 flex items-center justify-end gap-3">
                <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setStagedFile(null)}>
                  Discard
                </Button>
                <Button size="sm" className="rounded-full" onClick={handleUpload} disabled={isUploading || !apiKey}>
                  <UploadCloud className="h-4 w-4" />
                  Start Uploading
                </Button>
              </div>
            )}

            {!stagedFile && !isUploading && (
              <div className="mt-3 text-center">
                <p className="text-xs text-muted-foreground/50">
                  Upload Documents · PDF, HTML, DOC(X), PPT(X), PNG, JPG, JPEG supported. Maximum 300 MB per file.
                </p>
              </div>
            )}
          </Card>

          {/* Documents list */}
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title={`Documents (${docs.length})`} />
            {docs.length === 0 ? (
              <EmptyState icon={<FileText className="h-8 w-8" />} title="No documents yet" description="Upload your first document." />
            ) : (
              <div className="grid gap-2">
                {docs.map((doc) => (
                  <div className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-3" key={doc.document_id}>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/20 bg-foreground/[0.03]">
                        <FileText className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{doc.title ?? doc.document_id}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(doc.file_size_bytes)} · {doc.mime_type} · Added {formatDate(doc.created_at)}</p>
                      </div>
                    </div>
                    <DocumentStatusBadge status={doc.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Ingestion jobs */}
          {jobs.length > 0 && (
            <Card variant="glass" className="rounded-2xl">
              <CardHeader title={`Ingestion jobs (${jobs.length})`} />
              <div className="grid gap-2">
                {jobs.map((job) => (
                  <div className="rounded-xl border border-border/15 bg-secondary/8 p-3" key={job.job_id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
                        <span className="font-mono text-sm font-medium text-foreground">{job.job_id.slice(0, 8)}</span>
                      </div>
                      <DocumentStatusBadge status={job.status} />
                    </div>
                    {job.started_at && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Started {formatDate(job.started_at)}{job.completed_at ? ` · Completed ${formatDate(job.completed_at)}` : ""}
                      </p>
                    )}
                    {job.error_detail && (
                      <div className="mt-2 flex items-start gap-2 rounded-xl border border-red-500/15 bg-red-500/5 p-3">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                        <p className="text-sm text-red-600/80 dark:text-red-300/80">{job.error_detail}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="grid content-start gap-6">
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Readiness" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Documents indexed</span>
              <span className="font-semibold text-foreground">{indexedCount} / {docs.length}</span>
            </div>
            <ProgressBar
              value={indexedCount}
              max={Math.max(docs.length, 1)}
              tone={indexedCount === docs.length && docs.length > 0 ? "success" : "warn"}
              className="mt-2"
            />
          </Card>
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
            <CardHeader title="Details" />
            <dl className="grid gap-2 text-sm">
              <PolicyRow label="Domain" value={dataset.domain} />
              <PolicyRow label="Created" value={formatDate(dataset.created_at)} />
              <PolicyRow label="Dataset ID" value={dataset.dataset_id.slice(0, 8)} />
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
      <dd className="text-right font-medium text-foreground/80">{value}</dd>
    </div>
  );
}
