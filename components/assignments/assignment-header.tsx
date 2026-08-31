"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AssignmentModal, type AssignmentDraft } from "@/components/assignments/assignment-modal";

export function AssignmentHeader({
  assignment,
  courseName,
  courseColor,
  courses,
}: {
  assignment: AssignmentDraft;
  courseName: string;
  courseColor: string;
  courses: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 sm:mb-8">
      <Link
        href="/assignments"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <ArrowLeft className="h-4 w-4" /> All assignments
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: courseColor }} />
          <div>
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl" style={{ color: "var(--color-ink)" }}>
              {assignment.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>
              <span>{courseName}</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Due {formatDate(assignment.dueDate)}
              </span>
              <span>{assignment.maxPoints} pts</span>
            </div>
            {assignment.description && (
              <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--color-ink)" }}>
                {assignment.description}
              </p>
            )}
            {assignment.rubricNotes && (
              <p className="mt-2 max-w-2xl text-xs italic" style={{ color: "var(--color-ink-muted)" }}>
                Rubric: {assignment.rubricNotes}
              </p>
            )}
          </div>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="btn-secondary shrink-0">
          <Pencil className="h-4 w-4" /> Edit
        </button>
      </div>

      <AssignmentModal open={open} onClose={() => setOpen(false)} initial={assignment} courses={courses} />
    </div>
  );
}
