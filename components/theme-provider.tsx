"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const defaultThemeContext: ThemeContextValue = {
  theme: "dark",
  setTheme: () => undefined,
};

const ThemeContext = createContext<ThemeContextValue>(defaultThemeContext);
const STORAGE_KEY = "grounded_theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setThemeState(stored === "light" ? "light" : "dark");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, ready]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme: setThemeState,
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
