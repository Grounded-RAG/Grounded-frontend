"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bot,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Plus,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { ProfileMenu } from "@/components/shell/profile-menu";
import { resolveNavbarTitle } from "@/components/shell/resolve-navbar-title";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { poppins } from "@/lib/fonts";
import { organization } from "@/lib/mock-data";
import { cn, workspaceHref } from "@/lib/utils";

const navGroups = [
  {
    label: null,
    items: [
      { label: "Overview", icon: LayoutDashboard, path: "/overview" },
      { label: "Agents", icon: Bot, path: "/agents", showPlus: true },
    ],
  },
  {
    label: "Knowledge",
    items: [{ label: "Datasets", icon: Database, path: "/datasets" }],
  },
  {
    label: "Insights",
    items: [
      { label: "Runs", icon: Activity, path: "/runs" },
      { label: "Feedback", icon: MessageSquareText, path: "/feedback" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Usage", icon: BarChart3, path: "/usage" },
      { label: "Billing", icon: CreditCard, path: "/billing" },
      { label: "Team", icon: Users, path: "/team" },
      { label: "Governance", icon: ShieldCheck, path: "/governance" },
      { label: "Settings", icon: Settings, path: "/settings" },
      { label: "API Keys", icon: KeyRound, path: "/api-keys" },
    ],
  },
];

const footerLinks = [
  { label: "Documentation", icon: BookOpen, path: "https://docs.grounded.ai" },
  { label: "Contact Support", icon: MessageSquareText, path: "mailto:support@grounded.ai" },
];

export function AppShell({
  children,
  workspaceSlug,
}: {
  children: React.ReactNode;
  workspaceSlug?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isChat = /\/agents\/[^/]+$/.test(pathname) && !pathname.endsWith("/agents/new");
  const navTitle = useMemo(() => resolveNavbarTitle(pathname, workspaceSlug), [pathname, workspaceSlug]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const sidebarContent = (collapsed: boolean) => (
    <>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-between gap-0.5 px-1.5" : "justify-between gap-2 px-4",
        )}
      >
          <BrandMark size="sm" compact={collapsed} />
          <button
            type="button"
            onClick={() => setSidebarCollapsed((value) => !value)}
            className={cn(
              "hidden shrink-0 rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground md:inline-flex",
              collapsed ? "p-1" : "rounded-lg p-1.5",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
      </div>

      <nav
        className={cn(
          "flex-1 overflow-y-auto scrollbar-none",
          collapsed ? "space-y-1.5 px-2 py-2 sidebar-collapsed" : "space-y-5 px-3 py-3",
        )}
      >
        {navGroups.map((group) => (
          <div key={group.label ?? "top"}>
            {group.label && !collapsed ? (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const href = workspaceHref(workspaceSlug, item.path);
                const active = pathname.startsWith(href);
                const showPlus = !collapsed && "showPlus" in item && item.showPlus;

                if (collapsed) {
                  return (
                    <Link
                      key={item.label}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      title={item.label}
                      className={cn(
                        "group/nav flex h-9 items-center justify-center rounded-lg transition-all duration-200",
                        active ? "sidebar-nav-active" : "sidebar-nav-idle text-muted-foreground",
                      )}
                    >
                      <Icon className="h-[17px] w-[17px] shrink-0" />
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className={cn(
                      "group flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] transition-all duration-200",
                      active ? "sidebar-nav-active" : "sidebar-nav-idle text-muted-foreground",
                    )}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <Icon className="h-[17px] w-[17px] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                    {showPlus ? (
                      <Link
                        href={workspaceHref(workspaceSlug, "/agents/new")}
                        onClick={() => setMobileOpen(false)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg opacity-0 transition-all hover:bg-muted group-hover:opacity-100"
                        aria-label="Create agent"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div
          className={cn(
            "space-y-0.5 border-t border-sidebar-border/60",
            collapsed ? "pt-2" : "pt-4",
          )}
        >
          {footerLinks.map((item) => {
            const InIcon = item.icon;
            return (
              <Link
                href={item.path}
                key={item.label}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                title={item.label}
                className={cn(
                  "sidebar-nav-idle flex h-9 items-center rounded-lg text-[13px] text-muted-foreground transition-colors",
                  collapsed ? "justify-center px-0" : "gap-3 px-3",
                )}
              >
                <InIcon className="h-[17px] w-[17px] shrink-0" />
                {!collapsed ? (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                  </>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div
        className={cn(
          "flex-shrink-0 border-t border-sidebar-border",
          collapsed ? "p-2" : "p-3",
        )}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              title="Log out"
              className="group relative rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/15 dark:text-red-400"
            >
              <LogOut className="h-[17px] w-[17px]" />
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                Log out
              </span>
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-500/15 dark:text-red-400"
          >
            <LogOut className="h-[17px] w-[17px] shrink-0" />
            <span>Log out</span>
          </Link>
        )}
      </div>
    </>
  );

  return (
    <div
      className={cn(
        poppins.className,
        "min-h-screen min-w-0 overflow-x-hidden bg-background",
        isChat && "h-dvh overflow-hidden",
      )}
    >
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-white text-sidebar-foreground transition-all duration-300 dark:bg-[hsl(var(--sidebar-background))]",
          "w-64",
          sidebarCollapsed && "md:w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {sidebarContent(sidebarCollapsed && !mobileOpen)}
      </aside>

      <header
        className={cn(
          "fixed top-0 right-0 z-30 flex h-14 items-center gap-2 border-b border-sidebar-border bg-white px-4 transition-all duration-300 dark:bg-background md:gap-2.5 md:px-5",
          "left-0",
          sidebarCollapsed ? "md:left-16" : "md:left-64",
        )}
      >
        <button
          type="button"
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-foreground sm:text-[15px] md:text-base">
          {navTitle}
        </h1>

        <Badge tone="accent" size="sm" className="hidden shrink-0 text-[10px] uppercase tracking-wider sm:flex">
          {organization.subscription_plan}
        </Badge>
        <ThemeToggle />
        <ProfileMenu workspaceSlug={workspaceSlug} />
      </header>

      <main
        className={cn(
          "min-w-0 p-5 pt-[calc(var(--shell-header-height)+1.25rem)] transition-all duration-300 md:p-6 md:pt-[calc(var(--shell-header-height)+1.5rem)]",
          sidebarCollapsed ? "md:ml-16" : "md:ml-64",
          isChat && "flex h-dvh flex-col overflow-hidden",
        )}
      >
        {children}
      </main>
    </div>
  );
}
