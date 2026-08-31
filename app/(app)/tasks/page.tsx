import { prisma } from "@/lib/prisma";
import { TaskBoard } from "@/components/tasks/task-board";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [tasks, courses] = await Promise.all([
    prisma.task.findMany({
      orderBy: [{ order: "asc" }],
      include: { course: { select: { id: true, name: true, color: true } } },
    }),
    prisma.course.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <TaskBoard tasks={tasks} courses={courses} />;
}
