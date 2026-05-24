"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithEmail } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function LoginScreen() {
  const router = useRouter();
  const { acceptEmailAuth, signInWithApiKey, workspaceSlug } = useAuth();
  const [method, setMethod] = useState<"email" | "api">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appHref = (slug?: string | null) => slug ? `/app/workspace/${slug}/overview` : "/app/overview";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (method === "email") {
        const response = await signInWithEmail({ email, password });
        acceptEmailAuth(response);
        router.push(appHref(response.workspace_slug));
      } else {
        await signInWithApiKey(apiKey);
        router.push(appHref(workspaceSlug));
      }
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
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{method === "email" ? "Welcome back" : "Developer Access"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{method === "email" ? "Enter your details to sign in" : "Authenticate directly using your API key"}</p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-5">
            {method === "email" ? (
              <>
                <Input label="Email address" type="email" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </>
            ) : (
              <Input label="API Key" type="password" placeholder="gr_live_••••••••" value={apiKey} onChange={(event) => setApiKey(event.target.value)} required />
            )}
            {error ? <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl text-base shadow-sm">
              {isSubmitting ? "Signing in..." : method === "email" ? "Sign in" : "Authenticate"}
            </Button>
          </form>
          <div className="mt-8 border-t border-border/30 pt-6 text-center">
            <button onClick={() => setMethod(method === "email" ? "api" : "email")} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              {method === "email" ? <><KeyRound className="h-3.5 w-3.5" />Use API Key instead</> : "Use Email instead"}
            </button>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">Don't have an account? <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">Sign up</Link></p>
      </div>
    </main>
  );
}
