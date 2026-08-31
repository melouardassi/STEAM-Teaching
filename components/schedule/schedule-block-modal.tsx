"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { createScheduleBlock, updateScheduleBlock, deleteScheduleBlock } from "@/lib/actions/schedule";
import { DAY_NAMES } from "@/lib/constants";

type CourseOption = { id: string; name: string; color: string };
export type BlockDraft = {
  id?: string;
  courseId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
};

export function ScheduleBlockModal({
  open,
  onClose,
  courses,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  courses: CourseOption[];
  initial: BlockDraft | null;
}) {
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const isEdit = !!initial?.id;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEdit ? await updateScheduleBlock(initial!.id!, formData) : await createScheduleBlock(formData);
      if (result.ok) {
        toast.success(isEdit ? "Class session updated" : "Class session added");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!initial?.id) return;
    startDelete(async () => {
      const result = await deleteScheduleBlock(initial.id!);
      if (result.ok) {
        toast.success("Class session removed");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!initial) return null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit class session" : "Add class session"}>
      <form action={handleSubmit} className="space-y-4">
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
          <label className="text-sm font-medium">Day</label>
          <select name="dayOfWeek" defaultValue={initial.dayOfWeek} required className="input">
            {[1, 2, 3, 4, 5, 0, 6].map((d) => (
              <option key={d} value={d}>
                {DAY_NAMES[d]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Start time</label>
            <input name="startTime" type="time" defaultValue={initial.startTime} required className="input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">End time</label>
            <input name="endTime" type="time" defaultValue={initial.endTime} required className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Room</label>
            <input name="room" defaultValue={initial.room} className="input" placeholder="e.g. Fab Lab" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Semester</label>
            <input name="semester" defaultValue={initial.semester} className="input" placeholder="Fall 2026" />
          </div>
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add session"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
