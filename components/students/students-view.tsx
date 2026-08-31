"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { initials, round1 } from "@/lib/utils";
import { StudentModal, type StudentDraft } from "@/components/students/student-modal";

export type StudentRow = {
  id: string;
  name: string;
  gradeLevel: string;
  courses: { id: string; name: string; color: string }[];
  average: number | null;
};

const EMPTY_DRAFT: StudentDraft = { name: "", gradeLevel: "", email: "", notes: "" };

export function StudentsView({ students }: { students: StudentRow[] }) {
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const gradeLevels = useMemo(() => ["All", ...Array.from(new Set(students.map((s) => s.gradeLevel))).sort()], [students]);

  const filtered = students.filter((s) => {
    const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase());
    const matchesGrade = gradeFilter === "All" || s.gradeLevel === gradeFilter;
    return matchesQuery && matchesGrade;
  });

  return (
    <div>
      <PageHeader
        title="Students"
        description="Your full roster across every course."
        action={
          <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> New student
          </button>
        }
      />

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students yet — add your first one"
          description="Add students, then enroll them in courses from the course page."
          action={
            <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> New student
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-ink-muted)" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students…"
                className="input pl-9"
              />
            </div>
            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="input sm:w-48">
              {gradeLevels.map((g) => (
                <option key={g} value={g}>
                  {g === "All" ? "All grade levels" : g}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="No students match" description="Try a different search or filter." />
          ) : (
            <div className="card overflow-x-auto p-0">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-ink-muted)" }}>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Grade</th>
                    <th className="px-4 py-3 font-medium">Courses</th>
                    <th className="px-4 py-3 text-right font-medium">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => router.push(`/students/${s.id}`)}
                      className="cursor-pointer border-b transition-colors last:border-0 hover:bg-[var(--color-surface-hover)]"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                            style={{ background: "var(--color-primary)", color: "white" }}
                          >
                            {initials(s.name)}
                          </div>
                          <Link href={`/students/${s.id}`} onClick={(e) => e.stopPropagation()} className="font-medium hover:underline" style={{ color: "var(--color-ink)" }}>
                            {s.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--color-ink-muted)" }}>
                        {s.gradeLevel}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.courses.length === 0 ? (
                            <span style={{ color: "var(--color-ink-muted)" }}>—</span>
                          ) : (
                            s.courses.map((c) => (
                              <span
                                key={c.id}
                                className="badge"
                                style={{ background: "var(--color-surface-hover)", color: "var(--color-ink)" }}
                              >
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                                {c.name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--color-ink)" }}>
                        {s.average !== null ? `${round1(s.average)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <StudentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={EMPTY_DRAFT}
        onCreated={(id) => router.push(`/students/${id}`)}
      />
    </div>
  );
}
