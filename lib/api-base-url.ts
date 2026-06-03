const DEFAULT_API_BASE_URL = "http://localhost:8000";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/** Server-only: used in root layout to inject runtime config into the page. */
export function getServerApiBaseUrl(): string {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  return normalizeBaseUrl(raw);
}

/**
 * Resolves the API base URL for browser requests.
 * Prefers `window.__GROUNDED_API_BASE_URL__` (set at runtime by the server layout)
 * so Docker can override via `API_BASE_URL` without rebuilding the image.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const injected = window.__GROUNDED_API_BASE_URL__;
    if (typeof injected === "string" && injected.length > 0) {
      return normalizeBaseUrl(injected);
    }
  }
  return getServerApiBaseUrl();
}

/** True when the app is opened on a remote host but API still points at localhost. */
export function isProductionApiMisconfigured(): boolean {
  if (typeof window === "undefined") return false;
  const api = getApiBaseUrl();
  const localApi = /localhost|127\.0\.0\.1/i.test(api);
  const remotePage = !/localhost|127\.0\.0\.1/i.test(window.location.hostname);
  return localApi && remotePage;
}

export function getApiMisconfigurationMessage(): string {
  return `API URL is set to ${getApiBaseUrl()} but the app is served from ${typeof window !== "undefined" ? window.location.origin : "a remote host"}. On the server, set API_BASE_URL and NEXT_PUBLIC_API_BASE_URL to your public backend URL (e.g. http://YOUR_SERVER_IP:8000), then rebuild the frontend.`;
}
