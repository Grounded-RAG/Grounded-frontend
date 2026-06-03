"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";

/** Keeps AppShell and AuthProvider in one client boundary for static builds. */
export function ProductShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
