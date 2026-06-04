const PRODUCTION_API_BASE_URL = "http://51.20.18.111:8000";
const LOCAL_API_BASE_URL = "http://localhost:8000";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalFrontendHost(hostname: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(hostname);
}

/** Server-only: injected into the page for browser API calls. */
export function getServerApiBaseUrl(): string {
  if (process.env.NODE_ENV === "development") {
    return LOCAL_API_BASE_URL;
  }
  return PRODUCTION_API_BASE_URL;
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const injected = window.__GROUNDED_API_BASE_URL__;
    if (typeof injected === "string" && injected.length > 0) {
      return normalizeBaseUrl(injected);
    }
    return isLocalFrontendHost(window.location.hostname)
      ? LOCAL_API_BASE_URL
      : PRODUCTION_API_BASE_URL;
  }
  return getServerApiBaseUrl();
}

export function isProductionApiMisconfigured(): boolean {
  return false;
}

export function getApiMisconfigurationMessage(): string {
  return "";
}
