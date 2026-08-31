import { prisma } from "@/lib/prisma";
import { ProjectsView } from "@/components/projects/projects-view";
import type { ProjectData } from "@/components/projects/project-card";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, courses] = await Promise.all([
    prisma.projectIdea.findMany({
      orderBy: { createdAt: "asc" },
      include: { usedCourse: { select: { id: true, name: true } } },
    }),
    prisma.course.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const data: ProjectData[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    tags: p.tags ? p.tags.split(",").filter(Boolean) : [],
    gradeLevel: p.gradeLevel,
    duration: p.duration,
    materials: p.materials,
    objectives: p.objectives,
    usedDate: p.usedDate,
    usedCourse: p.usedCourse,
  }));

  return <ProjectsView projects={data} courses={courses} />;
}
