"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Plus, KanbanSquare } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { TaskColumn } from "@/components/tasks/task-column";
import { TaskCard, type BoardTask } from "@/components/tasks/task-card";
import { TaskModal, type TaskDraft } from "@/components/tasks/task-modal";
import { TaskFilters, type Filters } from "@/components/tasks/task-filters";
import { reorderTasks } from "@/lib/actions/tasks";
import { TaskStatus } from "@prisma/client";

const COLUMNS: { id: string; label: string }[] = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE", label: "Done" },
];

const emptyDraft = (status = "TODO"): TaskDraft => ({
  title: "",
  description: "",
  status,
  priority: "MEDIUM",
  dueDate: "",
  courseId: "",
});

function toDraft(t: BoardTask): TaskDraft {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "",
    courseId: t.course?.id ?? "",
  };
}

function withinDays(date: Date | null, days: number) {
  if (!date) return false;
  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);
  return date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && date <= end;
}

export function TaskBoard({ tasks: initial, courses }: { tasks: BoardTask[]; courses: { id: string; name: string }[] }) {
  const [tasks, setTasks] = useState(initial);
  const [filters, setFilters] = useState<Filters>({ priority: "All", courseId: "All", dueRange: "all" });
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.priority !== "All" && t.priority !== filters.priority) return false;
      if (filters.courseId === "none" && t.course) return false;
      if (filters.courseId !== "All" && filters.courseId !== "none" && t.course?.id !== filters.courseId) return false;
      if (filters.dueRange === "overdue" && !(t.dueDate && t.dueDate < new Date() && t.status !== "DONE")) return false;
      if (filters.dueRange === "week" && !withinDays(t.dueDate, 7)) return false;
      if (filters.dueRange === "month" && !withinDays(t.dueDate, 30)) return false;
      return true;
    });
  }, [tasks, filters]);

  function columnTasks(status: string) {
    return filtered.filter((t) => t.status === status);
  }

  function findContainer(id: string): string | undefined {
    if (COLUMNS.some((c) => c.id === id)) return id;
    return tasks.find((t) => t.id === id)?.status;
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskRef = tasks.find((t) => t.id === active.id);
    if (!activeTaskRef) return;

    const destStatus = findContainer(String(over.id)) ?? activeTaskRef.status;
    const sourceStatus = activeTaskRef.status;

    const without = tasks.filter((t) => t.id !== active.id);
    const destItems = without.filter((t) => t.status === destStatus);
    let insertIndex = destItems.findIndex((t) => t.id === over.id);
    if (insertIndex === -1) insertIndex = destItems.length;

    const movedTask = { ...activeTaskRef, status: destStatus };
    const newDestItems = [...destItems.slice(0, insertIndex), movedTask, ...destItems.slice(insertIndex)];

    const otherItems = without.filter((t) => t.status !== destStatus && t.status !== sourceStatus);
    const sourceItems = sourceStatus === destStatus ? [] : without.filter((t) => t.status === sourceStatus);

    const nextTasks = [...otherItems, ...sourceItems, ...newDestItems];
    setTasks(nextTasks);

    const updates = [
      ...newDestItems.map((t, i) => ({ id: t.id, status: destStatus as TaskStatus, order: i })),
      ...sourceItems.map((t, i) => ({ id: t.id, status: sourceStatus as TaskStatus, order: i })),
    ];

    reorderTasks(updates).then((result) => {
      if (!result.ok) toast.error(result.error);
    });
  }

  function openCreate(status = "TODO") {
    setDraft(emptyDraft(status));
    setModalOpen(true);
  }

  function openEdit(task: BoardTask) {
    setDraft(toDraft(task));
    setModalOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Your to-dos, from planning to done."
        action={
          <button type="button" onClick={() => openCreate()} className="btn-primary">
            <Plus className="h-4 w-4" /> New task
          </button>
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={KanbanSquare}
          title="No tasks yet — add your first one"
          description="Track grading, prep, and admin work across To Do, In Progress, and Done."
          action={
            <button type="button" onClick={() => openCreate()} className="btn-primary">
              <Plus className="h-4 w-4" /> New task
            </button>
          }
        />
      ) : (
        <>
          <TaskFilters filters={filters} onChange={setFilters} courses={courses} />
          <DndContext
            id="task-board"
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-5 sm:flex-row">
              {COLUMNS.map((col) => (
                <TaskColumn key={col.id} id={col.id} label={col.label} tasks={columnTasks(col.id)} onCardClick={openEdit} />
              ))}
            </div>
            <DragOverlay>{activeTask && <TaskCard task={activeTask} onClick={() => {}} />}</DragOverlay>
          </DndContext>
        </>
      )}

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} initial={draft} courses={courses} />
    </div>
  );
}
