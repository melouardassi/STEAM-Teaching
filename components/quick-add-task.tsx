"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { createTask } from "@/lib/actions/tasks";
import { TASK_PRIORITIES } from "@/lib/constants";

type CourseOption = { id: string; name: string; color: string };

export function QuickAddTask({ courses }: { courses: CourseOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTask(formData);
      if (result.ok) {
        toast.success("Task added");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
        title="Quick add task"
        aria-label="Quick add task"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Quick add task">
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <input name="title" required autoFocus className="input" placeholder="e.g. Order more filament" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea name="description" rows={2} className="input resize-none" placeholder="Optional details" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Priority</label>
              <select name="priority" defaultValue="MEDIUM" className="input">
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Due date</label>
              <input name="dueDate" type="date" className="input" />
            </div>
          </div>
          {courses.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Course (optional)</label>
              <select name="courseId" defaultValue="" className="input">
                <option value="">No course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Adding…" : "Add task"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
