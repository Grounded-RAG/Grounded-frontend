import type {
  Agent,
  AgentChatResponse,
  AgentUpdateRequest,
  ApiKey,
  ApiKeyCreateResponse,
  AuditLogListResponse,
  AuthSmokeResponse,
  CapabilitiesResponse,
  ChatStreamEvent,
  Conversation,
  DashboardRecentJob,
  DashboardSummary,
  Dataset,
  DatasetDocument,
  DatasetUploadResponse,
  EmailAuthResponse,
  FeedbackSubmission,
  IngestionJob,
  Message,
  Run,
  UserFacingMode,
  Workspace,
} from "@/lib/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

function authHeaders(apiKey: string, extra?: HeadersInit): HeadersInit {
  return { "X-API-Key": apiKey, ...extra };
}

function networkErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.detail;
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return `Request timed out. Verify NEXT_PUBLIC_API_BASE_URL (${API_BASE_URL}) is reachable from the browser.`;
    }
    return error.message;
  }
  return "Network request failed";
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    throw new ApiError(0, networkErrorMessage(error));
  } finally {
    clearTimeout(timeout);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const detail = typeof data === "object" && data && "detail" in data ? String((data as { detail: unknown }).detail) : response.statusText || "Request failed";
    throw new ApiError(response.status, detail);
  }

  return data as T;
}

async function request<T>(path: string, apiKey: string, init?: RequestInit): Promise<T> {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    ...init,
    headers: authHeaders(apiKey, init?.headers),
  });
  return parseResponse<T>(response);
}

export const apiBaseUrl = API_BASE_URL;

export async function signInWithEmail(payload: { email: string; password: string }) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/v1/auth/email/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<EmailAuthResponse>(response);
}

export async function signUpWithEmail(payload: { email: string; password: string; full_name?: string; organization_name?: string; workspace_name?: string }) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/v1/auth/email/sign-up`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<EmailAuthResponse>(response);
}

export async function getGoogleAuthorizationUrl(redirectUri: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/v1/auth/google/start?redirect_uri=${encodeURIComponent(redirectUri)}`);
  return parseResponse<{ authorization_url: string }>(response);
}

export async function completeGoogleOAuth(code: string, redirectUri: string) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/v1/auth/google/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  });
  return parseResponse<EmailAuthResponse>(response);
}

export function authenticateWithApiKey(apiKey: string) {
  return request<AuthSmokeResponse>("/v1/auth/smoke", apiKey);
}

export function getCapabilities(apiKey: string) {
  return request<CapabilitiesResponse>("/v1/capabilities", apiKey);
}

export function listWorkspaces(apiKey: string) {
  return request<Workspace[]>("/v1/workspaces", apiKey);
}

export function createWorkspace(apiKey: string, payload: { name: string; slug?: string; description?: string }) {
  return request<Workspace>("/v1/workspaces", apiKey, jsonInit("POST", payload));
}

export function updateWorkspace(apiKey: string, workspaceId: string, payload: { name?: string; slug?: string; description?: string }) {
  return request<Workspace>(`/v1/workspaces/${workspaceId}`, apiKey, jsonInit("PATCH", payload));
}

export function getDashboardSummary(apiKey: string) {
  return request<DashboardSummary>("/v1/dashboard/summary", apiKey);
}

export function getDashboardRecentRuns(apiKey: string, limit = 10) {
  return request<Run[]>(`/v1/dashboard/recent-runs?limit=${limit}`, apiKey);
}

export function getDashboardRecentJobs(apiKey: string, limit = 10) {
  return request<DashboardRecentJob[]>(`/v1/dashboard/recent-jobs?limit=${limit}`, apiKey);
}

export function listDatasets(apiKey: string, workspaceId?: string | null) {
  const query = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
  return request<Dataset[]>(`/v1/datasets${query}`, apiKey);
}

export function getDataset(apiKey: string, datasetId: string) {
  return request<Dataset>(`/v1/datasets/${datasetId}`, apiKey);
}

export function createDataset(apiKey: string, payload: {
  workspace_id: string;
  name: string;
  domain?: string;
  sensitivity_level?: string;
  freshness_profile?: string;
  min_execution_tier?: string;
  allow_web_fallback?: boolean;
  allow_internal_model_retrieval?: boolean;
}) {
  return request<Dataset>("/v1/datasets", apiKey, jsonInit("POST", payload));
}

export function listDatasetDocuments(apiKey: string, datasetId: string) {
  return request<DatasetDocument[]>(`/v1/datasets/${datasetId}/documents`, apiKey);
}

export function listDatasetJobs(apiKey: string, datasetId: string) {
  return request<IngestionJob[]>(`/v1/datasets/${datasetId}/ingestion-jobs`, apiKey);
}

