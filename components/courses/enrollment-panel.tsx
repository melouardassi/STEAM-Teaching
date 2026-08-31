"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { UserPlus, X, Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { initials } from "@/lib/utils";
import { enrollStudent, unenrollStudent } from "@/lib/actions/courses";

type EnrolledStudent = { enrollmentId: string; id: string; name: string; gradeLevel: string };
type AvailableStudent = { id: string; name: string; gradeLevel: string };

export function EnrollmentPanel({
  courseId,
  enrolled,
  available,
}: {
  courseId: string;
  enrolled: EnrolledStudent[];
  available: AvailableStudent[];
}) {
  const [selected, setSelected] = useState(available[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  function handleEnroll() {
    if (!selected) return;
    startTransition(async () => {
      const result = await enrollStudent(courseId, selected);
      if (result.ok) toast.success("Student enrolled");
      else toast.error(result.error);
    });
  }

  function handleRemove(enrollmentId: string) {
    setRemovingId(enrollmentId);
    startTransition(async () => {
      const result = await unenrollStudent(enrollmentId, courseId);
      if (result.ok) toast.success("Student removed from course");
      else toast.error(result.error);
      setRemovingId(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
          Enrolled students
        </h2>
      </div>

      {available.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input">
            {available.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.gradeLevel}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleEnroll} disabled={pending} className="btn-secondary shrink-0">
            <UserPlus className="h-4 w-4" /> Enroll
          </button>
        </div>
      )}

      {enrolled.length === 0 ? (
        <EmptyState icon={Users} title="No students enrolled yet" description="Add students from the roster above." />
      ) : (
        <ul className="card divide-y" style={{ borderColor: "var(--color-border)" }}>
          {enrolled.map((s) => (
            <li key={s.enrollmentId} className="flex items-center gap-3 px-4 py-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: "var(--color-primary)", color: "white" }}
              >
                {initials(s.name)}
              </div>
              <Link href={`/students/${s.id}`} className="min-w-0 flex-1 hover:underline">
                <p className="truncate text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                  {s.name}
                </p>
                <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                  {s.gradeLevel}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => handleRemove(s.enrollmentId)}
                disabled={removingId === s.enrollmentId}
                className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-[var(--color-surface-hover)]"
                style={{ color: "var(--color-danger)" }}
                aria-label={`Remove ${s.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
