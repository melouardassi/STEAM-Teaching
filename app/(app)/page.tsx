import { prisma } from "@/lib/prisma";
import { quoteForToday } from "@/lib/constants";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { TodaySchedule } from "@/components/dashboard/today-schedule";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const now = new Date();
  const dayOfWeek = now.getDay();
  const quote = quoteForToday(now);

  const dbUser = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;
  const firstName = (dbUser?.name ?? "there").split(" ")[0];

  const [
    todayBlocksRaw,
    upcomingTasksRaw,
    totalStudents,
    classesToday,
    assignments,
    overdueTasks,
    recentActivity,
  ] = await Promise.all([
    prisma.scheduleBlock.findMany({
      where: { dayOfWeek },
      include: { course: { select: { name: true, gradeLevel: true, color: true } } },
      orderBy: { startTime: "asc" },
    }),
    prisma.task.findMany({
      where: { status: { not: "DONE" }, dueDate: { not: null } },
      include: { course: { select: { name: true, color: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.student.count(),
    prisma.scheduleBlock.count({ where: { dayOfWeek } }),
    prisma.assignment.findMany({
      select: {
        id: true,
        courseId: true,
        _count: { select: { grades: true } },
      },
    }),
    prisma.task.count({ where: { status: { not: "DONE" }, dueDate: { lt: now } } }),
    prisma.activityLog.findMany({ orderBy: { timestamp: "desc" }, take: 5 }),
  ]);

  // "Pending" = assignments that still have ungraded students enrolled in their course.
  const enrollmentCounts = await prisma.enrollment.groupBy({
    by: ["courseId"],
    _count: { courseId: true },
  });
  const enrollmentByCourse = new Map(enrollmentCounts.map((e) => [e.courseId, e._count.courseId]));
  const pendingAssignments = assignments.filter((a) => {
    const enrolled = enrollmentByCourse.get(a.courseId) ?? 0;
    return a._count.grades < enrolled;
  }).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl" style={{ color: "var(--color-ink)" }}>
          Good {timeOfDayGreeting(now)}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
        <p className="mt-3 max-w-xl text-sm italic" style={{ color: "var(--color-primary)" }}>
          “{quote.text}” <span className="not-italic" style={{ color: "var(--color-ink-muted)" }}>— {quote.author}</span>
        </p>
      </div>

      <QuickStats
        totalStudents={totalStudents}
        classesToday={classesToday}
        pendingAssignments={pendingAssignments}
        overdueTasks={overdueTasks}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
            Today&rsquo;s schedule
          </h2>
          <TodaySchedule blocks={todayBlocksRaw} />
        </section>

        <section>
          <h2 className="mb-3 font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
            Upcoming tasks
          </h2>
          <UpcomingTasks tasks={upcomingTasksRaw} />
        </section>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
          Recent activity
        </h2>
        <RecentActivity entries={recentActivity} />
      </section>
    </div>
  );
}

function timeOfDayGreeting(date: Date) {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
