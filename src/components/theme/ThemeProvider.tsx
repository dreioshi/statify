"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Theme = "dark" | "light";
const STORAGE_KEY = "statify-theme";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: "dark", toggle: () => {} });

/** Runs before first paint (see layout.tsx) so the page never flashes the wrong theme. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t='dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
  }, []);
  const toggle = useCallback(() => {
    setTheme(old => {
      const next: Theme = old === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { window.localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** Colors for Recharts (SVG attributes cannot read CSS variables reliably). */
export function chartColors(theme: Theme) {
  return theme === "dark"
    ? { grid: "rgba(214,255,160,0.12)", axis: "#9DB3A4", accent: "#C6F24E", second: "#6FE0B4", reject: "#FF8E70", observed: "#FFC857", tooltipBg: "#13241B", tooltipText: "#EAF3E6" }
    : { grid: "rgba(15,36,24,0.12)", axis: "#4F6657", accent: "#2E8B3F", second: "#0F9F7A", reject: "#D9532F", observed: "#C98A00", tooltipBg: "#FFFFFF", tooltipText: "#0F2418" };
}
