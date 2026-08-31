"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuickAddTask } from "@/components/quick-add-task";

type Props = {
  userName: string;
  schoolName: string;
  courses: { id: string; name: string; color: string }[];
  signOutSlot: React.ReactNode;
  children: React.ReactNode;
};

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
            )}
            style={
              active
                ? { background: "var(--color-primary)", color: "var(--color-primary-foreground)" }
                : { color: "var(--color-ink-muted)" }
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ userName, schoolName, courses, signOutSlot, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden w-64 shrink-0 flex-col border-r lg:flex"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <SidebarHeader schoolName={schoolName} />
        <SidebarNav />
        <SidebarFooter userName={userName} signOutSlot={signOutSlot} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside
            className="absolute inset-y-0 left-0 flex w-72 flex-col border-r"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            <div className="flex items-center justify-between px-4 pt-4">
              <SidebarHeader schoolName={schoolName} compact />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter userName={userName} signOutSlot={signOutSlot} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header
          className="flex items-center gap-3 border-b px-4 py-3 lg:hidden"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
            STEAM Hub
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <QuickAddTask courses={courses} />
    </div>
  );
}

function SidebarHeader({ schoolName, compact = false }: { schoolName: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 px-4", compact ? "" : "pt-5 pb-4")}>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "var(--color-primary)" }}
      >
        <Sparkles className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-heading text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
          STEAM Hub
        </p>
        <p className="truncate text-xs" style={{ color: "var(--color-ink-muted)" }}>
          {schoolName}
        </p>
      </div>
    </div>
  );
}

function SidebarFooter({ userName, signOutSlot }: { userName: string; signOutSlot: React.ReactNode }) {
  return (
    <div className="space-y-1 border-t px-3 py-3" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-center gap-2 px-3 py-1.5">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
        >
          {initials(userName)}
        </div>
        <p className="truncate text-sm font-medium" style={{ color: "var(--color-ink)" }}>
          {userName}
        </p>
      </div>
      <ThemeToggle />
      {signOutSlot}
    </div>
  );
}
