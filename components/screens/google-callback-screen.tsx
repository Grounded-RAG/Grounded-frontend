"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { completeGoogleOAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function workspaceHref(slug?: string | null) {
  return slug ? `/app/workspace/${slug}/overview` : "/app/overview";
}

export function GoogleCallbackScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { acceptEmailAuth, setWorkspace } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const code = useMemo(() => searchParams.get("code")?.trim() ?? "", [searchParams]);
  const oauthError = useMemo(() => searchParams.get("error")?.trim() ?? "", [searchParams]);

  useEffect(() => {
    if (oauthError) {
      setError(`Google sign-in was cancelled: ${oauthError}`);
      return;
    }

    if (!code) {
      setError("Google sign-in did not return an authorization code.");
      return;
    }

    let cancelled = false;

    async function finishGoogleAuth() {
      try {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const response = await completeGoogleOAuth(code, redirectUri);
        if (cancelled) return;

        acceptEmailAuth(response);
        if (response.workspace_id && response.workspace_name && response.workspace_slug) {
          setWorkspace(response.workspace_id, response.workspace_name, response.workspace_slug);
        } else {
          setWorkspace(null, null, null);
        }

        if (response.created_tenant || response.created_workspace) {
          router.replace("/onboarding");
          return;
        }
        router.replace(workspaceHref(response.workspace_slug));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to complete Google sign-in.");
        }
      }
    }

    void finishGoogleAuth();
    return () => {
      cancelled = true;
    };
  }, [acceptEmailAuth, code, oauthError, router, setWorkspace]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10 transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[800px] w-[800px] rounded-full bg-foreground/[0.03] blur-[120px]" />
        <div className="absolute -right-[10%] top-[20%] h-[800px] w-[800px] rounded-full bg-foreground/[0.04] blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-[400px] animate-fade-in">
        <div className="mb-8 flex flex-col items-center"><BrandMark size="lg" /></div>
        <div className="glass rounded-[2rem] p-8 text-center shadow-2xl shadow-black/5 dark:shadow-black/20 md:p-10">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {error ? "Google sign-in failed" : "Finishing Google sign-in"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? "We are verifying your Google account and preparing your workspace."}
          </p>
          {error ? (
            <Button type="button" onClick={() => router.replace("/login")} className="mt-6 h-11 w-full rounded-xl text-base shadow-sm">
              Back to login
            </Button>
          ) : (
            <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
          )}
        </div>
      </div>
    </main>
  );
}
