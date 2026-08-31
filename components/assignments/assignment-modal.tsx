"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { createAssignment, updateAssignment, deleteAssignment } from "@/lib/actions/assignments";
import type { ActionResult } from "@/lib/actions/tasks";

export type AssignmentDraft = {
  id?: string;
  title: string;
  description: string;
  courseId: string;
  dueDate: string; // yyyy-mm-dd
  maxPoints: number;
  rubricNotes: string;
};

type CourseOption = { id: string; name: string };

export function AssignmentModal({
  open,
  onClose,
  initial,
  courses,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  initial: AssignmentDraft;
  courses: CourseOption[];
  onCreated?: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const router = useRouter();
  const isEdit = !!initial.id;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      let result: ActionResult & { id?: string };
      if (isEdit) {
        result = await updateAssignment(initial.id!, formData);
      } else {
        result = await createAssignment(formData);
      }
      if (result.ok) {
        toast.success(isEdit ? "Assignment updated" : "Assignment created");
        onClose();
        if (!isEdit && result.id && onCreated) onCreated(result.id);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!initial.id) return;
    if (!window.confirm(`Delete "${initial.title}"? This removes all grades entered for it.`)) return;
    startDelete(async () => {
      const result = await deleteAssignment(initial.id!);
      if (result.ok) {
        toast.success("Assignment deleted");
        onClose();
        router.push("/assignments");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit assignment" : "New assignment"} maxWidth="max-w-xl">
      <form action={handleSubmit} className="space-y-4" key={initial.id ?? initial.courseId ?? "new"}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <input name="title" defaultValue={initial.title} required autoFocus className="input" placeholder="e.g. Site Analysis Report" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Course</label>
            <select name="courseId" defaultValue={initial.courseId} required className="input">
              <option value="" disabled>
                Select a course
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Due date</label>
            <input name="dueDate" type="date" defaultValue={initial.dueDate} required className="input" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Max points</label>
          <input name="maxPoints" type="number" min="1" step="1" defaultValue={initial.maxPoints} required className="input" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" defaultValue={initial.description} rows={2} className="input resize-none" placeholder="What are students doing for this assignment?" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Rubric notes</label>
          <textarea name="rubricNotes" defaultValue={initial.rubricNotes} rows={2} className="input resize-none" placeholder="e.g. Craft (30) · Concept (30) · Presentation (20) · Documentation (20)" />
        </div>

        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button type="button" onClick={handleDelete} disabled={deleting} className="btn-danger">
              {deleting ? "Deleting…" : "Delete"}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create assignment"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
