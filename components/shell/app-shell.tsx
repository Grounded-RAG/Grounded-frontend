"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BookOpen,
  Bot,
  Code2,
  Database,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiBaseUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn, workspaceHref } from "@/lib/utils";

const PUBLIC_PATHS = new Set(["/", "/login", "/sign-up", "/onboarding"]);

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return pathname.startsWith("/auth/");
}

const NAV_GROUPS = [
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
    label: "Admin",
    items: [
      { label: "Usage", icon: Activity, path: "/usage" },
      { label: "Feedback", icon: MessageSquareText, path: "/feedback" },
      { label: "Governance", icon: Shield, path: "/governance" },
      { label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
  {
    label: "Developer",
    items: [
      { label: "API Keys", icon: KeyRound, path: "/api-keys" },
      { label: "API Reference", icon: Code2, path: "/api-reference" },
      { label: "Documentation", icon: BookOpen, path: "/docs" },
    ],
  },
];

function SidebarNav({
  collapsed,
  pathname,
  effectiveSlug,
  onNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  effectiveSlug?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto py-3 scrollbar-none">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-4">
          {!collapsed && (
            <p className="mb-1 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5 px-2">
            {group.items.map((item) => {
              const Icon = item.icon;
              const href = workspaceHref(effectiveSlug, item.path);
              const active = pathname.startsWith(href);

              return (
                <Link
                  key={item.label}
                  href={href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] font-medium transition-all",
                    collapsed && "justify-center",
                    active
                      ? "bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.92))] text-white shadow-lg shadow-slate-900/10"
                      : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                  )}
                >
                  <Icon className="h-[15px] w-[15px] shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AppShell({
  children,
  workspaceSlug,
}: {
  children: React.ReactNode;
  workspaceSlug?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    auth,
    isLoading,
    restoreError,
    signOut,
    workspaces,
    workspaceName,
    workspaceSlug: selectedSlug,
    setWorkspace,
    clearRestoreError,
  } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const routeWorkspaceSlug = pathname.match(/\/app\/workspace\/([^/]+)/)?.[1];
  const workspace = useMemo(
    () =>
      workspaces.find((w) => w.slug === (workspaceSlug ?? routeWorkspaceSlug)) ??
      workspaces.find((w) => w.slug === selectedSlug) ??
      workspaces[0],
    [routeWorkspaceSlug, selectedSlug, workspaceSlug, workspaces],
  );
  const effectiveSlug =
    workspaceSlug ?? routeWorkspaceSlug ?? workspace?.slug ?? selectedSlug ?? undefined;
  const currentWorkspaceName = workspace?.name ?? workspaceName ?? "Workspace";
  const isChat = /\/agents\/[^/]+$/.test(pathname) && !pathname.endsWith("/agents/new");
  const onPublicRoute = isPublicRoute(pathname);

  useEffect(() => {
    if (onPublicRoute) return;
    if (!isLoading && !auth) {
      clearRestoreError();
      router.replace("/login");
    }
  }, [auth, clearRestoreError, isLoading, onPublicRoute, router]);

  useEffect(() => {
    if (workspace?.workspace_id) {
      setWorkspace(workspace.workspace_id, workspace.name, workspace.slug);
    }
  }, [setWorkspace, workspace?.name, workspace?.slug, workspace?.workspace_id]);

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  if (onPublicRoute) {
    return <>{children}</>;
  }

  if (isLoading || !auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          {restoreError ? (
            <>
              <p className="text-sm font-medium text-foreground">Could not reach the API</p>
              <p className="mt-2 text-sm text-muted-foreground">{restoreError}</p>
              <p className="mt-3 text-xs text-muted-foreground/80">
                API base URL: <code className="text-foreground/80">{apiBaseUrl()}</code>
              </p>
              <p className="mt-3 text-xs text-muted-foreground/80">
                Set <code className="text-foreground/80">NEXT_PUBLIC_API_BASE_URL</code> to your server backend (not localhost), then rebuild the frontend container.
              </p>
              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="mt-6 text-sm font-medium text-foreground/80 underline-offset-4 hover:underline"
              >
                Go to sign in
              </button>
            </>
          ) : (
            <p className="text-sm text-zinc-400">Loading…</p>
          )}
        </div>
      </div>
    );
  }

  const sidebarWidth = collapsed ? "w-[72px]" : "w-[248px]";

  return (
    <div className="flex min-h-screen bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-30 hidden flex-col border-r border-border/60 bg-background/92 transition-all duration-300 backdrop-blur-xl md:flex",
          sidebarWidth,
        )}
      >
        <div className="relative flex h-full flex-col">
          <div
            className={cn(
              "flex h-16 shrink-0 items-center border-b border-border/60 bg-background/85 px-3 backdrop-blur-xl",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            <Link
              href="/"
              className={cn(
                "flex min-w-0 items-center rounded-2xl transition-colors hover:bg-foreground/[0.04]",
                collapsed ? "h-11 w-11 justify-center" : "gap-3 px-2 py-2",
              )}
            >
              {collapsed ? (
                <Bot className="h-5 w-5 text-foreground/80" />
              ) : (
                <BrandMark size="sm" />
              )}
            </Link>

            {!collapsed && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground transition-all hover:border-border hover:bg-foreground/[0.04] hover:text-foreground"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground transition-all hover:border-border hover:bg-foreground/[0.04] hover:text-foreground"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}

            {collapsed && (
              <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                <button
                  type="button"
                  onClick={() => setCollapsed(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground shadow-lg shadow-black/5 transition-all hover:-translate-y-0.5 hover:text-foreground"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <SidebarNav collapsed={collapsed} pathname={pathname} effectiveSlug={effectiveSlug} />

          <div className="shrink-0 border-t border-border/60 p-3">
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-2xl border border-border/60 bg-foreground/[0.02] px-2.5 py-2.5",
                collapsed && "justify-center px-0",
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
                {auth.tenant_name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-foreground">
                    {auth.tenant_name ?? "Workspace"}
                  </p>
                  <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {auth.subscription_plan}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-border/60 bg-background shadow-xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
          <BrandMark size="sm" />
          <button
            type="button"
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <SidebarNav
          collapsed={false}
          pathname={pathname}
          effectiveSlug={effectiveSlug}
          onNavigate={() => setMobileOpen(false)}
        />

        <div className="border-t border-border/60 p-3">
          <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-foreground/[0.02] px-2.5 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
              {auth.tenant_name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-foreground">
                {auth.tenant_name ?? "Workspace"}
              </p>
              <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {auth.subscription_plan}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          collapsed ? "md:pl-[72px]" : "md:pl-[248px]",
          isChat && "h-screen overflow-hidden",
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-border/60 bg-background/90 px-5 backdrop-blur-xl">
          <button
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="rounded-full border border-border/60 bg-foreground/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Workspace
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className="truncate text-[15px] font-semibold text-foreground">
              {currentWorkspaceName}
            </span>
          </div>
          <ThemeToggle />
        </header>

        <main
          className={cn(
            "flex flex-1 flex-col",
            isChat ? "min-h-0 px-4 pb-4" : "px-6 py-8 md:px-8 md:py-10",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
