export type ExecutionTier = "standard" | "enterprise" | "critical";
export type UserFacingMode = "auto" | "instant" | "thinking" | "verified";
export type VerificationStatus = "passed" | "degraded";
export type ConfidenceLabel = "low" | "medium" | "high";
export type SupportSummary = "grounded" | "partial" | "insufficient";
export type IngestionJobStatus = "queued" | "running" | "indexed" | "failed" | "dead_letter";
export type DocumentStatus = "uploaded" | "processing" | "indexed" | "failed" | "archived";
export type SensitivityLevel = "public" | "internal" | "confidential" | "restricted";
export type FreshnessProfile = "stable" | "balanced" | "aggressive";
export type AgentStatus = "active" | "archived";
export type MessageRole = "user" | "assistant" | "system";
export type GroundingPolicy = "strict" | "balanced" | "live";
export type SubscriptionPlan = "Free" | "Pro" | "Business" | "Enterprise";
export type FeedbackStatus = "new" | "triaged" | "resolved";
export type FeedbackRating = "positive" | "negative" | "neutral";

export interface Workspace {
  workspace_id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  dataset_id: string;
  workspace_id: string;
  name: string;
  description?: string;
  domain: string;
  sensitivity_level: SensitivityLevel;
  freshness_profile: FreshnessProfile;
  min_execution_tier: ExecutionTier;
  allow_web_fallback: boolean;
  allow_internal_model_retrieval: boolean;
  created_at: string;
}

export interface DatasetDocument {
  document_id: string;
  dataset_id: string;
  title: string;
  mime_type: string;
  file_size_bytes: number;
  status: DocumentStatus;
  created_at: string;
}

export interface IngestionJob {
  job_id: string;
  document_id: string;
  dataset_id: string;
  status: IngestionJobStatus;
  attempt_count: number;
  error_code: string | null;
  error_detail: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Agent {
  agent_id: string;
  workspace_id: string;
  name: string;
  description: string;
  system_instructions: string;
  default_mode: UserFacingMode;
  allowed_modes: UserFacingMode[];
  grounding_policy: GroundingPolicy;
  status: AgentStatus;
  dataset_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Citation {
  citation_id: string;
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  quote: string;
}

export interface Run {
  run_id: string;
  dataset_id: string | null;
  agent_id: string | null;
  conversation_id: string | null;
  selected_mode: UserFacingMode | null;
  requested_tier: ExecutionTier | null;
  router_recommendation: ExecutionTier;
  effective_tier: ExecutionTier;
  routing_reason: string;
  query: string;
  answer: string;
  citations: Citation[];
  confidence_score: number;
  confidence_label: ConfidenceLabel;
  support_summary: SupportSummary;
  verification_status: VerificationStatus;
  degraded_reasons: string[];
  generator_provider: string;
  provider_backend: string;
  provider_model: string | null;
  provider_fallback_used: boolean;
  provider_fallback_from: string | null;
  retrieved_chunk_ids: string[];
  selected_evidence_ids: string[];
  total_latency_ms: number;
  created_at: string;
}

export interface Conversation {
  conversation_id: string;
  workspace_id: string;
  agent_id: string;
  created_by_api_key_id: string | null;
  title: string;
  last_used_mode: UserFacingMode;
  created_at: string;
  updated_at: string;
}

export interface Message {
  message_id: string;
  conversation_id: string;
  created_by_api_key_id: string | null;
  run_id: string | null;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface ModeCapability {
  mode: UserFacingMode;
  label: string;
  enabled: boolean;
  backing_tier: ExecutionTier | null;
  description: string;
  availability_reason: string | null;
}

export interface ApiKey {
  key_id: string;
  label: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface DashboardSummary {
  dataset_count: number;
  document_count: number;
  indexed_document_count: number;
  running_job_count: number;
  failed_job_count: number;
  agent_count: number;
  conversation_count: number;
}

export interface FeedbackEntry {
  feedback_id: string;
  run_id: string;
  agent_id: string;
  conversation_id: string | null;
  dataset_id: string | null;
  rating: FeedbackRating;
  comment: string;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  user_id: string;
  email: string;
  full_name: string;
  role: "admin" | "member" | "viewer";
  workspace_access: string[];
  last_active_at: string | null;
  has_api_key: boolean;
  invited_at: string;
  joined_at: string | null;
}



export interface Invoice {
  invoice_id: string;
  period: string;
  amount_cents: number;
  status: "paid" | "pending" | "overdue";
  created_at: string;
}

export interface GovernancePolicy {
  policy_id: string;
  name: string;
  category: string;
  value: string;
  description: string;
  updated_at: string;
  updated_by: string;
}

export interface AuditLogEntry {
  entry_id: string;
  actor: string;
  action: string;
  resource: string;
  detail: string;
  created_at: string;
}
