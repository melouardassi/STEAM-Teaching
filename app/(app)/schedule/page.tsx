import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ScheduleTabs } from "@/components/schedule/schedule-tabs";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const [blocks, courses, events] = await Promise.all([
    prisma.scheduleBlock.findMany({
      include: { course: { select: { id: true, name: true, gradeLevel: true, color: true } } },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.course.findMany({ select: { id: true, name: true, color: true }, orderBy: { name: "asc" } }),
    prisma.calendarEvent.findMany({ orderBy: { date: "asc" } }),
  ]);

  const defaultSemester = blocks[0]?.semester ?? "Fall 2026";

  return (
    <div>
      <PageHeader
        title="Schedule & Calendar"
        description="Your recurring weekly classes, plus holidays, exams, and exhibition dates."
      />
      <ScheduleTabs blocks={blocks} courses={courses} events={events} defaultSemester={defaultSemester} />
    </div>
  );
}
