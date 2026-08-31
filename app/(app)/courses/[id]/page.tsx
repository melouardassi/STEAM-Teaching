import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { CourseHeader } from "@/components/courses/course-header";
import { UnitsPanel } from "@/components/courses/units-panel";
import { EnrollmentPanel } from "@/components/courses/enrollment-panel";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      units: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      enrollments: { include: { student: true }, orderBy: { student: { name: "asc" } } },
      assignments: { orderBy: { dueDate: "asc" }, include: { _count: { select: { grades: true } } } },
    },
  });

  if (!course) notFound();

  const enrolledIds = course.enrollments.map((e) => e.studentId);
  const available = await prisma.student.findMany({
    where: { id: { notIn: enrolledIds.length > 0 ? enrolledIds : ["__none__"] } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, gradeLevel: true },
  });

  return (
    <div>
      <CourseHeader
        course={{
          id: course.id,
          name: course.name,
          gradeLevel: course.gradeLevel,
          description: course.description,
          color: course.color,
          studentCount: course.enrollments.length,
        }}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <UnitsPanel units={course.units} courseId={course.id} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
                Assignments
              </h2>
              <Link href={`/assignments?course=${course.id}&new=1`} className="btn-secondary">
                <Plus className="h-4 w-4" /> New assignment
              </Link>
            </div>
            {course.assignments.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No assignments yet"
                description="Create one to start tracking grades for this course."
              />
            ) : (
              <ul className="card divide-y" style={{ borderColor: "var(--color-border)" }}>
                {course.assignments.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/assignments/${a.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                          {a.title}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                          Due {formatDate(a.dueDate)} · {a.maxPoints} pts
                        </p>
                      </div>
                      <span className="shrink-0 text-xs" style={{ color: "var(--color-ink-muted)" }}>
                        {a._count.grades}/{course.enrollments.length} graded
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <EnrollmentPanel
            courseId={course.id}
            enrolled={course.enrollments.map((e) => ({ enrollmentId: e.id, id: e.student.id, name: e.student.name, gradeLevel: e.student.gradeLevel }))}
            available={available}
          />
        </div>
      </div>
    </div>
  );
}
