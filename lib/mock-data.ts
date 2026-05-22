import type {
  Agent, ApiKey, AuditLogEntry, Conversation, Dataset,
  DatasetDocument, FeedbackEntry, GovernancePolicy, IngestionJob,
  Invoice, Message, ModeCapability, Run, TeamMember, Workspace,
} from "@/lib/types";

export const organization = {
  organization_id: "org_acme",
  name: "Acme Research",
  subscription_plan: "Business" as const,
  max_execution_tier: "standard",
};

export const workspaces: Workspace[] = [
  {
    workspace_id: "ws_policy",
    name: "Policy Intelligence",
    slug: "policy-intelligence",
    description: "Grounded answers over operating policies, risk memos, and support playbooks.",
    created_at: "2026-04-02T10:30:00Z",
    updated_at: "2026-05-01T09:10:00Z",
  },
  {
    workspace_id: "ws_research",
    name: "Research Desk",
    slug: "research-desk",
    description: "Evidence review for market, customer, and product research.",
    created_at: "2026-04-15T14:20:00Z",
    updated_at: "2026-04-28T16:45:00Z",
  },
];

export const capabilities: ModeCapability[] = [
  { mode: "auto", label: "Auto", enabled: true, backing_tier: "standard", description: "Recommended mode following the current Standard path.", availability_reason: null },
  { mode: "instant", label: "Instant", enabled: true, backing_tier: "standard", description: "Fast grounded answers for everyday document questions.", availability_reason: null },
  { mode: "thinking", label: "Thinking", enabled: true, backing_tier: "enterprise", description: "Deeper retrieval for harder questions.", availability_reason: null },
  { mode: "verified", label: "Verified", enabled: true, backing_tier: "critical", description: "Highest-assurance path for sensitive work.", availability_reason: null },
];

export const datasets: Dataset[] = [
  {
    dataset_id: "ds_policy",
    workspace_id: "ws_policy",
    name: "Operations Policy Library",
    description: "Core operating policies, access standards, and retention guidelines for internal use.",
    domain: "general",
    sensitivity_level: "confidential",
    freshness_profile: "balanced",
    min_execution_tier: "standard",
    allow_web_fallback: false,
    allow_internal_model_retrieval: true,
    created_at: "2026-04-04T11:00:00Z",
  },
  {
    dataset_id: "ds_risk",
    workspace_id: "ws_policy",
    name: "Risk Review Memos",
    description: "Exception memos, risk assessments, and vendor compliance reviews.",
    domain: "general",
    sensitivity_level: "restricted",
    freshness_profile: "aggressive",
    min_execution_tier: "enterprise",
    allow_web_fallback: false,
    allow_internal_model_retrieval: true,
    created_at: "2026-04-10T09:25:00Z",
  },
  {
    dataset_id: "ds_support",
    workspace_id: "ws_policy",
    name: "Support Escalation Notes",
    description: "Escalation paths, prior resolutions, and tier-3 dispute workflows.",
    domain: "general",
    sensitivity_level: "internal",
    freshness_profile: "aggressive",
    min_execution_tier: "standard",
    allow_web_fallback: true,
    allow_internal_model_retrieval: true,
    created_at: "2026-04-21T16:40:00Z",
  },
  {
    dataset_id: "ds_blank",
    workspace_id: "ws_research",
    name: "Market Research Intake",
    description: "Incoming market analysis reports and competitive intelligence.",
    domain: "general",
    sensitivity_level: "internal",
    freshness_profile: "stable",
    min_execution_tier: "standard",
    allow_web_fallback: false,
    allow_internal_model_retrieval: true,
    created_at: "2026-05-01T12:00:00Z",
  },
  {
    dataset_id: "ds_product",
    workspace_id: "ws_research",
    name: "Product Requirements Archive",
    description: "PRDs, feature specs, and product roadmap documentation.",
    domain: "general",
    sensitivity_level: "internal",
    freshness_profile: "stable",
    min_execution_tier: "standard",
    allow_web_fallback: false,
    allow_internal_model_retrieval: true,
    created_at: "2026-04-28T08:15:00Z",
  },
];

