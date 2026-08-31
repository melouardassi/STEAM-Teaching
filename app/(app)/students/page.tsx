import { prisma } from "@/lib/prisma";
import { average } from "@/lib/utils";
import { StudentsView, type StudentRow } from "@/components/students/students-view";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
    include: {
      enrollments: { include: { course: { select: { id: true, name: true, color: true } } } },
      grades: { where: { score: { not: null } }, include: { assignment: { select: { maxPoints: true } } } },
    },
  });

  const rows: StudentRow[] = students.map((s) => {
    const percentages = s.grades
      .filter((g) => g.score !== null)
      .map((g) => ((g.score as number) / g.assignment.maxPoints) * 100);
    return {
      id: s.id,
      name: s.name,
      gradeLevel: s.gradeLevel,
      courses: s.enrollments.map((e) => e.course),
      average: average(percentages),
    };
  });

  return <StudentsView students={rows} />;
}
