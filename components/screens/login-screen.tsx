"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand";
import { GoogleMark } from "@/components/google-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGoogleAuthorizationUrl, signInWithEmail } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function LoginScreen() {
  const router = useRouter();
  const { acceptEmailAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);

  const appHref = (slug?: string | null) => slug ? `/app/workspace/${slug}/overview` : "/app/overview";

  async function handleGoogleSignIn() {
    setError(null);
    setIsGoogleRedirecting(true);
    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const response = await getGoogleAuthorizationUrl(redirectUri);
      window.location.href = response.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start Google sign-in");
      setIsGoogleRedirecting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await signInWithEmail({ email, password });
      acceptEmailAuth(response);
      router.push(appHref(response.workspace_slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10 transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[800px] w-[800px] rounded-full bg-foreground/[0.03] blur-[120px]" />
        <div className="absolute -right-[10%] top-[20%] h-[800px] w-[800px] rounded-full bg-foreground/[0.04] blur-[120px]" />
      </div>
      <div className="absolute right-6 top-6 z-50"><ThemeToggle /></div>
      <div className="relative z-10 w-full max-w-[400px] animate-fade-in">
        <div className="mb-8 flex flex-col items-center"><BrandMark size="lg" /></div>
        <div className="glass rounded-[2rem] p-8 shadow-2xl shadow-black/5 dark:shadow-black/20 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Enter your details to sign in</p>
          </div>
          <Button type="button" variant="outline" disabled={isGoogleRedirecting || isSubmitting} onClick={handleGoogleSignIn} className="mb-5 h-11 w-full rounded-xl text-base shadow-sm">
            <GoogleMark className="mr-2 h-4 w-4" />
            {isGoogleRedirecting ? "Redirecting..." : "Continue with Google"}
          </Button>
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/30" />
            <span className="text-xs font-medium text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border/30" />
          </div>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <Input label="Email address" type="email" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error ? <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl text-base shadow-sm">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">Don't have an account? <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">Sign up</Link></p>
      </div>
    </main>
  );
}
