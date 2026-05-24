"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginScreen() {
  const [method, setMethod] = useState<"email" | "api">("email");

  return (
    <main className="relative grid min-h-screen place-items-center px-4 py-10 bg-background transition-colors duration-500 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-foreground/[0.03] blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-foreground/[0.04] blur-[120px]" />
      </div>

      <div className="absolute right-6 top-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-[400px] animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <BrandMark size="lg" />
        </div>

        <div className="bg-card rounded-[2rem] p-8 md:p-10 ">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {method === "email" ? "Welcome back" : "Developer Access"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {method === "email" ? "Enter your details to sign in" : "Authenticate directly using your API key"}
            </p>
          </div>

          {method === "email" ? (
            <div className="grid gap-5">
              <Link href="/app/overview" className="w-full">
                <Button variant="outline" className="w-full h-11 rounded-xl border-border/40 bg-foreground/[0.02] hover:bg-foreground/[0.05] gap-3 text-sm font-medium">
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </Button>
              </Link>

              <Link href="/app/overview" className="w-full">
                <Button variant="outline" className="w-full h-11 rounded-xl border-border/40 bg-foreground/[0.02] hover:bg-foreground/[0.05] gap-3 text-sm font-medium">
                  <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Continue with SSO
                </Button>
              </Link>

              <div className="relative flex items-center gap-4 my-1">
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">or continue with email</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              <Input label="Email address" type="email" placeholder="name@company.com" />
              <Input label="Password" type="password" placeholder="••••••••" />
              <Link href="/app/overview" className="mt-2 w-full">
                <Button className="w-full h-11 text-base rounded-xl shadow-none">
                  Sign in
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              <Input label="API Key" type="password" placeholder="gr_live_••••••••" />
              <Link href="/app/overview" className="mt-2 w-full">
                <Button className="w-full h-11 text-base rounded-xl shadow-none">
                  Authenticate
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            {method === "email" ? (
              <button
                onClick={() => setMethod("api")}
                className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Use API Key instead
              </button>
            ) : (
              <button
                onClick={() => setMethod("email")}
                className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                Use Email instead
              </button>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/sign-up" className="font-medium text-foreground hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
