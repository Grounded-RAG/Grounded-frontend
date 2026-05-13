"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Database, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function CreateDatasetScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [sensitivity, setSensitivity] = useState("internal");
  const [freshness, setFreshness] = useState("monthly");
  const [executionTier, setExecutionTier] = useState("standard");
  const [webFallback, setWebFallback] = useState(false);
  const [modelRetrieval, setModelRetrieval] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/app/datasets");
  };

  const sensitivityOptions = [
    { value: "internal", label: "Internal", desc: "General internal use" },
    { value: "confidential", label: "Confidential", desc: "Limited access" },
    { value: "restricted", label: "Restricted", desc: "Strict controls" },
  ];

  const freshnessOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "ad hoc", label: "Ad hoc" },
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

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
          {/* Main column */}
          <div className="grid gap-6">
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
              </div>
            </Card>

            {/* Sensitivity */}
            <Card variant="glass" className="rounded-2xl">
              <h2 className="text-base font-semibold text-foreground mb-5">Sensitivity level</h2>
              <div className="grid grid-cols-3 gap-2">
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
              <div className="flex flex-wrap gap-2">
                {freshnessOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFreshness(opt.value)}
                    className={`rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                      freshness === opt.value
                        ? "border-foreground/30 bg-foreground/[0.06] text-foreground"
                        : "border-border/30 text-muted-foreground hover:bg-foreground/[0.02]"
                    }`}
                  >
                    {opt.label}
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
                    <span className={`absolute top-0.5 rounded-full transition-all duration-200 ${
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

            {/* Actions */}
            <div className="grid gap-3">
              <Button type="submit" size="lg" className="w-full rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Create dataset
              </Button>
              <Link href="/app/datasets">
                <Button type="button" variant="ghost" size="md" className="w-full rounded-xl">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
