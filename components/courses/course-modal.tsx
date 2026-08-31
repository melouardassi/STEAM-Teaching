"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { createCourse, updateCourse, deleteCourse } from "@/lib/actions/courses";
import type { ActionResult } from "@/lib/actions/tasks";
import { COURSE_COLORS } from "@/lib/constants";
import { Check } from "lucide-react";

export type CourseDraft = {
  id?: string;
  name: string;
  gradeLevel: string;
  description: string;
  color: string;
};

export function CourseModal({
  open,
  onClose,
  initial,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  initial: CourseDraft;
  onCreated?: (id: string) => void;
}) {
  const [color, setColor] = useState(initial.color);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const router = useRouter();
  const isEdit = !!initial.id;

  function handleSubmit(formData: FormData) {
    formData.set("color", color);
    startTransition(async () => {
      let result: ActionResult & { id?: string };
      if (isEdit) {
        result = await updateCourse(initial.id!, formData);
      } else {
        result = await createCourse(formData);
      }
      if (result.ok) {
        toast.success(isEdit ? "Course updated" : "Course created");
        onClose();
        if (!isEdit && result.id && onCreated) onCreated(result.id);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!initial.id) return;
    if (!window.confirm(`Delete "${initial.name}"? This removes its units, lessons, assignments, and enrollments.`)) return;
    startDelete(async () => {
      const result = await deleteCourse(initial.id!);
      if (result.ok) {
        toast.success("Course deleted");
        onClose();
        router.push("/courses");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit course" : "New course"}>
      <form action={handleSubmit} className="space-y-4" key={initial.id ?? "new"}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Course name</label>
          <input name="name" defaultValue={initial.name} required autoFocus className="input" placeholder="e.g. Design & Architecture" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Grade level</label>
          <input name="gradeLevel" defaultValue={initial.gradeLevel} required className="input" placeholder="e.g. Grade 8" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" defaultValue={initial.description} rows={3} className="input resize-none" placeholder="What is this course about?" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Color</label>
          <div className="flex flex-wrap gap-2">
            {COURSE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                style={{ background: c, borderColor: color === c ? "var(--color-ink)" : "transparent" }}
                aria-label={`Choose color ${c}`}
              >
                {color === c && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create course"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
