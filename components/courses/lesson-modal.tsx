"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { createLesson, updateLesson, deleteLesson } from "@/lib/actions/courses";

export type LessonDraft = {
  id?: string;
  unitId: string;
  courseId: string;
  title: string;
  status: string;
  content: string;
};

const STATUSES = ["PLANNED", "IN_PROGRESS", "COMPLETED"] as const;

export function LessonModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial: LessonDraft | null }) {
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const isEdit = !!initial?.id;

  function handleSubmit(formData: FormData) {
    if (!initial) return;
    startTransition(async () => {
      const result = isEdit
        ? await updateLesson(initial.id!, initial.courseId, formData)
        : await createLesson(initial.unitId, initial.courseId, formData);
      if (result.ok) {
        toast.success(isEdit ? "Lesson updated" : "Lesson added");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!initial?.id) return;
    startDelete(async () => {
      const result = await deleteLesson(initial.id!, initial.courseId);
      if (result.ok) {
        toast.success("Lesson removed");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!initial) return null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit lesson" : "Add lesson"}>
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <input name="title" defaultValue={initial.title} required autoFocus className="input" placeholder="e.g. Intro to Sensors & Actuators" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Status</label>
          <select name="status" defaultValue={initial.status} className="input">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes / content</label>
          <textarea name="content" defaultValue={initial.content} rows={4} className="input resize-none" placeholder="Lesson plan notes, links, materials…" />
        </div>
        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button type="button" onClick={handleDelete} disabled={deleting} className="btn-danger">
              {deleting ? "Removing…" : "Delete"}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add lesson"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
