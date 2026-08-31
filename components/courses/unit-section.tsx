"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, GripVertical } from "lucide-react";
import { LessonStatusBadge } from "@/components/badges";
import { UnitModal, type UnitDraft } from "@/components/courses/unit-modal";
import { LessonModal, type LessonDraft } from "@/components/courses/lesson-modal";
import { setLessonStatus, deleteLesson } from "@/lib/actions/courses";
import { LessonStatus } from "@prisma/client";

type Lesson = { id: string; title: string; status: string; content: string; order: number };
type Unit = { id: string; name: string; description: string; lessons: Lesson[] };

const NEXT_STATUS: Record<string, LessonStatus> = {
  PLANNED: LessonStatus.IN_PROGRESS,
  IN_PROGRESS: LessonStatus.COMPLETED,
  COMPLETED: LessonStatus.PLANNED,
};

export function UnitSection({ unit, courseId }: { unit: Unit; courseId: string }) {
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft | null>(null);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const unitDraft: UnitDraft = { id: unit.id, courseId, name: unit.name, description: unit.description };

  function cycleStatus(lesson: Lesson) {
    const next = NEXT_STATUS[lesson.status] ?? LessonStatus.PLANNED;
    startTransition(async () => {
      const result = await setLessonStatus(lesson.id, courseId, next);
      if (!result.ok) toast.error(result.error);
    });
  }

  function removeLesson(lesson: Lesson) {
    setDeletingId(lesson.id);
    startTransition(async () => {
      const result = await deleteLesson(lesson.id, courseId);
      if (result.ok) toast.success("Lesson removed");
      else toast.error(result.error);
      setDeletingId(null);
    });
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
            {unit.name}
          </h3>
          {unit.description && (
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-ink-muted)" }}>
              {unit.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setUnitModalOpen(true)}
          className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[var(--color-surface-hover)]"
          aria-label={`Edit ${unit.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      <ul className="space-y-1.5">
        {unit.lessons.map((lesson) => (
          <li
            key={lesson.id}
            className="group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            <GripVertical className="h-3.5 w-3.5 shrink-0 opacity-30" />
            <button
              type="button"
              className="min-w-0 flex-1 truncate text-left text-sm"
              style={{ color: "var(--color-ink)" }}
              onClick={() =>
                openLessonEdit(setLessonDraft, setLessonModalOpen, { id: lesson.id, unitId: unit.id, courseId, title: lesson.title, status: lesson.status, content: lesson.content })
              }
            >
              {lesson.title}
            </button>
            <button type="button" onClick={() => cycleStatus(lesson)} title="Click to cycle status">
              <LessonStatusBadge status={lesson.status} />
            </button>
            <button
              type="button"
              onClick={() => removeLesson(lesson)}
              disabled={deletingId === lesson.id}
              className="shrink-0 rounded-md p-1 opacity-0 transition-opacity hover:bg-black/5 group-hover:opacity-100"
              style={{ color: "var(--color-danger)" }}
              aria-label={`Delete ${lesson.title}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() =>
          openLessonEdit(setLessonDraft, setLessonModalOpen, { unitId: unit.id, courseId, title: "", status: "PLANNED", content: "" })
        }
        className="mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--color-surface-hover)]"
        style={{ color: "var(--color-primary)" }}
      >
        <Plus className="h-3.5 w-3.5" /> Add lesson
      </button>

      <UnitModal open={unitModalOpen} onClose={() => setUnitModalOpen(false)} initial={unitDraft} />
      <LessonModal open={lessonModalOpen} onClose={() => setLessonModalOpen(false)} initial={lessonDraft} />
    </div>
  );
}

function openLessonEdit(
  setDraft: (d: LessonDraft) => void,
  setOpen: (b: boolean) => void,
  draft: LessonDraft
) {
  setDraft(draft);
  setOpen(true);
}
