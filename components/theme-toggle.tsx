"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppTheme } from "@/components/theme-provider";

function ThemeToggleControl() {
  const { theme, setTheme } = useAppTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-9 w-9 items-center justify-center rounded-full glass transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
      <Moon className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
    </button>
  );
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  return <ThemeToggleControl />;
}
