"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { CourseModal, type CourseDraft } from "@/components/courses/course-modal";

export function CourseHeader({ course }: { course: CourseDraft & { studentCount: number } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 sm:mb-8">
      <Link
        href="/courses"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <ArrowLeft className="h-4 w-4" /> All courses
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: course.color }} />
          <div>
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl" style={{ color: "var(--color-ink)" }}>
              {course.name}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>
              {course.gradeLevel} · {course.studentCount} student{course.studentCount === 1 ? "" : "s"}
            </p>
            {course.description && (
              <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--color-ink)" }}>
                {course.description}
              </p>
            )}
          </div>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="btn-secondary shrink-0">
          <Pencil className="h-4 w-4" /> Edit course
        </button>
      </div>

      <CourseModal open={open} onClose={() => setOpen(false)} initial={course} />
    </div>
  );
}
