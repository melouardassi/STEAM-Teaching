import { PRIORITY_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: string }) {
  const style = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.MEDIUM;
  return <span className={cn("badge", style.className)}>{style.label}</span>;
}

const LESSON_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PLANNED: { label: "Planned", className: "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]" },
  IN_PROGRESS: { label: "In progress", className: "bg-blue-100 text-[var(--color-primary)] dark:bg-blue-500/15" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-[var(--color-success)] dark:bg-green-500/15" },
};

export function LessonStatusBadge({ status }: { status: string }) {
  const style = LESSON_STATUS_STYLES[status] ?? LESSON_STATUS_STYLES.PLANNED;
  return <span className={cn("badge", style.className)}>{style.label}</span>;
}

const EVENT_TYPE_STYLES: Record<string, { label: string; className: string }> = {
  HOLIDAY: { label: "Holiday", className: "bg-green-100 text-[var(--color-success)] dark:bg-green-500/15" },
  EXAM: { label: "Exam", className: "bg-red-100 text-[var(--color-danger)] dark:bg-red-500/15" },
  EXHIBITION: { label: "Exhibition", className: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300" },
  BREAK: { label: "Break", className: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" },
  OTHER: { label: "Event", className: "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]" },
};

export function EventTypeBadge({ type }: { type: string }) {
  const style = EVENT_TYPE_STYLES[type] ?? EVENT_TYPE_STYLES.OTHER;
  return <span className={cn("badge", style.className)}>{style.label}</span>;
}

export function CourseDot({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />;
}
