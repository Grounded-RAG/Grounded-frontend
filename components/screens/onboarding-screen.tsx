import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "@/components/ui/progress";

const steps = ["About you", "Organization", "Your use case", "Get started"];

export function OnboardingScreen() {
  return (
    <main className="relative grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute right-6 top-6"><ThemeToggle /></div>

      <Card variant="glass" className="relative z-10 w-full max-w-3xl rounded-3xl p-8">
        <BrandMark />
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="section-title">Setup</p>
            <h1 className="mt-2 text-2xl font-bold text-foreground">A short path to a ready workspace.</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We just need a few details to personalize your experience. Only the workspace name is required.
            </p>
            <StepIndicator steps={steps} current={3} className="mt-8" />
          </div>
          <div className="grid gap-4">
            <Input label="Role" placeholder="Engineering lead" />
            <Input label="Company" placeholder="Acme Research" />
            <Input label="Workspace name" placeholder="Policy Intelligence" helperText="This is the only required field" />
            <Input label="Team size" placeholder="5–20" />
            <Input label="Primary use case" placeholder="Policy Q&A, compliance review..." />
            <Link href="/app/workspace/policy-intelligence/overview">
              <Button className="mt-2 w-full" size="lg">Enter workspace</Button>
            </Link>
          </div>
        </div>
      </Card>
    </main>
  );
}
