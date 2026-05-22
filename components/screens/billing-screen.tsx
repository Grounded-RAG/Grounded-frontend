import { Check, CreditCard, Download, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { invoices, organization } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";

const plans = [
  { name: "Free", price: "$0", period: "/mo", features: ["1 workspace", "100 queries/mo", "2 datasets", "Auto + Instant modes", "Community support"], current: false },
  { name: "Pro", price: "$49", period: "/mo", features: ["3 workspaces", "500 queries/mo", "10 datasets", "Auto + Instant + Thinking modes", "Standard support", "SSO"], current: false },
  { name: "Business", price: "$199", period: "/mo", features: ["10 workspaces", "2,000 queries/mo", "Unlimited datasets", "All 4 modes", "Priority support", "SSO"], current: true },
  { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited workspaces", "Unlimited queries", "Unlimited datasets", "All modes + SLA", "Dedicated support", "SSO + SAML", "Governance controls", "Custom retention"], current: false },
];

export function BillingScreen({ workspaceSlug }: { workspaceSlug?: string }) {
  return (
    <div className="page-grid animate-fade-in">
      <PageHeader eyebrow="Analytics" title="Billing" description="Manage your plan, payment methods, and invoice history." />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          {/* Plan comparison */}
          <div className="grid sm:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.name} variant="glass" className={cn("rounded-2xl relative", plan.current && "ring-1 ring-foreground/20")}>
                {plan.current && <Badge tone="accent" size="sm" className="absolute top-4 right-4 text-[9px]">Current</Badge>}
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <ul className="mt-5 grid gap-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-4 border-t border-border/15">
                  {plan.current ? (
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs" disabled>Current plan</Button>
                  ) : plan.name === "Enterprise" ? (
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs gap-1.5">Contact sales <ArrowUpRight className="h-3 w-3" /></Button>
                  ) : (
                    <Button size="sm" className="w-full rounded-xl text-xs">Upgrade</Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {/* Invoices */}
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Invoice history" />
            <div className="grid gap-2">
              {invoices.map((inv) => (
                <div key={inv.invoice_id} className="flex items-center justify-between rounded-xl border border-border/15 bg-secondary/8 p-4 hover:bg-secondary/15 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{inv.period}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(inv.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground tabular-nums">${(inv.amount_cents / 100).toFixed(2)}</span>
                    <Badge tone={inv.status === "paid" ? "success" : inv.status === "pending" ? "warn" : "danger"} size="sm">{inv.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        {/* Payment method sidebar */}
        <div className="grid content-start gap-6">
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Payment method" />
            <div className="flex items-center gap-3 rounded-xl border border-border/15 bg-secondary/8 p-4">
              <div className="h-10 w-10 rounded-xl bg-foreground/[0.04] flex items-center justify-center border border-border/20">
                <CreditCard className="h-5 w-5 text-foreground/60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/2027</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full rounded-xl text-xs">Update payment method</Button>
          </Card>
          <Card variant="glass" className="rounded-2xl">
            <CardHeader title="Billing details" />
            <dl className="grid gap-2.5 text-sm">
              <div className="flex justify-between gap-4 border-b border-border/10 pb-2"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium text-foreground/80">{organization.subscription_plan}</dd></div>
              <div className="flex justify-between gap-4 border-b border-border/10 pb-2"><dt className="text-muted-foreground">Billing cycle</dt><dd className="font-medium text-foreground/80">Monthly</dd></div>
              <div className="flex justify-between gap-4 border-b border-border/10 pb-2"><dt className="text-muted-foreground">Seats</dt><dd className="font-medium text-foreground/80">4 of 10</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Next invoice</dt><dd className="font-medium text-foreground/80">Jun 1, 2026</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
