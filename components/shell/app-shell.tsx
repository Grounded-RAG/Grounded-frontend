"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bot,
  BookOpen,
  ChevronLeft,
  CreditCard,
  Database,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { organization, workspaces } from "@/lib/mock-data";
import { cn, workspaceHref } from "@/lib/utils";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", icon: LayoutDashboard, path: "/overview" },
      { label: "Datasets", icon: Database, path: "/datasets" },
      { label: "Agents", icon: Bot, path: "/agents" },
      { label: "Runs", icon: Activity, path: "/runs" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Usage", icon: BarChart3, path: "/usage" },
      { label: "Feedback", icon: MessageSquareText, path: "/feedback" },
      { label: "Billing", icon: CreditCard, path: "/billing" },
    ],
  },
  {
    label: "Organization",
    items: [
      { label: "Team", icon: Users, path: "/team" },
      { label: "Governance", icon: ShieldCheck, path: "/governance" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", icon: Settings, path: "/settings" },
      { label: "API Keys", icon: KeyRound, path: "/api-keys" },
      { label: "Docs", icon: BookOpen, path: "https://docs.grounded.ai", external: true },
    ],
  },
];

export function AppShell({
  children,
  workspaceSlug,
}: {
  children: React.ReactNode;
  workspaceSlug?: string;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const workspace = useMemo(
    () => workspaces.find((w) => w.slug === workspaceSlug) ?? workspaces[0],
    [workspaceSlug],
  );
  const isChat = /\/agents\/[^/]+$/.test(pathname) && !pathname.endsWith('/agents/new');
  const expanded = isChat ? false : sidebarOpen;

  const sidebarContent = (
    <>
      <div className={cn("flex items-center transition-all duration-300 pt-6 pb-4", expanded ? "px-6" : "px-0 justify-center")}>
        {expanded ? (
          <BrandMark size="sm" />
        ) : (
          <div className="h-8 w-8 rounded-xl bg-foreground text-background flex items-center justify-center font-bold text-sm">
            G
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.label}>
            {expanded && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isExternal = "external" in item && item.external;
                const href = isExternal ? (item as any).path : workspaceHref(workspaceSlug, item.path);
                const active = !isExternal && pathname.startsWith(href);
                return (
                  <Link
                    href={href}
                    key={item.label}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl transition-all duration-200",
                      expanded ? "h-10 px-3" : "h-10 w-10 justify-center mx-auto",
                      active
                        ? "bg-foreground/[0.04] text-foreground font-semibold shadow-sm"
                        : "text-muted-foreground/80 hover:bg-foreground/[0.03] hover:text-foreground",
                    )}
                  >
                    {active && expanded && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-foreground shadow-[0_0_8px_rgba(0,0,0,0.5)] dark:shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    )}
                    <Icon className={cn("shrink-0 transition-transform duration-200", expanded ? "h-[18px] w-[18px]" : "h-5 w-5", active && !expanded && "text-foreground")} />
                    {expanded && (
                      <span className="flex-1 truncate text-[13px]">{item.label}</span>
                    )}
                    {!expanded && active && (
                       <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-r-full bg-foreground shadow-[0_0_8px_rgba(0,0,0,0.5)] dark:shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 mt-auto">
        <button
          className={cn("flex h-10 items-center justify-center rounded-xl text-muted-foreground/60 transition-colors hover:bg-foreground/[0.03] hover:text-foreground", expanded ? "w-full gap-2" : "w-10 mx-auto")}
          onClick={() => setSidebarOpen((v) => !v)}
          disabled={isChat}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", !expanded && "rotate-180")} />
          {expanded && <span className="text-[13px] font-medium">Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className={cn("bg-background transition-colors duration-500 flex flex-col relative overflow-x-hidden", isChat ? "h-screen overflow-hidden" : "min-h-screen")}>
      {/* ─── Ambient Glow ─── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] h-[800px] w-[800px] rounded-full bg-foreground/[0.02] blur-[120px]" />
        <div className="absolute top-[40%] -right-[5%] h-[600px] w-[600px] rounded-full bg-foreground/[0.03] blur-[120px]" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md md:hidden transition-all duration-300" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — desktop (Floating) */}
      <aside
        className={cn(
          "fixed top-4 bottom-4 left-4 z-40 hidden flex-col rounded-[2rem] border border-border/30 glass shadow-2xl shadow-black/5 dark:shadow-black/20 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] md:flex overflow-hidden",
          expanded ? "w-60" : "w-[4.5rem]",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar — mobile */}
      <aside
        className={cn(
          "fixed inset-y-4 left-4 z-50 flex w-60 flex-col rounded-[2rem] border border-border/30 glass shadow-2xl shadow-black/10 dark:shadow-black/40 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] md:hidden overflow-hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-[120%]",
        )}
      >
        <button className="absolute right-4 top-5 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileOpen(false)}>
          <X className="h-4 w-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className={cn("relative z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex-1 flex flex-col", expanded ? "md:pl-[17rem]" : "md:pl-[6.5rem]", isChat ? "h-screen" : "min-h-screen")}>
        {/* ─── Top Header ─── */}
        <div className="sticky top-0 z-30 px-4 pt-4 pb-2 shrink-0">
          <header className="mx-auto flex h-14 max-w-7xl items-center gap-4 rounded-full glass border border-border/30 px-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <Button className="md:hidden -ml-2 rounded-full hover:bg-foreground/5" variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
              <Menu className="h-[18px] w-[18px] text-foreground/80" />
            </Button>

            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-6 items-center rounded-md bg-foreground/[0.04] px-2.5 border border-border/20 hidden sm:flex">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">Workspace</span>
              </div>
              <p className="truncate text-[14px] font-semibold tracking-tight text-foreground">{workspace.name}</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Badge tone="accent" size="sm" className="hidden sm:flex text-[10px] uppercase tracking-wider">{organization.subscription_plan}</Badge>
              <div className="h-4 w-px bg-border/40 hidden sm:block" />
              <ThemeToggle />
              <Link href="/login">
                <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/80 transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </header>
        </div>

        <main className={cn("flex-1 flex flex-col min-h-0 mx-auto w-full", isChat ? "pb-4 px-4" : "px-4 py-8 md:px-8 md:py-10 max-w-7xl")}>
          {children}
        </main>
      </div>
    </div>
  );
}
