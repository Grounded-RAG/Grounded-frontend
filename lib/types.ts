export type ExecutionTier = "standard" | "enterprise" | "critical";
export type UserFacingMode = "auto" | "instant" | "thinking" | "verified";
export type VerificationStatus = "passed" | "degraded";
export type ConfidenceLabel = "low" | "medium" | "high";
export type SupportSummary = "grounded" | "partial" | "insufficient";
export type IngestionJobStatus = "queued" | "running" | "indexed" | "failed";
export type DocumentStatus = "uploaded" | "processing" | "indexed" | "failed";
export type SensitivityLevel = "public" | "internal" | "confidential" | "restricted";
export type FreshnessProfile = "stable" | "balanced" | "aggressive";
export type AgentStatus = "active" | "archived";
export type MessageRole = "user" | "assistant";
export type GroundingPolicy = "strict" | "balanced" | "live";
export type FeedbackStatus = "new" | "triaged" | "resolved";
export type FeedbackRating = "positive" | "negative" | "neutral";

export interface AuthSmokeResponse {
  status: string;
  tenant_id: string;
  tenant_name: string;
  subscription_plan: string;
  max_execution_tier: ExecutionTier;
  api_key_id: string;
  api_key_label: string;
}

export interface EmailAuthResponse extends AuthSmokeResponse {
  api_key: string;
  workspace_id: string;
  workspace_name: string;
  workspace_slug: string;
  created_tenant: boolean;
  created_workspace: boolean;
}

export interface Workspace {
  workspace_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  dataset_id: string;
  workspace_id: string | null;
  name: string;
  description?: string | null;
  domain: string;
  sensitivity_level: SensitivityLevel | string;
  freshness_profile: FreshnessProfile | string;
  min_execution_tier: ExecutionTier;
  allow_web_fallback: boolean;
  allow_internal_model_retrieval: boolean;
  created_at: string;
}

export interface DatasetDocument {
  document_id: string;
  dataset_id: string;
  title: string | null;
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

export interface DatasetUploadResponse {
  dataset_id: string;
  document_id: string;
  job_id: string;
  filename: string;
  title: string;
  mime_type: string;
  file_size_bytes: number;
  document_status: DocumentStatus;
  job_status: IngestionJobStatus;
  already_exists: boolean;
}

export interface Agent {
  agent_id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  system_instructions: string;
  default_mode: UserFacingMode;
  allowed_modes: UserFacingMode[];
  grounding_policy?: GroundingPolicy;
  status: AgentStatus | string;
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
  stage_latencies_ms?: Record<string, number>;
  total_latency_ms: number;
  feedback_rating?: "positive" | "negative" | null;
  feedback_reasons?: string[];
  feedback_text?: string | null;
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

export interface AgentChatResponse {
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
  agent_id: string;
  conversation_id: string;
  dataset_id: string;
  mode: UserFacingMode;
  run_id: string;
  user_message_id: string;
  assistant_message_id: string;
}

export type FeedbackReason =
  | "FAILS_TO_ANSWER"
  | "HALLUCINATION"
  | "IRRELEVANT_INFORMATION"
  | "WRONG_CITATIONS"
  | "PROSE_ERRORS"
  | "OTHER";

export interface FeedbackSubmission {
  rating: "positive" | "negative";
  reasons: FeedbackReason[];
  freeform_text: string | null;
}

export type WorkflowStepId =
  | "init"
  | "conversation_history"
  | "check_retrieval"
  | "research"
  | "generate";

export type WorkflowStepStatus = "idle" | "running" | "completed";

export interface WorkflowStep {
  step: WorkflowStepId;
  label: string;
  status: WorkflowStepStatus;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export type ChatStreamEvent =
  | { type: "step_started"; step: WorkflowStepId; label: string }
  | { type: "step_completed"; step: WorkflowStepId; label: string; duration_ms: number; evidence_count?: number; message_count?: number }
  | { type: "answer"; data: AgentChatResponse }
  | { type: "error"; detail: string; status_code: number }
  | { type: "done" };

export interface ModeCapability {
  mode: UserFacingMode;
  label: string;
  enabled: boolean;
  backing_tier: ExecutionTier | null;
  description: string;
  availability_reason: "coming_soon" | "plan_restricted" | "tier_restricted" | null;
}

export interface FeatureCapability {
  key: string;
  enabled: boolean;
  description: string;
  availability_reason: "coming_soon" | "plan_restricted" | "tier_restricted" | null;
}

export interface CapabilitiesResponse {
  subscription_plan: string;
  max_execution_tier: ExecutionTier;
  default_mode: UserFacingMode;
  manual_mode_override_allowed: boolean;
  modes: ModeCapability[];
  features: FeatureCapability[];
}

export interface ApiKey {
  key_id: string;
  label: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface ApiKeyCreateResponse extends ApiKey {
  api_key: string;
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

export interface DashboardRecentJob {
  job_id: string;
  document_id: string;
  dataset_id: string;
  document_title: string | null;
  status: IngestionJobStatus;
  attempt_count: number;
  error_code: string | null;
  error_detail: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
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
