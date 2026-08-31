"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/utils";
import { AssignmentModal, type AssignmentDraft } from "@/components/assignments/assignment-modal";

export type AssignmentRow = {
  id: string;
  title: string;
  dueDate: Date;
  maxPoints: number;
  course: { id: string; name: string; color: string };
  gradedCount: number;
  enrolledCount: number;
};

const emptyDraft = (courseId = ""): AssignmentDraft => ({
  title: "",
  description: "",
  courseId,
  dueDate: new Date().toISOString().slice(0, 10),
  maxPoints: 100,
  rubricNotes: "",
});

export function AssignmentsView({
  assignments,
  courses,
  autoOpenCourseId,
}: {
  assignments: AssignmentRow[];
  courses: { id: string; name: string }[];
  autoOpenCourseId?: string;
}) {
  const [modalOpen, setModalOpen] = useState(!!autoOpenCourseId);
  const [draft, setDraft] = useState<AssignmentDraft>(emptyDraft(autoOpenCourseId));
  const router = useRouter();

  function openCreate() {
    setDraft(emptyDraft());
    setModalOpen(true);
  }

  const sorted = [...assignments].sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Create assignments and track grading progress across your courses."
        action={
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" /> New assignment
          </button>
        }
      />

      {assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet — add your first one"
          description="Create an assignment, then enter grades from its page."
          action={
            <button type="button" onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" /> New assignment
            </button>
          }
        />
      ) : (
        <div className="card divide-y overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
          {sorted.map((a) => {
            const pct = a.enrolledCount > 0 ? Math.round((a.gradedCount / a.enrolledCount) * 100) : 0;
            return (
              <Link
                key={a.id}
                href={`/assignments/${a.id}`}
                className="flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-[var(--color-surface-hover)] sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: a.course.color }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                      {a.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                      {a.course.name} · Due {formatDate(a.dueDate)} · {a.maxPoints} pts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:w-40">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--color-border)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: pct === 100 ? "var(--color-success)" : "var(--color-primary)" }}
                    />
                  </div>
                  <span className="shrink-0 text-xs" style={{ color: "var(--color-ink-muted)" }}>
                    {a.gradedCount}/{a.enrolledCount}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <AssignmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={draft}
        courses={courses}
        onCreated={(id) => router.push(`/assignments/${id}`)}
      />
    </div>
  );
}
