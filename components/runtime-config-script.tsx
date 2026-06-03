import { getServerApiBaseUrl } from "@/lib/api-base-url";

export function RuntimeConfigScript() {
  const apiBaseUrl = getServerApiBaseUrl();
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `window.__GROUNDED_API_BASE_URL__=${JSON.stringify(apiBaseUrl)};`,
      }}
    />
  );
}
