import { Card, CardHeader } from "@/components/ui/card";
import { ConfidenceBadge, ModeBadge, SupportBadge, VerificationBadge } from "@/components/ui/status";
import { ConfidenceMeter } from "@/components/ui/progress";
import type { Run } from "@/lib/types";

const reasonLabels: Record<string, string> = {
  NO_GROUNDED_EVIDENCE: "No grounded evidence was found in the attached datasets.",
  INSUFFICIENT_SUPPORT: "Available sources only partially support this answer.",
  LOW_CONFIDENCE_SUPPORT: "Confidence is low because supporting evidence is weak or sparse.",
  QUERY_REQUIRES_CLARIFICATION: "The question needs more context before a reliable answer can be produced.",
  INSUFFICIENT_QUERY_ALIGNMENT: "Retrieved evidence does not align cleanly with the question.",
};

export function TrustPanel({ run }: { run: Run }) {
  return (
    <Card variant="glass">
      <CardHeader title="Trust review" eyebrow="Grounding" />

      {/* Confidence meter + badges */}
      <div className="flex items-start gap-4">
        <ConfidenceMeter score={run.confidence_score} />
        <div className="flex flex-1 flex-wrap gap-1.5">
          <ConfidenceBadge label={run.confidence_label} score={run.confidence_score} />
          <SupportBadge support={run.support_summary} />
          <VerificationBadge status={run.verification_status} />
          {run.selected_mode && <ModeBadge mode={run.selected_mode} />}
        </div>
      </div>

      {/* Details */}
      <dl className="mt-5 grid gap-4 text-sm">
        <div>
          <dt className="font-medium text-muted-foreground">Routing reason</dt>
          <dd className="mt-1 leading-relaxed text-foreground/80">{run.routing_reason}</dd>
        </div>

        <div>
          <dt className="font-medium text-muted-foreground">
            Citations ({run.citations.length})
          </dt>
          <dd className="mt-2 space-y-2">
            {run.citations.length ? (
              run.citations.map((citation) => (
                <blockquote
                  className="rounded-xl border border-border/30 bg-secondary/30 p-3 text-sm leading-relaxed text-foreground/75"
                  key={citation.citation_id}
                >
                  <span className="mr-1.5 text-muted-foreground">❝</span>
                  {citation.quote}
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    — chunk {citation.chunk_index}
                  </span>
                </blockquote>
              ))
            ) : (
              <span className="text-muted-foreground/70">
                No citations were available for this run.
              </span>
            )}
          </dd>
        </div>

        {run.degraded_reasons.length > 0 && (
          <div>
            <dt className="font-medium text-amber-600 dark:text-amber-400">Degraded reasons</dt>
            <dd className="mt-2 space-y-2">
              {run.degraded_reasons.map((reason) => (
                <p
                  className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300/90"
                  key={reason}
                >
                  {reasonLabels[reason] ?? reason}
                </p>
              ))}
            </dd>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/20 bg-secondary/20 p-3">
          <TrustRow label="Provider" value={run.generator_provider} />
          <TrustRow label="Effective tier" value={run.effective_tier} />
          <TrustRow label="Latency" value={`${run.total_latency_ms}ms`} />
          <TrustRow
            label="Fallback"
            value={run.provider_fallback_used ? `from ${run.provider_fallback_from}` : "None"}
          />
        </div>
      </dl>
    </Card>
  );
}

function TrustRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