export const documents: DatasetDocument[] = [
  { document_id: "doc_policy_1", dataset_id: "ds_policy", title: "Workspace Access Policy.pdf", mime_type: "application/pdf", file_size_bytes: 2480000, status: "indexed", created_at: "2026-04-04T11:05:00Z" },
  { document_id: "doc_policy_2", dataset_id: "ds_policy", title: "Data Retention Standard.docx", mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", file_size_bytes: 860000, status: "indexed", created_at: "2026-04-06T13:35:00Z" },
  { document_id: "doc_policy_3", dataset_id: "ds_policy", title: "Remote Access Guidelines.pdf", mime_type: "application/pdf", file_size_bytes: 1120000, status: "uploaded", created_at: "2026-05-04T10:20:00Z" },
  { document_id: "doc_support_1", dataset_id: "ds_support", title: "Escalation Matrix.txt", mime_type: "text/plain", file_size_bytes: 228000, status: "processing", created_at: "2026-05-02T08:30:00Z" },
  { document_id: "doc_risk_1", dataset_id: "ds_risk", title: "Vendor Risk Exception Memo.pdf", mime_type: "application/pdf", file_size_bytes: 1640000, status: "failed", created_at: "2026-04-29T15:10:00Z" },
];

export const ingestionJobs: IngestionJob[] = [
  { job_id: "job_policy_1", document_id: "doc_policy_1", dataset_id: "ds_policy", status: "indexed", attempt_count: 1, error_code: null, error_detail: null, started_at: "2026-04-04T11:05:00Z", completed_at: "2026-04-04T11:08:00Z", created_at: "2026-04-04T11:05:00Z" },
  { job_id: "job_policy_2", document_id: "doc_policy_2", dataset_id: "ds_policy", status: "indexed", attempt_count: 1, error_code: null, error_detail: null, started_at: "2026-04-06T13:35:00Z", completed_at: "2026-04-06T13:38:00Z", created_at: "2026-04-06T13:35:00Z" },
  { job_id: "job_policy_3", document_id: "doc_policy_3", dataset_id: "ds_policy", status: "queued", attempt_count: 0, error_code: null, error_detail: null, started_at: null, completed_at: null, created_at: "2026-05-04T10:20:00Z" },
  { job_id: "job_support_1", document_id: "doc_support_1", dataset_id: "ds_support", status: "running", attempt_count: 1, error_code: null, error_detail: null, started_at: "2026-05-02T08:31:00Z", completed_at: null, created_at: "2026-05-02T08:30:00Z" },
  { job_id: "job_risk_1", document_id: "doc_risk_1", dataset_id: "ds_risk", status: "failed", attempt_count: 2, error_code: "UNSUPPORTED_SCAN", error_detail: "The file contains scanned pages without extractable text. OCR-based ingestion is not supported in the current pipeline.", started_at: "2026-04-29T15:11:00Z", completed_at: "2026-04-29T15:13:00Z", created_at: "2026-04-29T15:10:00Z" },
];

export const agents: Agent[] = [
  { agent_id: "ag_policy", workspace_id: "ws_policy", name: "Policy Copilot", description: "Answers policy questions with citations and escalation context.", system_instructions: "Answer from approved policy documents. Call out uncertainty.", default_mode: "auto", allowed_modes: ["auto", "instant"], grounding_policy: "strict", status: "active", dataset_ids: ["ds_policy", "ds_support"], created_at: "2026-04-12T11:00:00Z", updated_at: "2026-05-01T11:25:00Z" },
  { agent_id: "ag_risk", workspace_id: "ws_policy", name: "Risk Triage", description: "Summarizes risk exceptions and flags weak support.", system_instructions: "Prefer grounded citations and identify missing evidence.", default_mode: "instant", allowed_modes: ["auto", "instant"], grounding_policy: "strict", status: "active", dataset_ids: ["ds_risk"], created_at: "2026-04-18T14:10:00Z", updated_at: "2026-04-30T10:15:00Z" },
  { agent_id: "ag_archive", workspace_id: "ws_policy", name: "Archive Analyst", description: "Archived experiment for legacy operating notes.", system_instructions: "Use archived notes only.", default_mode: "instant", allowed_modes: ["instant"], grounding_policy: "strict", status: "archived", dataset_ids: [], created_at: "2026-03-22T09:30:00Z", updated_at: "2026-04-20T12:00:00Z" },
  { agent_id: "ag_support", workspace_id: "ws_policy", name: "Support Navigator", description: "Helps support teams find escalation paths and prior resolutions.", system_instructions: "Focus on escalation matrix and prior tickets.", default_mode: "auto", allowed_modes: ["auto", "instant"], grounding_policy: "balanced", status: "active", dataset_ids: ["ds_support"], created_at: "2026-04-25T09:00:00Z", updated_at: "2026-05-03T14:30:00Z" },
  { agent_id: "ag_research", workspace_id: "ws_research", name: "Research Analyst", description: "Synthesizes product and market research with citations.", system_instructions: "Cite all claims. Prefer primary sources.", default_mode: "auto", allowed_modes: ["auto", "instant", "thinking"], grounding_policy: "balanced", status: "active", dataset_ids: ["ds_blank", "ds_product"], created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-04T11:20:00Z" },
];

export const conversations: Conversation[] = [
  { conversation_id: "conv_policy_1", workspace_id: "ws_policy", agent_id: "ag_policy", created_by_api_key_id: null, title: "Access exception policy", last_used_mode: "auto", created_at: "2026-05-01T14:00:00Z", updated_at: "2026-05-02T09:20:00Z" },
  { conversation_id: "conv_policy_2", workspace_id: "ws_policy", agent_id: "ag_policy", created_by_api_key_id: null, title: "Retention period for exports", last_used_mode: "instant", created_at: "2026-04-29T10:00:00Z", updated_at: "2026-04-29T10:14:00Z" },
  { conversation_id: "conv_risk_1", workspace_id: "ws_policy", agent_id: "ag_risk", created_by_api_key_id: null, title: "Vendor exception review", last_used_mode: "instant", created_at: "2026-05-01T16:00:00Z", updated_at: "2026-05-01T16:04:00Z" },
];

const citations = [
  { citation_id: "cit_1", chunk_id: "chunk_22", document_id: "doc_policy_1", chunk_index: 22, quote: "Temporary access exceptions require owner approval and a scheduled review date." },
  { citation_id: "cit_2", chunk_id: "chunk_31", document_id: "doc_policy_2", chunk_index: 31, quote: "Exported data should be retained only for the approved business purpose window." },
];

export const runs: Run[] = [
  {
    run_id: "run_1001",
    dataset_id: "ds_policy",
    agent_id: "ag_policy",
    conversation_id: "conv_policy_1",
    selected_mode: "auto",
    requested_tier: "standard",
    router_recommendation: "standard",
    effective_tier: "standard",
    routing_reason: "Evidence was available in indexed workspace policy documents.",
    query: "Can a contractor receive temporary workspace access?",
    answer: "Yes, temporary contractor access is allowed when an internal owner approves it and a review date is set. The answer is grounded in the access policy and should be paired with an expiration check.",
    citations,
    confidence_score: 0.91,
    confidence_label: "high",
    support_summary: "grounded",
    verification_status: "passed",
    degraded_reasons: [],
    generator_provider: "OpenAI",
    provider_backend: "managed",
    provider_model: "grounded-standard",
    provider_fallback_used: false,
    provider_fallback_from: null,
    retrieved_chunk_ids: ["chunk_20", "chunk_21", "chunk_22", "chunk_23"],
    selected_evidence_ids: ["chunk_22"],
    total_latency_ms: 1420,
    created_at: "2026-05-02T09:20:00Z",
  },
  {
    run_id: "run_1002",
    dataset_id: "ds_risk",
    agent_id: "ag_risk",
    conversation_id: null,
    selected_mode: "instant",
    requested_tier: "standard",
    router_recommendation: "enterprise",
    effective_tier: "standard",
    routing_reason: "The query likely needs deeper review, but the current plan is limited to Standard execution.",
    query: "Is this vendor exception still acceptable for regulated data?",
    answer: "The available memo is not enough to confirm acceptability for regulated data. It references an exception but does not include the final approving authority or control owner.",
    citations: [],
    confidence_score: 0.42,
    confidence_label: "low",
    support_summary: "insufficient",
    verification_status: "degraded",
    degraded_reasons: ["NO_GROUNDED_EVIDENCE", "LOW_CONFIDENCE_SUPPORT"],
    generator_provider: "OpenAI",
    provider_backend: "managed",
    provider_model: "grounded-standard",
    provider_fallback_used: true,
    provider_fallback_from: "primary-retriever",
    retrieved_chunk_ids: ["chunk_44", "chunk_45"],
    selected_evidence_ids: [],
    total_latency_ms: 980,
    created_at: "2026-05-01T16:04:00Z",
  },
  {
    run_id: "run_1003",
    dataset_id: "ds_policy",
    agent_id: "ag_policy",
    conversation_id: "conv_policy_2",
    selected_mode: "instant",
    requested_tier: "standard",
    router_recommendation: "standard",
    effective_tier: "standard",
    routing_reason: "Fast retrieval matched the request with available policy data.",
    query: "What is the data retention period for exported reports?",
    answer: "Exported reports should be retained for the duration of the approved business purpose, typically 90 days, after which they must be securely deleted or archived.",
    citations: [citations[1]],
    confidence_score: 0.74,
    confidence_label: "medium",
    support_summary: "partial",
    verification_status: "passed",
    degraded_reasons: [],
    generator_provider: "OpenAI",
    provider_backend: "managed",
    provider_model: "grounded-standard",
    provider_fallback_used: false,
    provider_fallback_from: null,
    retrieved_chunk_ids: ["chunk_30", "chunk_31", "chunk_32"],
    selected_evidence_ids: ["chunk_31"],
    total_latency_ms: 640,
    created_at: "2026-04-29T10:14:00Z",
  },
  {
    run_id: "run_1004",
    dataset_id: "ds_support",
    agent_id: "ag_support",
    conversation_id: null,
    selected_mode: "auto",
    requested_tier: "standard",
    router_recommendation: "standard",
    effective_tier: "standard",
    routing_reason: "Support dataset is still being processed; partial evidence was used.",
    query: "Who should I escalate a tier-3 billing dispute to?",
    answer: "Based on available escalation notes, tier-3 billing disputes should be routed to the Finance Operations lead. However, the escalation matrix is still being indexed.",
    citations: [],
    confidence_score: 0.56,
    confidence_label: "medium",
    support_summary: "partial",
    verification_status: "degraded",
    degraded_reasons: ["INSUFFICIENT_SUPPORT", "QUERY_REQUIRES_CLARIFICATION"],
    generator_provider: "OpenAI",
    provider_backend: "managed",
    provider_model: "grounded-standard",
    provider_fallback_used: false,
    provider_fallback_from: null,
    retrieved_chunk_ids: ["chunk_50"],
    selected_evidence_ids: [],
    total_latency_ms: 1180,
    created_at: "2026-05-03T14:30:00Z",
  },
];

export const messages: Message[] = [
  { message_id: "msg_1", conversation_id: "conv_policy_1", created_by_api_key_id: null, run_id: null, role: "user", content: "Can a contractor receive temporary workspace access?", created_at: "2026-05-02T09:19:00Z" },
  { message_id: "msg_2", conversation_id: "conv_policy_1", created_by_api_key_id: null, run_id: "run_1001", role: "assistant", content: runs[0].answer, created_at: "2026-05-02T09:20:00Z" },
  { message_id: "msg_3", conversation_id: "conv_policy_1", created_by_api_key_id: null, run_id: null, role: "user", content: "What about temporary access for external auditors?", created_at: "2026-05-02T09:22:00Z" },
  { message_id: "msg_4", conversation_id: "conv_policy_1", created_by_api_key_id: null, run_id: "run_1001", role: "assistant", content: "External auditors follow the same exception flow as contractors, with an additional requirement for a signed NDA and a compliance officer sign-off before access is provisioned.", created_at: "2026-05-02T09:23:00Z" },
];

export const apiKeys: ApiKey[] = [
  { key_id: "key_live", label: "Production API gateway", last_used_at: "2026-05-02T12:20:00Z", revoked_at: null, created_at: "2026-04-08T10:00:00Z" },
  { key_id: "key_dev", label: "Local development", last_used_at: "2026-04-30T08:44:00Z", revoked_at: null, created_at: "2026-04-20T09:15:00Z" },
  { key_id: "key_staging", label: "Staging environment", last_used_at: "2026-05-04T09:12:00Z", revoked_at: null, created_at: "2026-04-22T11:30:00Z" },
  { key_id: "key_old", label: "Old staging key", last_used_at: "2026-04-18T13:12:00Z", revoked_at: "2026-04-25T11:05:00Z", created_at: "2026-04-01T16:00:00Z" },
];

/* ─── Mock data for new product pages ─── */

export const feedbackEntries: FeedbackEntry[] = [
  { feedback_id: "fb_1", run_id: "run_1001", agent_id: "ag_policy", conversation_id: "conv_policy_1", dataset_id: "ds_policy", rating: "positive", comment: "Accurate answer with good citations.", status: "resolved", created_at: "2026-05-02T09:25:00Z", updated_at: "2026-05-02T12:00:00Z" },
  { feedback_id: "fb_2", run_id: "run_1002", agent_id: "ag_risk", conversation_id: null, dataset_id: "ds_risk", rating: "negative", comment: "Answer was not specific enough for regulatory review.", status: "triaged", created_at: "2026-05-01T16:10:00Z", updated_at: "2026-05-02T09:00:00Z" },
  { feedback_id: "fb_3", run_id: "run_1003", agent_id: "ag_policy", conversation_id: "conv_policy_2", dataset_id: "ds_policy", rating: "positive", comment: "", status: "new", created_at: "2026-04-29T10:20:00Z", updated_at: "2026-04-29T10:20:00Z" },
  { feedback_id: "fb_4", run_id: "run_1004", agent_id: "ag_support", conversation_id: null, dataset_id: "ds_support", rating: "negative", comment: "The escalation matrix is incomplete. Agent should have flagged this.", status: "new", created_at: "2026-05-03T14:35:00Z", updated_at: "2026-05-03T14:35:00Z" },
  { feedback_id: "fb_5", run_id: "run_1001", agent_id: "ag_policy", conversation_id: "conv_policy_1", dataset_id: "ds_policy", rating: "neutral", comment: "Correct but could use more detail on the NDA process.", status: "triaged", created_at: "2026-05-02T09:30:00Z", updated_at: "2026-05-03T10:00:00Z" },
];

export const teamMembers: TeamMember[] = [
  { user_id: "usr_1", email: "admin@acme.com", full_name: "Sarah Chen", role: "admin", workspace_access: ["ws_policy", "ws_research"], last_active_at: "2026-05-04T14:30:00Z", has_api_key: true, invited_at: "2026-03-15T10:00:00Z", joined_at: "2026-03-15T10:05:00Z" },
  { user_id: "usr_2", email: "james.policy@acme.com", full_name: "James Okafor", role: "member", workspace_access: ["ws_policy"], last_active_at: "2026-05-03T16:20:00Z", has_api_key: true, invited_at: "2026-04-01T09:00:00Z", joined_at: "2026-04-01T09:30:00Z" },
  { user_id: "usr_3", email: "maria.research@acme.com", full_name: "Maria Santos", role: "member", workspace_access: ["ws_research"], last_active_at: "2026-05-02T11:45:00Z", has_api_key: false, invited_at: "2026-04-10T14:00:00Z", joined_at: "2026-04-10T14:15:00Z" },
  { user_id: "usr_4", email: "audit@acme.com", full_name: "David Park", role: "viewer", workspace_access: ["ws_policy"], last_active_at: "2026-04-28T09:00:00Z", has_api_key: false, invited_at: "2026-04-20T11:00:00Z", joined_at: "2026-04-20T11:30:00Z" },
  { user_id: "usr_5", email: "pending@partner.com", full_name: "Alex Rivera", role: "viewer", workspace_access: [], last_active_at: null, has_api_key: false, invited_at: "2026-05-03T15:00:00Z", joined_at: null },
];



export const invoices: Invoice[] = [
  { invoice_id: "inv_001", period: "April 2026", amount_cents: 19900, status: "paid", created_at: "2026-05-01T00:00:00Z" },
  { invoice_id: "inv_002", period: "March 2026", amount_cents: 19900, status: "paid", created_at: "2026-04-01T00:00:00Z" },
  { invoice_id: "inv_003", period: "February 2026", amount_cents: 14900, status: "paid", created_at: "2026-03-01T00:00:00Z" },
];

export const governancePolicies: GovernancePolicy[] = [
  { policy_id: "gov_1", name: "Data retention period", category: "Data", value: "90 days", description: "Default retention window for workspace data exports.", updated_at: "2026-04-15T10:00:00Z", updated_by: "Sarah Chen" },
  { policy_id: "gov_2", name: "Default sensitivity level", category: "Data", value: "Internal", description: "Default classification for new datasets.", updated_at: "2026-04-15T10:00:00Z", updated_by: "Sarah Chen" },
  { policy_id: "gov_3", name: "Web fallback policy", category: "Retrieval", value: "Disabled", description: "Organization-wide default for web fallback on queries.", updated_at: "2026-04-20T09:30:00Z", updated_by: "Sarah Chen" },
  { policy_id: "gov_4", name: "Mode availability", category: "Execution", value: "All modes", description: "Which execution modes are available across workspaces.", updated_at: "2026-04-15T10:00:00Z", updated_by: "Sarah Chen" },
  { policy_id: "gov_5", name: "MFA enforcement", category: "Security", value: "Required for admins", description: "Multi-factor authentication requirements by role.", updated_at: "2026-05-01T08:00:00Z", updated_by: "Sarah Chen" },
];

export const auditLog: AuditLogEntry[] = [
  { entry_id: "aud_1", actor: "Sarah Chen", action: "Updated policy", resource: "Web fallback policy", detail: "Changed from Enabled to Disabled", created_at: "2026-04-20T09:30:00Z" },
  { entry_id: "aud_2", actor: "Sarah Chen", action: "Invited member", resource: "Alex Rivera", detail: "Invited as Viewer", created_at: "2026-05-03T15:00:00Z" },
  { entry_id: "aud_3", actor: "James Okafor", action: "Created dataset", resource: "Support Escalation Notes", detail: "Sensitivity: internal, Tier: standard", created_at: "2026-04-21T16:40:00Z" },
  { entry_id: "aud_4", actor: "Sarah Chen", action: "Updated policy", resource: "MFA enforcement", detail: "Changed from Optional to Required for admins", created_at: "2026-05-01T08:00:00Z" },
  { entry_id: "aud_5", actor: "James Okafor", action: "Revoked API key", resource: "Old staging key", detail: "Key revoked due to rotation policy", created_at: "2026-04-25T11:05:00Z" },
];
