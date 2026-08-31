"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { createStudent, updateStudent, deleteStudent } from "@/lib/actions/students";
import type { ActionResult } from "@/lib/actions/tasks";

export type StudentDraft = { id?: string; name: string; gradeLevel: string; email: string; notes: string };

export function StudentModal({
  open,
  onClose,
  initial,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  initial: StudentDraft;
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
        result = await updateStudent(initial.id!, formData);
      } else {
        result = await createStudent(formData);
      }
      if (result.ok) {
        toast.success(isEdit ? "Student updated" : "Student added");
        onClose();
        if (!isEdit && result.id && onCreated) onCreated(result.id);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!initial.id) return;
    if (!window.confirm(`Remove ${initial.name}? This deletes their grades and attendance records.`)) return;
    startDelete(async () => {
      const result = await deleteStudent(initial.id!);
      if (result.ok) {
        toast.success("Student removed");
        onClose();
        router.push("/students");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit student" : "New student"}>
      <form action={handleSubmit} className="space-y-4" key={initial.id ?? "new"}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Full name</label>
          <input name="name" defaultValue={initial.name} required autoFocus className="input" placeholder="e.g. Maya Chen" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Grade level</label>
          <input name="gradeLevel" defaultValue={initial.gradeLevel} required className="input" placeholder="e.g. Grade 8" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email (optional)</label>
          <input name="email" type="email" defaultValue={initial.email} className="input" placeholder="student@school.edu" />
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add student"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
