"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { createTask, updateTask, deleteTask } from "@/lib/actions/tasks";
import type { ActionResult } from "@/lib/actions/tasks";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/constants";

export type TaskDraft = {
  id?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string; // yyyy-mm-dd or ""
  courseId: string;
};

type CourseOption = { id: string; name: string };

export function TaskModal({
  open,
  onClose,
  initial,
  courses,
}: {
  open: boolean;
  onClose: () => void;
  initial: TaskDraft | null;
  courses: CourseOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const isEdit = !!initial?.id;

  function handleSubmit(formData: FormData) {
    if (!initial) return;
    startTransition(async () => {
      let result: ActionResult;
      if (isEdit) {
        result = await updateTask(initial.id!, formData);
      } else {
        result = await createTask(formData);
      }
      if (result.ok) {
        toast.success(isEdit ? "Task updated" : "Task added");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!initial?.id) return;
    startDelete(async () => {
      const result = await deleteTask(initial.id!);
      if (result.ok) {
        toast.success("Task deleted");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!initial) return null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit task" : "New task"}>
      <form action={handleSubmit} className="space-y-4" key={initial.id ?? "new"}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <input name="title" defaultValue={initial.title} required autoFocus className="input" placeholder="e.g. Order more filament" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" defaultValue={initial.description} rows={2} className="input resize-none" placeholder="Optional details" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Status</label>
            <select name="status" defaultValue={initial.status} className="input">
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Priority</label>
            <select name="priority" defaultValue={initial.priority} className="input">
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Due date</label>
            <input name="dueDate" type="date" defaultValue={initial.dueDate} className="input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Course</label>
            <select name="courseId" defaultValue={initial.courseId} className="input">
              <option value="">No course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add task"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
