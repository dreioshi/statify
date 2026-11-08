"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      <span className={`theme-thumb ${theme}`}>{theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}</span>
      <span className="theme-label">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
