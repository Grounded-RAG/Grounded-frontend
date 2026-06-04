const BACKEND_ORIGIN = "http://51.20.18.111:8000";
const LOCAL_API_BASE_URL = "http://localhost:8000";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalFrontendHost(hostname: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(hostname);
}

/**
 * Browser API base URL.
 * On Vercel (HTTPS), use same-origin `/v1/...` proxied by next.config rewrites (avoids mixed-content block).
 * Locally, call the backend directly.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const injected = window.__GROUNDED_API_BASE_URL__;
    if (typeof injected === "string") {
      return normalizeBaseUrl(injected);
    }
    if (isLocalFrontendHost(window.location.hostname)) {
      return LOCAL_API_BASE_URL;
    }
    return "";
  }
  if (process.env.NODE_ENV === "development") {
    return LOCAL_API_BASE_URL;
  }
  if (process.env.VERCEL) {
    return "";
  }
  return BACKEND_ORIGIN;
}

/** Injected into HTML for client hydration (must match getApiBaseUrl() in the browser). */
export function getServerApiBaseUrl(): string {
  if (process.env.NODE_ENV === "development") {
    return LOCAL_API_BASE_URL;
  }
  if (process.env.VERCEL) {
    return "";
  }
  return BACKEND_ORIGIN;
}

export function isProductionApiMisconfigured(): boolean {
  return false;
}

export function getApiMisconfigurationMessage(): string {
  return "";
}
