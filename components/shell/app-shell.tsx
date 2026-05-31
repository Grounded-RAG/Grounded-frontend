"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, BarChart3, Bot, BookOpen, ChevronLeft, CreditCard, Database, KeyRound, LayoutDashboard, LogOut, Menu, MessageSquareText, Settings, ShieldCheck, Users, X } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
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
    label: "System",
    items: [
      { label: "Usage", icon: Activity, path: "/usage" },
      { label: "Settings", icon: Settings, path: "/settings" },
      { label: "API Keys", icon: KeyRound, path: "/api-keys" },
    ],
  },
];

export function AppShell({ children, workspaceSlug }: { children: React.ReactNode; workspaceSlug?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, isLoading, signOut, workspaces, workspaceName, workspaceSlug: selectedSlug, setWorkspace } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const routeWorkspaceSlug = pathname.match(/\/app\/workspace\/([^/]+)/)?.[1];
  const workspace = useMemo(() => workspaces.find((w) => w.slug === (workspaceSlug ?? routeWorkspaceSlug)) ?? workspaces.find((w) => w.slug === selectedSlug) ?? workspaces[0], [routeWorkspaceSlug, selectedSlug, workspaceSlug, workspaces]);
  const effectiveSlug = workspaceSlug ?? routeWorkspaceSlug ?? workspace?.slug ?? selectedSlug ?? undefined;
  const currentWorkspaceName = workspace?.name ?? workspaceName ?? "Workspace";
  const isChat = /\/agents\/[^/]+$/.test(pathname) && !pathname.endsWith("/agents/new");
  const expanded = isChat ? false : sidebarOpen;

  useEffect(() => {
    if (!isLoading && !auth) router.replace("/login");
  }, [auth, isLoading, router]);

  useEffect(() => {
    if (workspace && workspace.workspace_id) setWorkspace(workspace.workspace_id, workspace.name, workspace.slug);
  }, [workspace?.workspace_id]);

  if (isLoading || !auth) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading workspace...</div>;
  }

  const sidebarContent = (
    <>
      <div className={cn("flex items-center pb-4 pt-6 transition-all duration-300", expanded ? "px-6" : "justify-center px-0")}>
        {expanded ? <BrandMark size="sm" /> : (
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/30 bg-card shadow-sm" aria-label="Grounded home">
            <Image src="/Grounded_light_logo.jpg" alt="Grounded" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" priority />
          </Link>
        )}
      </div>
      <nav className="scrollbar-none flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {expanded && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isExternal = "external" in item && item.external;
                const href = isExternal ? item.path : workspaceHref(effectiveSlug, item.path);
                const active = !isExternal && pathname.startsWith(href);
                return (
                  <Link key={item.label} href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined} onClick={() => setMobileOpen(false)} className={cn("group relative flex items-center gap-3 rounded-xl transition-all duration-200", expanded ? "h-10 px-3" : "mx-auto h-10 w-10 justify-center", active ? "bg-foreground/[0.04] font-semibold text-foreground shadow-sm" : "text-muted-foreground/80 hover:bg-foreground/[0.03] hover:text-foreground")}>
                    {active && expanded && <span className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-foreground" />}
                    <Icon className={cn("shrink-0", expanded ? "h-[18px] w-[18px]" : "h-5 w-5")} />
                    {expanded && <span className="flex-1 truncate text-[13px]">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto p-3">
        <button className={cn("flex h-10 items-center justify-center rounded-xl text-muted-foreground/60 transition-colors hover:bg-foreground/[0.03] hover:text-foreground", expanded ? "w-full gap-2" : "mx-auto w-10")} onClick={() => setSidebarOpen((value) => !value)} disabled={isChat}>
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", !expanded && "rotate-180")} />
          {expanded && <span className="text-[13px] font-medium">Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className={cn("relative flex flex-col overflow-x-hidden bg-background transition-colors duration-500", isChat ? "h-screen overflow-hidden" : "min-h-screen")}>
      {mobileOpen && <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("glass fixed bottom-4 left-4 top-4 z-40 hidden flex-col overflow-hidden rounded-[2rem] border border-border/30 shadow-2xl shadow-black/5 transition-all duration-500 md:flex", expanded ? "w-60" : "w-[4.5rem]")}>{sidebarContent}</aside>
      <aside className={cn("glass fixed inset-y-4 left-4 z-50 flex w-60 flex-col overflow-hidden rounded-[2rem] border border-border/30 shadow-2xl shadow-black/10 transition-transform duration-500 md:hidden", mobileOpen ? "translate-x-0" : "-translate-x-[120%]")}> 
        <button className="absolute right-4 top-5 text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}><X className="h-4 w-4" /></button>
        {sidebarContent}
      </aside>
      <div className={cn("relative z-10 flex flex-1 flex-col transition-all duration-500", expanded ? "md:pl-[17rem]" : "md:pl-[6.5rem]", isChat ? "h-screen" : "min-h-screen")}>
        <div className="sticky top-0 z-30 shrink-0 px-4 pb-2 pt-4">
          <header className="glass mx-auto flex h-14 max-w-7xl items-center gap-4 rounded-full border border-border/30 px-5 shadow-sm">
            <Button className="-ml-2 rounded-full hover:bg-foreground/5 md:hidden" variant="ghost" size="icon" onClick={() => setMobileOpen(true)}><Menu className="h-[18px] w-[18px] text-foreground/80" /></Button>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="hidden h-6 items-center rounded-md border border-border/20 bg-foreground/[0.04] px-2.5 sm:flex"><span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">Workspace</span></div>
              <p className="truncate text-[14px] font-semibold tracking-tight text-foreground">{currentWorkspaceName}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Badge tone="accent" size="sm" className="hidden text-[10px] uppercase tracking-wider sm:flex">{auth.subscription_plan}</Badge>
              <div className="hidden h-4 w-px bg-border/40 sm:block" />
              <ThemeToggle />
              <button onClick={() => { signOut(); router.push("/login"); }} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/80 transition-all duration-200 hover:bg-foreground/[0.05] hover:text-foreground"><LogOut className="h-4 w-4" /></button>
            </div>
          </header>
        </div>
        <main className={cn("mx-auto flex min-h-0 w-full flex-1 flex-col", isChat ? "px-4 pb-4" : "max-w-7xl px-4 py-8 md:px-8 md:py-10")}>{children}</main>
      </div>
    </div>
  );
}
