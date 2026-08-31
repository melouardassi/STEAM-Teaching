import { prisma } from "@/lib/prisma";
import { CoursesView, type CourseCardData } from "@/components/courses/courses-view";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { enrollments: true } },
      units: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  const data: CourseCardData[] = courses.map((c) => ({
    id: c.id,
    name: c.name,
    gradeLevel: c.gradeLevel,
    description: c.description,
    color: c.color,
    studentCount: c._count.enrollments,
    currentUnit: currentUnitName(c.units),
  }));

  return <CoursesView courses={data} />;
}

function currentUnitName(units: { name: string; lessons: { status: string }[] }[]) {
  if (units.length === 0) return null;
  const inProgress = units.find((u) => u.lessons.some((l) => l.status === "IN_PROGRESS"));
  if (inProgress) return inProgress.name;
  const upcoming = units.find((u) => u.lessons.some((l) => l.status !== "COMPLETED"));
  if (upcoming) return upcoming.name;
  return units[units.length - 1].name;
}
