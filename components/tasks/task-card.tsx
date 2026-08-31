"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays } from "lucide-react";
import { PriorityBadge } from "@/components/badges";
import { cn, formatDate } from "@/lib/utils";

export type BoardTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  course: { id: string; name: string; color: string } | null;
};

export function TaskCard({ task, onClick }: { task: BoardTask; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const now = new Date();
  const overdue = task.dueDate && task.dueDate < now && task.status !== "DONE";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="card cursor-grab space-y-2 p-3.5 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-ink)" }}>
          {task.title}
        </p>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.description && (
        <p className="line-clamp-2 text-xs" style={{ color: "var(--color-ink-muted)" }}>
          {task.description}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--color-ink-muted)" }}>
        {task.dueDate && (
          <span className={cn("inline-flex items-center gap-1", overdue && "font-medium")} style={overdue ? { color: "var(--color-danger)" } : undefined}>
            <CalendarDays className="h-3 w-3" /> {formatDate(task.dueDate)}
          </span>
        )}
        {task.course && (
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: task.course.color }} />
            {task.course.name}
          </span>
        )}
      </div>
    </div>
  );
}