export async function uploadDatasetDocument(apiKey: string, datasetId: string, file: File, title?: string) {
  const body = new FormData();
  body.append("file", file);
  if (title) body.append("title", title);
  const response = await fetchWithTimeout(`${API_BASE_URL}/v1/datasets/${datasetId}/upload`, {
    method: "POST",
    headers: authHeaders(apiKey),
    body,
  }, 120_000);
  return parseResponse<DatasetUploadResponse>(response);
}

export function listAgents(apiKey: string, workspaceId?: string | null) {
  const query = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : "";
  return request<Agent[]>(`/v1/agents${query}`, apiKey);
}

export function getAgent(apiKey: string, agentId: string) {
  return request<Agent>(`/v1/agents/${agentId}`, apiKey);
}

export function createAgent(apiKey: string, payload: {
  workspace_id: string;
  name: string;
  description?: string;
  system_instructions?: string;
  default_mode?: UserFacingMode;
  allowed_modes?: UserFacingMode[];
}) {
  return request<Agent>("/v1/agents", apiKey, jsonInit("POST", payload));
}

export function updateAgent(apiKey: string, agentId: string, payload: AgentUpdateRequest) {
  return request<Agent>(`/v1/agents/${agentId}`, apiKey, jsonInit("PATCH", payload));
}

export function deleteAgent(apiKey: string, agentId: string) {
  return request<void>(`/v1/agents/${agentId}`, apiKey, { method: "DELETE" });
}

export function attachDatasetToAgent(apiKey: string, agentId: string, datasetId: string) {
  return request<Agent>(`/v1/agents/${agentId}/datasets`, apiKey, jsonInit("POST", { dataset_id: datasetId }));
}

export function detachDatasetFromAgent(apiKey: string, agentId: string, datasetId: string) {
  return request<void>(`/v1/agents/${agentId}/datasets/${datasetId}`, apiKey, { method: "DELETE" });
}

export function listAuditLogs(apiKey: string, workspaceId?: string | null, page = 1, pageSize = 50) {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (workspaceId) params.set("workspace_id", workspaceId);
  return request<AuditLogListResponse>(`/v1/audit-logs?${params.toString()}`, apiKey);
}

export function listAgentConversations(apiKey: string, agentId: string) {
  return request<Conversation[]>(`/v1/agents/${agentId}/conversations`, apiKey);
}

export function createAgentConversation(apiKey: string, agentId: string, payload: { title?: string; mode?: UserFacingMode }) {
  return request<Conversation>(`/v1/agents/${agentId}/conversations`, apiKey, jsonInit("POST", payload));
}

export function getConversationMessages(apiKey: string, conversationId: string) {
  return request<Message[]>(`/v1/conversations/${conversationId}/messages`, apiKey);
}

export function sendAgentChat(apiKey: string, agentId: string, payload: { conversation_id: string; message: string; mode?: UserFacingMode; dataset_id?: string }) {
  return request<AgentChatResponse>(`/v1/agents/${agentId}/chat`, apiKey, jsonInit("POST", payload));
}

export async function* streamAgentChat(apiKey: string, agentId: string, payload: { conversation_id: string; message: string; mode?: UserFacingMode; dataset_id?: string }): AsyncGenerator<ChatStreamEvent> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/v1/agents/${agentId}/chat/stream`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
  }, 300_000);

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => response.statusText);
    let detail = text;
    try {
      detail = (JSON.parse(text) as { detail?: string }).detail ?? text;
    } catch {
      // Keep the raw response text when the backend does not return JSON.
    }
    throw new ApiError(response.status, detail || response.statusText || "Request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const raw = trimmed.slice(6).trim();
        if (raw) yield JSON.parse(raw) as ChatStreamEvent;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function listRuns(apiKey: string, datasetId?: string | null, limit = 50) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (datasetId) params.set("dataset_id", datasetId);
  return request<Run[]>(`/v1/runs?${params.toString()}`, apiKey);
}

export function getRun(apiKey: string, runId: string) {
  return request<Run>(`/v1/runs/${runId}`, apiKey);
}

export function submitFeedback(apiKey: string, runId: string, feedback: FeedbackSubmission) {
  return request<Run>(`/v1/runs/${runId}/feedback`, apiKey, jsonInit("PATCH", feedback));
}

export function listApiKeys(apiKey: string) {
  return request<ApiKey[]>("/v1/api-keys", apiKey);
}

export function createApiKey(apiKey: string, label: string) {
  return request<ApiKeyCreateResponse>("/v1/api-keys", apiKey, jsonInit("POST", { label }));
}

export function revokeApiKey(apiKey: string, keyId: string) {
  return request<ApiKey>(`/v1/api-keys/${keyId}/revoke`, apiKey, { method: "POST" });
}

function jsonInit(method: "POST" | "PATCH", payload: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) };
}
