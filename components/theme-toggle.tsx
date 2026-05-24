"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-8 w-8 items-center justify-center rounded-full bg-card transition-all duration-200 hover:scale-105 active:scale-95"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className={`h-4 w-4 transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"} absolute`} />
      <Moon className={`h-4 w-4 transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"} absolute`} />
    </button>
  );
}
