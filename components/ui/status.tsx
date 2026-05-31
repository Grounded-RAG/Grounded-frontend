import { Badge } from "@/components/ui/badge";
import type {
  ConfidenceLabel,
  DocumentStatus,
  IngestionJobStatus,
  SupportSummary,
  UserFacingMode,
  VerificationStatus,
} from "@/lib/types";

export function ModeBadge({ mode }: { mode: UserFacingMode }) {
  const config: Record<UserFacingMode, { label: string; tone: "accent" | "success" | "warn" | "neutral" }> = {
    auto: { label: "Auto", tone: "accent" },
    instant: { label: "Instant", tone: "accent" },
    thinking: { label: "Thinking", tone: "warn" },
    verified: { label: "Verified", tone: "neutral" },
  };
  const { label, tone } = config[mode];
  return <Badge tone={tone} dot>{label}</Badge>;
}

export function ConfidenceBadge({ label, score }: { label: ConfidenceLabel; score?: number }) {
  const tone = label === "high" ? "success" : label === "medium" ? "warn" : "danger";
  return (
    <Badge tone={tone} dot>
      {score !== undefined ? `${Math.round(score * 100)}%` : label} confidence
    </Badge>
  );
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return (
    <Badge tone={status === "passed" ? "success" : "warn"} dot>
      {status === "passed" ? "Verified" : "Degraded"}
    </Badge>
  );
}

export function SupportBadge({ support }: { support: SupportSummary }) {
  const config: Record<SupportSummary, { label: string; tone: "success" | "warn" | "danger" }> = {
    grounded: { label: "Grounded", tone: "success" },
    partial: { label: "Partial support", tone: "warn" },
    insufficient: { label: "Insufficient", tone: "danger" },
  };
  const { label, tone } = config[support];
  return <Badge tone={tone} dot>{label}</Badge>;
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus | IngestionJobStatus }) {
  const tone =
    status === "indexed"
      ? "success"
      : status === "failed"
        ? "danger"
        : status === "running" || status === "processing"
          ? "warn"
          : "neutral";
  return <Badge tone={tone} dot>{status}</Badge>;
}
