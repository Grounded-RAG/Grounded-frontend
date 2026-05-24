"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Braces,
  Check,
  ChevronRight,
  Database,
  FileText,
  PanelLeft,
  Plus,
  Settings2,
  UploadCloud,
  X,
} from "lucide-react";
import Link from "next/link";
import { DetailPageHeader } from "@/components/ui/detail-page-header";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { cn, workspaceHref } from "@/lib/utils";

const sensitivityOptions = [
  { value: "public", label: "Public", desc: "Open content" },
  { value: "internal", label: "Internal", desc: "Team-visible" },
  { value: "confidential", label: "Confidential", desc: "Limited access" },
  { value: "restricted", label: "Restricted", desc: "Strict controls" },
];

const freshnessOptions = [
  { value: "stable", label: "Stable", desc: "Rarely changes" },
  { value: "balanced", label: "Balanced", desc: "Moderate refresh" },
  { value: "aggressive", label: "Aggressive", desc: "Frequent updates" },
];

const tierOptions = [
  { value: "standard", label: "Standard", desc: "Default processing" },
  { value: "enterprise", label: "Enterprise", desc: "Higher priority" },
  { value: "critical", label: "Critical", desc: "Maximum assurance" },
];

export function CreateDatasetScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  const router = useRouter();
  const datasetsHref = workspaceHref(workspaceSlug, "/datasets");

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [sensitivity, setSensitivity] = useState("internal");
  const [freshness, setFreshness] = useState("balanced");
  const [executionTier, setExecutionTier] = useState("standard");
  const [webFallback, setWebFallback] = useState(false);
  const [modelRetrieval, setModelRetrieval] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>([]);

  const ready = name.trim().length > 0;
  const activeSection = step === 1 ? "general" : "advanced";
  const sourceLabel = useMemo(() => (uploadedFiles.length ? `${uploadedFiles.length} file${uploadedFiles.length === 1 ? "" : "s"}` : "File Upload"), [uploadedFiles.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(datasetsHref);
  };

  const addMockFile = () => {
    setUploadedFiles((prev) => [...prev, { name: `document-${prev.length + 1}.pdf`, size: "2.4 MB" }]);
  };

  return (
    <div className="page-grid animate-fade-in">
      <DetailPageHeader href={datasetsHref} backLabel="Back" />

      <div className="flex w-full flex-col flat-detail-card overflow-hidden">

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="grid flex-1 lg:grid-cols-[240px_1fr]">
          <aside className="border-b border-border/60 bg-card px-3 py-4 lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:gap-2 lg:overflow-visible lg:pb-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={cn(
                  "flex h-9 shrink-0 items-center justify-between rounded-2xl px-3.5 text-left text-[13px] font-semibold transition-colors lg:w-full",
                  activeSection === "general" ? "bg-secondary/70 text-foreground" : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-3">
                  <PanelLeft className="h-4 w-4" />
                  General
                </span>
                {activeSection === "general" ? <span className="h-5 w-px bg-foreground" /> : null}
              </button>
              <div className="hidden px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/55 lg:block">Advanced</div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-2.5 rounded-2xl px-3.5 text-left text-[13px] font-semibold transition-colors lg:w-full",
                  activeSection === "advanced" ? "bg-secondary/70 text-foreground" : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
                )}
              >
                <Braces className="h-4 w-4" />
                Parsing
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex h-9 shrink-0 items-center gap-2.5 rounded-2xl px-3.5 text-left text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground lg:w-full"
              >
                <Settings2 className="h-4 w-4" />
                Chunking
              </button>
            </div>
          </aside>

          <section className="min-w-0 bg-background/35 p-4 sm:p-6">
            <div className="grid gap-5">
              <div className="overflow-hidden flat-detail-card">
                <div className="border-b border-border/60 bg-secondary/30 px-4 py-3">
                  <h2 className="text-[17px] font-semibold text-foreground">General</h2>
                </div>
                <div className="grid gap-5 p-4 sm:p-5">
                  <Input
                    label="Dataset Name *"
                    helperText="Enter a descriptive name to help you identify this collection of content."
                    placeholder="Operations Policy Library"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <div className="grid gap-5 md:grid-cols-2">
                    <Input
                      label="Domain"
                      placeholder="Internal policy"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    />
                    <div className="grid gap-1.5">
                      <label className="pl-0.5 text-[13px] font-medium text-foreground/80">Content freshness</label>
                      <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-border/60 bg-card">
                        {freshnessOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFreshness(option.value)}
                            className={cn(
                              "min-h-9 border-r border-border/60 px-2 text-center text-[12px] font-semibold last:border-r-0",
                              freshness === option.value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Textarea
                    label="Description"
                    placeholder="Briefly describe what this dataset contains..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-hidden flat-detail-card">
                <div className="border-b border-border/60 bg-secondary/30 px-4 py-3">
                  <h2 className="text-[17px] font-semibold text-foreground">How would you like to add content?</h2>
                </div>
                <div className="grid md:grid-cols-2">
                  <button
                    type="button"
                    onClick={addMockFile}
                    className="flex min-h-[128px] items-center gap-4 border-b border-border/60 p-5 text-left transition-colors hover:bg-secondary/30 md:border-b-0 md:border-r"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <Database className="h-5 w-5 shrink-0 text-foreground" />
                    <span>
                      <span className="block text-[15px] font-semibold text-foreground">{sourceLabel}</span>
                      <span className="mt-1 block text-[14px] text-muted-foreground">PDFs, DOC(X), PPT(X), TXT, CSV.</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="flex min-h-[128px] items-center gap-4 p-5 text-left text-muted-foreground transition-colors hover:bg-secondary/30 hover:text-foreground"
                  >
                    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-border bg-card" />
                    <UploadCloud className="h-5 w-5 shrink-0" />
                    <span>
                      <span className="block text-[15px] font-semibold text-foreground">Third-Party Connection</span>
                      <span className="mt-1 block text-[14px] text-muted-foreground">Automatically import and sync documents to your dataset</span>
                    </span>
                  </button>
                </div>
              </div>

              {uploadedFiles.length > 0 ? (
                <div className="overflow-hidden flat-detail-card">
                  <div className="border-b border-border/60 bg-secondary/30 px-4 py-3">
                    <h2 className="text-[17px] font-semibold text-foreground">Selected files</h2>
                  </div>
                  <div className="divide-y divide-border/60">
                    {uploadedFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                            <FileText className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-foreground">{file.name}</p>
                            <p className="text-[12px] text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index))}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-5 rounded-2xl border border-border/60 bg-card p-4 shadow-none sm:p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <OptionGroup label="Sensitivity" options={sensitivityOptions} value={sensitivity} onChange={setSensitivity} />
                  <OptionGroup label="Execution tier" options={tierOptions} value={executionTier} onChange={setExecutionTier} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Toggle label="Web fallback" description="Allow web search when data is insufficient" checked={webFallback} onChange={setWebFallback} />
                  <Toggle label="Model retrieval" description="Allow internal model-based retrieval" checked={modelRetrieval} onChange={setModelRetrieval} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border/60 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <Link href={datasetsHref}>
            <Button type="button" variant="secondary" className="rounded-2xl">
              Cancel
            </Button>
          </Link>
          {step === 1 ? (
            <Button type="button" disabled={!ready} className="rounded-2xl" onClick={() => setStep(2)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={!ready} className="rounded-2xl">
              Create
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; desc: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-[13px] font-semibold text-foreground">{label}</p>
      <div className="grid gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
              value === option.value ? "border-foreground/30 bg-secondary/70" : "border-border/60 bg-card hover:bg-secondary/40",
            )}
          >
            <span>
              <span className="block text-[13px] font-semibold text-foreground">{option.label}</span>
              <span className="block text-[12px] text-muted-foreground">{option.desc}</span>
            </span>
            <span className={cn("h-2 w-2 rounded-full", value === option.value ? "bg-foreground" : "bg-border")} />
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card px-3 py-3 text-left transition-colors hover:bg-secondary/40"
    >
      <span>
        <span className="block text-[13px] font-semibold text-foreground">{label}</span>
        <span className="block text-[12px] text-muted-foreground">{description}</span>
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full border transition-colors", checked ? "border-foreground bg-foreground" : "border-border bg-secondary")}>
        <span className={cn("absolute top-0.5 h-[18px] w-[18px] rounded-full bg-card shadow-none transition-transform", checked ? "translate-x-[20px]" : "translate-x-0.5")} />
      </span>
    </button>
  );
}
