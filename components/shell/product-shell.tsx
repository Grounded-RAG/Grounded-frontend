"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";

/** Keeps AppShell in one client boundary for static builds. Auth lives in root Providers. */
export function ProductShell({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
