"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // One-time read of client-only state (the theme class set by the inline
  // anti-flash script) to avoid an SSR/CSR hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("steamhub-theme", next ? "dark" : "light");
    } catch {
      // localStorage may be unavailable (private mode); theme just won't persist.
    }
  }

  if (!mounted) {
    return <div className="h-9 w-full" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        collapsed ? "justify-center" : "w-full"
      )}
      style={{ color: "var(--color-ink-muted)" }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
    >
      {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
      {!collapsed && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
