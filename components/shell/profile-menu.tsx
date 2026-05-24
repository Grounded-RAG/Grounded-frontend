"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings, User } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { workspaceHref } from "@/lib/utils";

export function ProfileMenu({ workspaceSlug }: { workspaceSlug?: string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsHref = workspaceHref(workspaceSlug, "/settings");
  const initials = currentUser.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        <span className="text-xs font-semibold">{initials}</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-xs font-semibold">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{currentUser.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
                <p className="text-xs capitalize text-muted-foreground/80">{currentUser.role}</p>
              </div>
            </div>
          </div>

          <div className="py-1">
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              Profile
            </Link>
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
              Settings
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
