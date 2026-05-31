"use client";

import { useState } from "react";
import { AlertTriangle, FileText, UploadCloud } from "lucide-react";
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

export function DatasetDetailScreen({ id }: { id: string }) {
  const { apiKey } = useAuth();
  const datasetQuery = useApiQuery(() => getDataset(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const docsQuery = useApiQuery(() => listDatasetDocuments(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const jobsQuery = useApiQuery(() => listDatasetJobs(apiKey!, id), [apiKey, id], Boolean(apiKey));
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const dataset = datasetQuery.data;
  const docs = docsQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];
  const indexedCount = docs.filter((doc) => doc.status === "indexed").length;

  async function handleUpload() {
    if (!apiKey || !file) return;
    setIsUploading(true);
    setError(null);
    try { await uploadDatasetDocument(apiKey, id, file, file.name); setFile(null); await docsQuery.reload(); await jobsQuery.reload(); }
    catch (err) { setError(err instanceof Error ? err.message : "Upload failed"); }
    finally { setIsUploading(false); }
  }

  if (datasetQuery.isLoading) return <p className="text-sm text-muted-foreground">Loading dataset...</p>;
  if (!dataset) return <EmptyState icon={<FileText className="h-8 w-8" />} title="Dataset not found" description={datasetQuery.error ?? "The backend did not return this dataset."} />;

  return <div className="page-grid animate-fade-in"><PageHeader eyebrow="Dataset detail" title={dataset.name} description="Inspect documents, upload source material, monitor ingestion, and review dataset policy." /><div className="grid gap-6 xl:grid-cols-[1fr_20rem]"><div className="grid gap-6"><Card variant="glass" className="rounded-2xl"><CardHeader title="Upload documents" eyebrow="Ingestion" action={<UploadCloud className="h-4 w-4 text-foreground" />} /><div className="grid gap-3 rounded-2xl border border-dashed border-border/30 bg-secondary/8 p-6 text-center"><input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mx-auto text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-foreground" /><p className="text-xs text-muted-foreground">.txt, .pdf, .docx supported by the backend.</p><Button onClick={handleUpload} disabled={!file || isUploading} className="mx-auto"><UploadCloud className="h-4 w-4" />{isUploading ? "Uploading..." : "Upload"}</Button>{error ? <p className="text-sm text-destructive">{error}</p> : null}</div></Card><Card variant="glass" className="rounded-2xl"><CardHeader title={`Documents (${docs.length})`} />{docs.length === 0 ? <EmptyState icon={<FileText className="h-8 w-8" />} title="No documents yet" description="Upload your first document." /> : <div className="grid gap-2">{docs.map((doc) => <div className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-3" key={doc.document_id}><div className="flex min-w-0 items-center gap-3"><FileText className="h-4 w-4 shrink-0 text-muted-foreground/50" /><div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{doc.title ?? doc.document_id}</p><p className="text-xs text-muted-foreground">{formatBytes(doc.file_size_bytes)} · {doc.mime_type}</p></div></div><DocumentStatusBadge status={doc.status} /></div>)}</div>}</Card><Card variant="glass" className="rounded-2xl"><CardHeader title={`Ingestion jobs (${jobs.length})`} /><div className="grid gap-2">{jobs.map((job) => <div className="rounded-xl border border-border/15 bg-secondary/8 p-3" key={job.job_id}><div className="flex items-center justify-between"><span className="text-sm font-medium text-foreground">{job.job_id.slice(0, 8)}</span><DocumentStatusBadge status={job.status} /></div>{job.started_at ? <p className="mt-1 text-xs text-muted-foreground">Started {formatDate(job.started_at)}{job.completed_at ? ` · Completed ${formatDate(job.completed_at)}` : ""}</p> : null}{job.error_detail ? <div className="mt-2 flex items-start gap-2 rounded-xl border border-red-500/15 bg-red-500/5 p-3"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" /><p className="text-sm text-red-600/80 dark:text-red-300/80">{job.error_detail}</p></div> : null}</div>)}</div></Card></div><div className="grid content-start gap-6"><Card variant="glass" className="rounded-2xl"><CardHeader title="Policy" eyebrow="Dataset controls" /><dl className="grid gap-3 text-sm"><PolicyRow label="Sensitivity" value={dataset.sensitivity_level} /><PolicyRow label="Freshness" value={dataset.freshness_profile} /><PolicyRow label="Minimum tier" value={dataset.min_execution_tier} /><PolicyRow label="Web fallback" value={dataset.allow_web_fallback ? "Allowed" : "Off"} /><PolicyRow label="Model retrieval" value={dataset.allow_internal_model_retrieval ? "Enabled" : "Disabled"} /></dl></Card><Card variant="glass" className="rounded-2xl"><CardHeader title="Readiness" /><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Documents indexed</span><span className="font-semibold text-foreground">{indexedCount} / {docs.length}</span></div><ProgressBar value={indexedCount} max={Math.max(docs.length, 1)} tone={indexedCount === docs.length && docs.length > 0 ? "success" : "warn"} className="mt-2" /></Card><Card variant="glass" className="rounded-2xl"><CardHeader title="Details" /><dl className="grid gap-2 text-sm"><PolicyRow label="Domain" value={dataset.domain} /><PolicyRow label="Created" value={formatDate(dataset.created_at)} /><PolicyRow label="Dataset ID" value={dataset.dataset_id} /></dl></Card></div></div></div>;
}

function PolicyRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-border/10 pb-2 last:border-0 last:pb-0"><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-medium text-foreground/80">{value}</dd></div>; }
