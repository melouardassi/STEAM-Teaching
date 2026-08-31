import { prisma } from "@/lib/prisma";
import { AssignmentsView, type AssignmentRow } from "@/components/assignments/assignments-view";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; new?: string }>;
}) {
  const params = await searchParams;

  const [assignments, courses] = await Promise.all([
    prisma.assignment.findMany({
      orderBy: { dueDate: "desc" },
      include: {
        course: { select: { id: true, name: true, color: true, _count: { select: { enrollments: true } } } },
        _count: { select: { grades: { where: { score: { not: null } } } } },
      },
    }),
    prisma.course.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const rows: AssignmentRow[] = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    dueDate: a.dueDate,
    maxPoints: a.maxPoints,
    course: { id: a.course.id, name: a.course.name, color: a.course.color },
    gradedCount: a._count.grades,
    enrolledCount: a.course._count.enrollments,
  }));

  const autoOpenCourseId = params.new === "1" ? params.course : undefined;

  return (
    <AssignmentsView
      key={autoOpenCourseId ?? "none"}
      assignments={rows}
      courses={courses}
      autoOpenCourseId={autoOpenCourseId}
    />
  );
}
