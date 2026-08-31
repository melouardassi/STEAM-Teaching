"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Users, Layers, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { CourseModal, type CourseDraft } from "@/components/courses/course-modal";

export type CourseCardData = {
  id: string;
  name: string;
  gradeLevel: string;
  description: string;
  color: string;
  studentCount: number;
  currentUnit: string | null;
};

const EMPTY_DRAFT: CourseDraft = { name: "", gradeLevel: "", description: "", color: "#0000FF" };

export function CoursesView({ courses }: { courses: CourseCardData[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<CourseDraft>(EMPTY_DRAFT);
  const router = useRouter();

  function openCreate() {
    setDraft(EMPTY_DRAFT);
    setModalOpen(true);
  }

  function openEdit(e: React.MouseEvent, c: CourseCardData) {
    e.preventDefault();
    e.stopPropagation();
    setDraft({ id: c.id, name: c.name, gradeLevel: c.gradeLevel, description: c.description, color: c.color });
    setModalOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Your teaching load, curriculum, and rosters at a glance."
        action={
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" /> New course
          </button>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet — add your first one"
          description="Create a course to start building units, lessons, and rosters."
          action={
            <button type="button" onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" /> New course
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="card group flex flex-col gap-3 p-5 transition-shadow hover:shadow-md"
              style={{ borderTop: `3px solid ${c.color}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
                    {c.name}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                    {c.gradeLevel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => openEdit(e, c)}
                  className="rounded-lg p-1.5 opacity-0 transition-opacity hover:bg-[var(--color-surface-hover)] group-hover:opacity-100"
                  aria-label={`Edit ${c.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-1 flex items-center gap-4 text-xs" style={{ color: "var(--color-ink-muted)" }}>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> {c.studentCount} student{c.studentCount === 1 ? "" : "s"}
                </span>
              </div>

              <div
                className="mt-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs"
                style={{ background: "var(--color-bg)", color: "var(--color-ink-muted)" }}
              >
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{c.currentUnit ? `Current: ${c.currentUnit}` : "No units yet"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CourseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={draft}
        onCreated={(id) => router.push(`/courses/${id}`)}
      />
    </div>
  );
}
