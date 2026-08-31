"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Mail } from "lucide-react";
import { initials } from "@/lib/utils";
import { StudentModal, type StudentDraft } from "@/components/students/student-modal";

export function StudentHeader({ student }: { student: StudentDraft }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 sm:mb-8">
      <Link
        href="/students"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <ArrowLeft className="h-4 w-4" /> All students
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold"
            style={{ background: "var(--color-primary)", color: "white" }}
          >
            {initials(student.name)}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl" style={{ color: "var(--color-ink)" }}>
              {student.name}
            </h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm" style={{ color: "var(--color-ink-muted)" }}>
              <span>{student.gradeLevel}</span>
              {student.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {student.email}
                </span>
              )}
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="btn-secondary shrink-0">
          <Pencil className="h-4 w-4" /> Edit
        </button>
      </div>

      <StudentModal open={open} onClose={() => setOpen(false)} initial={student} />
    </div>
  );
}
