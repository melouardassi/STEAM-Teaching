"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import type { ActionResult } from "@/lib/actions/tasks";

const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().default(""),
  tags: z.string().trim().max(500).optional().default(""),
  gradeLevel: z.string().trim().min(1, "Grade level is required").max(100),
  duration: z.string().trim().min(1, "Duration is required").max(100),
  materials: z.string().trim().max(1000).optional().default(""),
  objectives: z.string().trim().max(1000).optional().default(""),
});

function parseProjectForm(formData: FormData) {
  const checked = formData.getAll("tags").map(String).filter(Boolean);
  const custom = String(formData.get("customTags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const tags = Array.from(new Set([...checked, ...custom])).join(",");
  return projectSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    tags,
    gradeLevel: formData.get("gradeLevel"),
    duration: formData.get("duration"),
    materials: formData.get("materials") ?? "",
    objectives: formData.get("objectives") ?? "",
  });
}

export async function createProjectIdea(formData: FormData): Promise<ActionResult> {
  try {
    const data = parseProjectForm(formData);
    await prisma.projectIdea.create({ data });
    await logActivity("Added project idea", data.title);
    revalidatePath("/projects");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not add project idea." };
  }
}

export async function updateProjectIdea(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const data = parseProjectForm(formData);
    await prisma.projectIdea.update({ where: { id }, data });
    revalidatePath("/projects");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update project idea." };
  }
}

export async function deleteProjectIdea(id: string): Promise<ActionResult> {
  try {
    await prisma.projectIdea.delete({ where: { id } });
    revalidatePath("/projects");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete project idea." };
  }
}

export async function markProjectUsed(id: string, courseId: string): Promise<ActionResult> {
  try {
    const [project, course] = await Promise.all([
      prisma.projectIdea.update({ where: { id }, data: { usedDate: new Date(), usedCourseId: courseId } }),
      prisma.course.findUnique({ where: { id: courseId } }),
    ]);
    await logActivity("Marked project used", `${project.title} in ${course?.name ?? "a course"}`);
    revalidatePath("/projects");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not mark project as used." };
  }
}

export async function unmarkProjectUsed(id: string): Promise<ActionResult> {
  try {
    await prisma.projectIdea.update({ where: { id }, data: { usedDate: null, usedCourseId: null } });
    revalidatePath("/projects");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update project idea." };
  }
}

export async function createAssignmentFromProject(
  projectId: string,
  courseId: string
): Promise<ActionResult & { assignmentId?: string }> {
  try {
    const project = await prisma.projectIdea.findUnique({ where: { id: projectId } });
    if (!project) return { ok: false, error: "Project idea not found." };

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        title: project.title,
        description: project.description,
        dueDate,
        maxPoints: 100,
        rubricNotes: project.objectives,
      },
    });

    await prisma.projectIdea.update({ where: { id: projectId }, data: { usedDate: new Date(), usedCourseId: courseId } });
    await logActivity("Created assignment from project idea", project.title);
    revalidatePath("/projects");
    revalidatePath("/assignments");
    return { ok: true, assignmentId: assignment.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create assignment." };
  }
}
