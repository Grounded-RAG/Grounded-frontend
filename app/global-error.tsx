"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#09090b", color: "#fafafa" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "1.5rem" }}>
          <div style={{ maxWidth: "28rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h1>
            <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#a1a1aa" }}>
              {error.message || "The app crashed while loading."}
            </p>
            {error.digest ? (
              <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#71717a" }}>
                Error ID: {error.digest}
              </p>
            ) : null}
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", background: "#fafafa", color: "#09090b", cursor: "pointer" }}
              >
                Try again
              </button>
              <a
                href="/login"
                style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #3f3f46", color: "#fafafa", textDecoration: "none" }}
              >
                Go to sign in
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
