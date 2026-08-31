import Link from "next/link";
import { ListTodo } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PriorityBadge } from "@/components/badges";
import { formatDate, cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  priority: string;
  dueDate: Date | null;
  course: { name: string; color: string } | null;
};

export function UpcomingTasks({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ListTodo}
        title="No tasks yet — add your first one"
        description="Use the + button anywhere in the app to capture a to-do."
        action={
          <Link href="/tasks" className="btn-secondary">
            Open tasks
          </Link>
        }
      />
    );
  }

  const now = new Date();

  return (
    <div className="card divide-y" style={{ borderColor: "var(--color-border)" }}>
      {tasks.map((t) => {
        const overdue = t.dueDate ? t.dueDate < now : false;
        return (
          <Link
            key={t.id}
            href="/tasks"
            className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--color-surface-hover)] sm:px-5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                {t.title}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs" style={{ color: "var(--color-ink-muted)" }}>
                {t.course && <span>{t.course.name}</span>}
                {t.dueDate && (
                  <span className={cn(overdue && "font-medium")} style={overdue ? { color: "var(--color-danger)" } : undefined}>
                    Due {formatDate(t.dueDate)}
                  </span>
                )}
              </div>
            </div>
            <PriorityBadge priority={t.priority} />
          </Link>
        );
      })}
    </div>
  );
}
