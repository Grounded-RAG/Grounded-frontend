"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand";
import { GoogleMark } from "@/components/google-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGoogleAuthorizationUrl, signUpWithEmail } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function SignUpScreen() {
  const router = useRouter();
  const { acceptEmailAuth } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);

  async function handleGoogleSignUp() {
    setError(null);
    setIsGoogleRedirecting(true);
    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const response = await getGoogleAuthorizationUrl(redirectUri);
      window.location.href = response.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start Google sign-up");
      setIsGoogleRedirecting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await signUpWithEmail({
        email,
        password,
        full_name: `${firstName} ${lastName}`.trim(),
        organization_name: organization,
        workspace_name: organization || "Default workspace",
      });
      acceptEmailAuth(response);
      router.push(`/app/workspace/${response.workspace_slug}/overview`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
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
      <div className="relative z-10 w-full max-w-[420px] animate-fade-in">
        <div className="mb-8 flex flex-col items-center"><BrandMark size="lg" /></div>
        <div className="glass rounded-[2rem] p-8 shadow-2xl shadow-black/5 dark:shadow-black/20 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create Your Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Set up your organization and account</p>
          </div>
          <Button type="button" variant="outline" disabled={isGoogleRedirecting || isSubmitting} onClick={handleGoogleSignUp} className="mb-5 h-11 w-full rounded-xl text-base shadow-sm">
            <GoogleMark className="mr-2 h-4 w-4" />
            {isGoogleRedirecting ? "Redirecting..." : "Continue with Google"}
          </Button>
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/30" />
            <span className="text-xs font-medium text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border/30" />
          </div>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" placeholder="Jane" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
              <Input label="Last name" placeholder="Doe" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </div>
            <Input label="Work email" type="email" placeholder="jane@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input label="Organization" placeholder="Acme Corp" value={organization} onChange={(event) => setOrganization(event.target.value)} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required />
            {error ? <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={isSubmitting} className="mt-4 h-11 w-full rounded-xl text-base shadow-sm">{isSubmitting ? "Creating..." : "Continue"}</Button>
          </form>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link></p>
      </div>
    </main>
  );
}
