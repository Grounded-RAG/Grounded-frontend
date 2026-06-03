"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BookOpen,
  Bot,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiBaseUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn, workspaceHref } from "@/lib/utils";

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
  const isChat =
    /\/agents\/[^/]+$/.test(pathname) && !pathname.endsWith("/agents/new");

  useEffect(() => {
    if (!isLoading && !auth) {
      clearRestoreError();
      router.replace("/login");
    }
  }, [auth, clearRestoreError, isLoading, router]);

  useEffect(() => {
    if (workspace?.workspace_id)
      setWorkspace(workspace.workspace_id, workspace.name, workspace.slug);
  }, [workspace?.workspace_id]);

  if (isLoading || !auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-zinc-950">
        <div className="max-w-md text-center">
          {restoreError ? (
            <>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Could not reach the API</p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{restoreError}</p>
              <p className="mt-3 text-xs text-zinc-400">
                API base URL: <code className="text-zinc-600 dark:text-zinc-300">{apiBaseUrl}</code>
              </p>
              <p className="mt-3 text-xs text-zinc-400">
                Set <code className="text-zinc-600 dark:text-zinc-300">NEXT_PUBLIC_API_BASE_URL</code> to your server backend (not localhost), then rebuild the frontend container.
              </p>
              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="mt-6 text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
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

  const sidebarWidth = collapsed ? "w-[60px]" : "w-[220px]";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-zinc-100 dark:border-zinc-800",
          collapsed ? "justify-center px-0" : "px-5",
        )}
      >
        {collapsed ? (
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg">
            <Bot className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </Link>
        ) : (
          <BrandMark size="sm" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-none">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="mb-1 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
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
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                      collapsed && "justify-center",
                      active
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200",
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

      {/* Bottom: user + collapse */}
      <div className="shrink-0 border-t border-zinc-100 p-3 dark:border-zinc-800">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white dark:bg-zinc-200 dark:text-zinc-900">
              {auth.tenant_name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">
                {auth.tenant_name ?? "Workspace"}
              </p>
              <p className="truncate text-[10px] uppercase tracking-wider text-zinc-400">
                {auth.subscription_plan}
              </p>
            </div>
            <button
              onClick={() => { signOut(); router.push("/login"); }}
              className="text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
            collapsed && "justify-center",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop */}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-30 hidden flex-col border-r border-zinc-100 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 md:flex",
          sidebarWidth,
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar — mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-zinc-100 bg-white shadow-xl transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          className="absolute right-3 top-4 text-zinc-400 hover:text-zinc-700"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          collapsed ? "md:pl-[60px]" : "md:pl-[220px]",
          isChat && "h-screen overflow-hidden",
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-4 border-b border-zinc-100 bg-white px-5 dark:border-zinc-800 dark:bg-zinc-950">
          <button
            className="text-zinc-400 hover:text-zinc-700 md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              Workspace
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="truncate text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
              {currentWorkspaceName}
            </span>
          </div>
          <ThemeToggle />
        </header>

        {/* Content */}
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
