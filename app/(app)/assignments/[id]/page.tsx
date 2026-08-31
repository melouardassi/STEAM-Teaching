import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AssignmentHeader } from "@/components/assignments/assignment-header";
import { GradeTable, type GradeRow } from "@/components/assignments/grade-table";
import { GradeDistributionChart } from "@/components/assignments/grade-distribution-chart";

export const dynamic = "force-dynamic";

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          color: true,
          enrollments: { include: { student: true }, orderBy: { student: { name: "asc" } } },
        },
      },
      grades: true,
    },
  });

  if (!assignment) notFound();

  const courses = await prisma.course.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  const gradeByStudent = new Map(assignment.grades.map((g) => [g.studentId, g]));
  const rows: GradeRow[] = assignment.course.enrollments.map((e) => {
    const g = gradeByStudent.get(e.studentId);
    return { studentId: e.studentId, name: e.student.name, score: g?.score ?? null, feedback: g?.feedback ?? "" };
  });

  const percentages = rows
    .filter((r) => r.score !== null)
    .map((r) => ((r.score as number) / assignment.maxPoints) * 100);

  return (
    <div>
      <AssignmentHeader
        assignment={{
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          courseId: assignment.courseId,
          dueDate: assignment.dueDate.toISOString().slice(0, 10),
          maxPoints: assignment.maxPoints,
          rubricNotes: assignment.rubricNotes,
        }}
        courseName={assignment.course.name}
        courseColor={assignment.course.color}
        courses={courses}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {rows.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              No students are enrolled in {assignment.course.name} yet — enroll students from the course page to grade this assignment.
            </p>
          ) : (
            <GradeTable assignmentId={assignment.id} maxPoints={assignment.maxPoints} rows={rows} />
          )}
        </div>

        <div>
          <h2 className="mb-3 font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
            Grade distribution
          </h2>
          <div className="card p-4">
            <GradeDistributionChart percentages={percentages} />
          </div>
        </div>
      </div>
    </div>
  );
}
