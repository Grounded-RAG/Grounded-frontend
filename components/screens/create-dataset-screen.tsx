"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Database, Plus, UploadCloud, FileText, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function CreateDatasetScreen() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [sensitivity, setSensitivity] = useState("internal");
  const [freshness, setFreshness] = useState("balanced");
  const [executionTier, setExecutionTier] = useState("standard");
  const [webFallback, setWebFallback] = useState(false);
  const [modelRetrieval, setModelRetrieval] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, size: string}[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/app/datasets");
  };

  const sensitivityOptions = [
    { value: "public", label: "Public", desc: "Open, non-sensitive data" },
    { value: "internal", label: "Internal", desc: "General internal use" },
    { value: "confidential", label: "Confidential", desc: "Limited access" },
    { value: "restricted", label: "Restricted", desc: "Strict controls" },
  ];

  const freshnessOptions = [
    { value: "stable", label: "Stable", desc: "Content rarely changes" },
    { value: "balanced", label: "Balanced", desc: "Moderate refresh cycle" },
    { value: "aggressive", label: "Aggressive", desc: "Frequent updates expected" },
  ];

  const tierOptions = [
    { value: "standard", label: "Standard", desc: "Default processing" },
    { value: "enterprise", label: "Enterprise", desc: "Higher priority" },
    { value: "critical", label: "Critical", desc: "Maximum assurance" },
  ];

  return (
    <div className="page-grid animate-fade-in">
      {/* Back link */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/app/datasets"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to datasets
        </Link>
      </div>

      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-foreground/[0.06] border border-border/30 flex items-center justify-center">
            <Database className="h-5 w-5 text-foreground/70" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create new dataset</h1>
            <p className="text-sm text-muted-foreground">Define a source-of-truth collection for your grounded agents.</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-foreground/[0.02] border border-border/20 text-[12px] text-muted-foreground">
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${step === 1 ? 'bg-foreground text-background ring-2 ring-foreground/30 ring-offset-1 ring-offset-background' : 'bg-foreground/20 text-foreground'}`}>1</span>
          <span className={`font-medium ${step === 1 ? 'text-foreground' : 'text-foreground/60'}`}>Dataset configuration</span>
          <span className="text-muted-foreground/40">→</span>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${step === 2 ? 'bg-foreground text-background ring-2 ring-foreground/30 ring-offset-1 ring-offset-background' : 'bg-foreground/20 text-foreground'}`}>2</span>
          <span className={`font-medium ${step === 2 ? 'text-foreground' : 'text-foreground/60'}`}>Data sources</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
          {/* Main column */}
          <div className="grid gap-6">
            {step === 1 && (
              <>
                {/* Basics */}
                <Card variant="glass" className="rounded-2xl">
                  <h2 className="text-base font-semibold text-foreground mb-5">Basic information</h2>
                  <div className="grid gap-5">
                    <Input
                      label="Dataset name"
                      placeholder="e.g. Operations Policy Library"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Domain"
                      placeholder="e.g. Internal policy, Risk and compliance"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    />
                    <Input
                      label="Description (Optional)"
                      placeholder="Briefly describe what this dataset contains..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </Card>

                {/* Sensitivity */}
                <Card variant="glass" className="rounded-2xl">
                  <h2 className="text-base font-semibold text-foreground mb-5">Sensitivity level</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {sensitivityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSensitivity(opt.value)}
                        className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                          sensitivity === opt.value
                            ? "border-foreground/30 bg-foreground/[0.06] shadow-sm"
                            : "border-border/30 bg-foreground/[0.01] hover:bg-foreground/[0.03]"
                        }`}
                      >
                        <span className="text-[13px] font-semibold text-foreground">{opt.label}</span>
                        <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                        {sensitivity === opt.value && (
                          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-foreground" />
                        )}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Freshness profile */}
                <Card variant="glass" className="rounded-2xl">
                  <h2 className="text-base font-semibold text-foreground mb-5">Freshness profile</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {freshnessOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFreshness(opt.value)}
                        className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                          freshness === opt.value
                            ? "border-foreground/30 bg-foreground/[0.06] shadow-sm"
                            : "border-border/30 bg-foreground/[0.01] hover:bg-foreground/[0.03]"
                        }`}
                      >
                        <span className="text-[13px] font-semibold text-foreground">{opt.label}</span>
                        <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Execution tier */}
                <Card variant="glass" className="rounded-2xl">
                  <h2 className="text-base font-semibold text-foreground mb-5">Minimum execution tier</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {tierOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setExecutionTier(opt.value)}
                        className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                          executionTier === opt.value
                            ? "border-foreground/30 bg-foreground/[0.06] shadow-sm"
                            : "border-border/30 bg-foreground/[0.01] hover:bg-foreground/[0.03]"
                        }`}
                      >
                        <span className="text-[13px] font-semibold text-foreground">{opt.label}</span>
                        <span className="text-[11px] text-muted-foreground">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {step === 2 && (
              <>
                <Card variant="glass" className="rounded-2xl">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <UploadCloud className="h-4 w-4 text-foreground/70" />
                        <h2 className="text-base font-semibold text-foreground">Upload documents</h2>
                      </div>
                      <p className="text-[13px] text-muted-foreground">
                        Upload files to populate this dataset. You can also connect external sources later.
                      </p>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-border/40 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-foreground/[0.01] hover:bg-foreground/[0.02] transition-colors cursor-pointer">
                    <div className="h-12 w-12 rounded-full bg-foreground/[0.05] flex items-center justify-center mb-3">
                      <UploadCloud className="h-6 w-6 text-foreground/60" />
                    </div>
                    <p className="text-[14px] font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                    <p className="text-[12px] text-muted-foreground mb-4">PDF, TXT, MD, CSV (max. 50MB per file)</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                       setUploadedFiles(prev => [...prev, { name: `document-${prev.length + 1}.pdf`, size: '2.4 MB' }]);
                    }}>
                      Select files
                    </Button>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-[13px] font-medium text-foreground mb-3">Selected files</h3>
                      <div className="grid gap-2">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-foreground/[0.02]">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-foreground/[0.05] flex items-center justify-center">
                                <FileText className="h-4 w-4 text-foreground/60" />
                              </div>
                              <div>
                                <p className="text-[13px] font-medium text-foreground">{file.name}</p>
                                <p className="text-[11px] text-muted-foreground">{file.size}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>

          {/* Sidebar column */}
          <div className="grid content-start gap-6">
            {/* Toggles */}
            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-4">Access policies</h2>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Web fallback</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Allow web search when data is insufficient</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWebFallback(!webFallback)}
                    className={`relative h-6 w-11 rounded-full border transition-all duration-200 ${
                      webFallback
                        ? "bg-foreground border-foreground"
                        : "bg-foreground/[0.08] border-border/40"
                    }`}
                  >
                    <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all duration-200 ${
                      webFallback
                        ? "left-[22px] bg-background"
                        : "left-0.5 bg-muted-foreground/60"
                    }`} style={{ height: 18, width: 18 }} />
                  </button>
                </div>
                <div className="border-t border-border/10" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Model retrieval</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Allow internal model-based retrieval</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModelRetrieval(!modelRetrieval)}
                    className={`relative h-6 w-11 rounded-full border transition-all duration-200 ${
                      modelRetrieval
                        ? "bg-foreground border-foreground"
                        : "bg-foreground/[0.08] border-border/40"
                    }`}
                  >
                    <span className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all duration-200 ${
                      modelRetrieval
                        ? "left-[22px] bg-background"
                        : "left-0.5 bg-muted-foreground/60"
                    }`} style={{ height: 18, width: 18 }} />
                  </button>
                </div>
              </div>
            </Card>

            {/* Summary */}
            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-3">Summary</h2>
              <dl className="grid gap-2.5 text-sm">
                <div className="flex justify-between gap-4 border-b border-border/10 pb-2">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium text-foreground/80 truncate max-w-[140px]">{name || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/10 pb-2">
                  <dt className="text-muted-foreground">Domain</dt>
                  <dd className="font-medium text-foreground/80 truncate max-w-[140px]">{domain || "—"}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/10 pb-2">
                  <dt className="text-muted-foreground">Sensitivity</dt>
                  <dd className="font-medium text-foreground/80 capitalize">{sensitivity}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/10 pb-2">
                  <dt className="text-muted-foreground">Freshness</dt>
                  <dd className="font-medium text-foreground/80 capitalize">{freshness}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Tier</dt>
                  <dd className="font-medium text-foreground/80 capitalize">{executionTier}</dd>
                </div>
              </dl>
            </Card>

            {/* Readiness check */}
            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-3">Readiness</h2>
              <div className="grid gap-2.5">
                {[
                  { label: "Name provided", met: name.trim().length > 0 },
                  { label: "Domain specified", met: domain.trim().length > 0 },
                  { label: "Sensitivity level set", met: !!sensitivity },
                  { label: "Files uploaded (optional)", met: uploadedFiles.length > 0 },
                ].map((check) => (
                  <div key={check.label} className="flex items-center gap-2.5">
                    <div className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      check.met
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/40 bg-foreground/[0.02]"
                    }`} style={{ height: 18, width: 18 }}>
                      {check.met && (
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[13px] ${check.met ? "text-foreground font-medium" : "text-muted-foreground/60"}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <div className="grid gap-3">
              {step === 1 ? (
                <>
                  <Button
                    type="button"
                    size="lg"
                    className="w-full rounded-xl"
                    disabled={!name.trim() || !domain.trim()}
                    onClick={() => setStep(2)}
                  >
                    Next: Add data sources
                  </Button>
                  <Link href="/app/datasets">
                    <Button type="button" variant="ghost" size="md" className="w-full rounded-xl">
                      Cancel
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button type="submit" size="lg" className="w-full rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Create dataset
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    className="w-full rounded-xl"
                    onClick={() => setStep(1)}
                  >
                    Back to configuration
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
