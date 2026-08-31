import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { round1 } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { StudentHeader } from "@/components/students/student-header";
import { NotesCard } from "@/components/students/notes-card";
import { AttendanceCard } from "@/components/students/attendance-card";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: { include: { course: { select: { id: true, name: true, color: true, gradeLevel: true } } } },
      grades: {
        where: { score: { not: null } },
        orderBy: { gradedAt: "desc" },
        include: { assignment: { select: { title: true, maxPoints: true, courseId: true, course: { select: { name: true, color: true } } } } },
      },
      attendance: true,
    },
  });

  if (!student) notFound();

  const present = student.attendance.filter((a) => a.status === "PRESENT").length;
  const absent = student.attendance.filter((a) => a.status === "ABSENT").length;
  const late = student.attendance.filter((a) => a.status === "LATE").length;

  return (
    <div>
      <StudentHeader student={{ id: student.id, name: student.name, gradeLevel: student.gradeLevel, email: student.email ?? "", notes: student.notes }} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <h2 className="mb-3 font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
              Enrolled courses
            </h2>
            {student.enrollments.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
                Not enrolled in any courses yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {student.enrollments.map((e) => (
                  <Link
                    key={e.id}
                    href={`/courses/${e.course.id}`}
                    className="card flex items-center gap-2 px-3 py-2 text-sm font-medium transition-shadow hover:shadow-md"
                    style={{ color: "var(--color-ink)" }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.course.color }} />
                    {e.course.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
              Grades
            </h2>
            {student.grades.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No grades yet" description="Scores entered on assignments will appear here." />
            ) : (
              <div className="card overflow-x-auto p-0">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-ink-muted)" }}>
                      <th className="px-4 py-3 font-medium">Assignment</th>
                      <th className="px-4 py-3 font-medium">Course</th>
                      <th className="px-4 py-3 text-right font-medium">Score</th>
                      <th className="px-4 py-3 text-right font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.grades.map((g) => (
                      <tr key={g.id} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                        <td className="px-4 py-3">
                          <Link href={`/assignments/${g.assignmentId}`} className="font-medium hover:underline" style={{ color: "var(--color-ink)" }}>
                            {g.assignment.title}
                          </Link>
                          {g.feedback && (
                            <p className="mt-0.5 text-xs" style={{ color: "var(--color-ink-muted)" }}>
                              {g.feedback}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--color-ink-muted)" }}>
                          {g.assignment.course.name}
                        </td>
                        <td className="px-4 py-3 text-right" style={{ color: "var(--color-ink)" }}>
                          {g.score} / {g.assignment.maxPoints}
                        </td>
                        <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--color-ink)" }}>
                          {round1(((g.score as number) / g.assignment.maxPoints) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <AttendanceCard studentId={student.id} present={present} absent={absent} late={late} />
          <NotesCard studentId={student.id} initialNotes={student.notes} />
        </div>
      </div>
    </div>
  );
}
