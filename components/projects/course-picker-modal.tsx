"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { markProjectUsed, createAssignmentFromProject } from "@/lib/actions/projects";

type CourseOption = { id: string; name: string };

export function CoursePickerModal({
  open,
  onClose,
  mode,
  projectId,
  projectTitle,
  courses,
}: {
  open: boolean;
  onClose: () => void;
  mode: "use" | "assignment";
  projectId: string;
  projectTitle: string;
  courses: CourseOption[];
}) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    if (!courseId) return;
    startTransition(async () => {
      if (mode === "use") {
        const result = await markProjectUsed(projectId, courseId);
        if (result.ok) {
          toast.success("Marked as used");
          onClose();
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createAssignmentFromProject(projectId, courseId);
        if (result.ok && result.assignmentId) {
          toast.success("Assignment created");
          onClose();
          router.push(`/assignments/${result.assignmentId}`);
        } else if (!result.ok) {
          toast.error(result.error);
        }
      }
    });
  }

  if (courses.length === 0) {
    return (
      <Modal open={open} onClose={onClose} title="No courses yet">
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Create a course first, then come back to {mode === "use" ? "mark this project as used" : "turn this idea into an assignment"}.
        </p>
        <div className="mt-4 flex justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === "use" ? "Mark project as used" : "Create assignment from idea"}>
      <div className="space-y-4">
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          {mode === "use" ? `Which course used "${projectTitle}"?` : `Create an assignment based on "${projectTitle}" for:`}
        </p>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="input">
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} disabled={pending} className="btn-primary">
            {pending ? "Saving…" : mode === "use" ? "Mark as used" : "Create assignment"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
