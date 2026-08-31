"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard, type BoardTask } from "@/components/tasks/task-card";
import { cn } from "@/lib/utils";

export function TaskColumn({
  id,
  label,
  tasks,
  onCardClick,
}: {
  id: string;
  label: string;
  tasks: BoardTask[];
  onCardClick: (task: BoardTask) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="font-heading text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
          {label}
        </h2>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: "var(--color-surface-hover)", color: "var(--color-ink-muted)" }}
        >
          {tasks.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[240px] flex-1 flex-col gap-2.5 rounded-xl p-2 transition-colors",
          isOver && "bg-[var(--color-surface-hover)]"
        )}
        style={{ background: isOver ? undefined : "transparent" }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} onClick={() => onCardClick(t)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div
            className="flex flex-1 items-center justify-center rounded-lg border border-dashed py-8 text-xs"
            style={{ borderColor: "var(--color-border)", color: "var(--color-ink-muted)" }}
          >
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
