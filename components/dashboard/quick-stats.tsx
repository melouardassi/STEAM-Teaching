import { Users, CalendarClock, ClipboardList, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Stat = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "primary" | "danger" | "default";
};

export function QuickStats({
  totalStudents,
  classesToday,
  pendingAssignments,
  overdueTasks,
}: {
  totalStudents: number;
  classesToday: number;
  pendingAssignments: number;
  overdueTasks: number;
}) {
  const stats: Stat[] = [
    { label: "Total students", value: totalStudents, icon: Users, tone: "primary" },
    { label: "Classes today", value: classesToday, icon: CalendarClock, tone: "primary" },
    { label: "Pending assignments", value: pendingAssignments, icon: ClipboardList, tone: "default" },
    { label: "Overdue tasks", value: overdueTasks, icon: AlertTriangle, tone: overdueTasks > 0 ? "danger" : "default" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        const color = s.tone === "danger" ? "var(--color-danger)" : "var(--color-primary)";
        return (
          <div key={s.label} className="card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium sm:text-sm" style={{ color: "var(--color-ink-muted)" }}>
                {s.label}
              </span>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "var(--color-bg)" }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <p className="mt-3 font-heading text-2xl font-semibold sm:text-3xl" style={{ color: "var(--color-ink)" }}>
              {s.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
