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
      {/* Elegant Ambient Background */}
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

        <div className="glass rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-black/5 dark:shadow-black/20">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {method === "email" ? "Welcome back" : "Developer Access"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {method === "email" ? "Enter your details to sign in" : "Authenticate directly using your API key"}
            </p>
          </div>

          <div className="grid gap-5">
            {method === "email" ? (
              <>
                <Input label="Email address" type="email" placeholder="name@company.com" />
                <Input label="Password" type="password" placeholder="••••••••" />
                <Link href="/app/overview" className="mt-2 w-full">
                  <Button className="w-full h-11 text-base rounded-xl shadow-sm">
                    Sign in
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Input label="API Key" type="password" placeholder="gr_live_••••••••" />
                <Link href="/app/overview" className="mt-2 w-full">
                  <Button className="w-full h-11 text-base rounded-xl shadow-sm">
                    Authenticate
                  </Button>
                </Link>
              </>
            )}
          </div>

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
