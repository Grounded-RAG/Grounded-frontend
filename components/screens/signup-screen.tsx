"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignUpScreen() {
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

      <div className="relative z-10 w-full max-w-[420px] animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <BrandMark size="lg" />
        </div>

        <div className="glass rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-black/5 dark:shadow-black/20">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Create Your Account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Set up your organization and account
            </p>
          </div>

          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" placeholder="Jane" />
              <Input label="Last name" placeholder="Doe" />
            </div>
            <Input label="Work email" type="email" placeholder="jane@company.com" />
            <Input label="Organization" placeholder="Acme Corp" />
            <Input label="Password" type="password" placeholder="••••••••" />
            
            <Link href="/onboarding" className="mt-4 w-full">
              <Button className="w-full h-11 text-base rounded-xl shadow-sm">
                Continue
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-center text-[13px] text-muted-foreground leading-relaxed">
            By continuing, you agree to our <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms of Service</a> and <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</a>.
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
