"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import type { ActionResult } from "@/lib/actions/tasks";

const assignmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().default(""),
  courseId: z.string().min(1, "Course is required"),
  dueDate: z.string().min(1, "Due date is required"),
  maxPoints: z.coerce.number().positive("Must be greater than 0").max(1000),
  rubricNotes: z.string().trim().max(2000).optional().default(""),
});

export async function createAssignment(formData: FormData): Promise<ActionResult & { id?: string }> {
  try {
    const data = assignmentSchema.parse({
      title: formData.get("title"),
      description: formData.get("description") ?? "",
      courseId: formData.get("courseId"),
      dueDate: formData.get("dueDate"),
      maxPoints: formData.get("maxPoints"),
      rubricNotes: formData.get("rubricNotes") ?? "",
    });
    const assignment = await prisma.assignment.create({
      data: { ...data, dueDate: new Date(data.dueDate) },
    });
    await logActivity("Created assignment", data.title);
    revalidatePath("/assignments");
    revalidatePath("/");
    return { ok: true, id: assignment.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create assignment." };
  }
}

export async function updateAssignment(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const data = assignmentSchema.parse({
      title: formData.get("title"),
      description: formData.get("description") ?? "",
      courseId: formData.get("courseId"),
      dueDate: formData.get("dueDate"),
      maxPoints: formData.get("maxPoints"),
      rubricNotes: formData.get("rubricNotes") ?? "",
    });
    await prisma.assignment.update({ where: { id }, data: { ...data, dueDate: new Date(data.dueDate) } });
    revalidatePath("/assignments");
    revalidatePath(`/assignments/${id}`);
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update assignment." };
  }
}

export async function deleteAssignment(id: string): Promise<ActionResult> {
  try {
    await prisma.assignment.delete({ where: { id } });
    revalidatePath("/assignments");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete assignment." };
  }
}

export async function upsertGrade(
  studentId: string,
  assignmentId: string,
  score: number | null,
  feedback: string
): Promise<ActionResult> {
  try {
    await prisma.grade.upsert({
      where: { studentId_assignmentId: { studentId, assignmentId } },
      update: { score, feedback, gradedAt: new Date() },
      create: { studentId, assignmentId, score, feedback },
    });
    revalidatePath(`/assignments/${assignmentId}`);
    revalidatePath("/students");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save grade." };
  }
}

export async function bulkSaveGrades(
  assignmentId: string,
  rows: { studentId: string; score: number | null; feedback: string }[]
): Promise<ActionResult> {
  try {
    await prisma.$transaction(
      rows.map((r) =>
        prisma.grade.upsert({
          where: { studentId_assignmentId: { studentId: r.studentId, assignmentId } },
          update: { score: r.score, feedback: r.feedback, gradedAt: new Date() },
          create: { studentId: r.studentId, assignmentId, score: r.score, feedback: r.feedback },
        })
      )
    );
    await logActivity("Saved grades", `${rows.length} student${rows.length === 1 ? "" : "s"}`);
    revalidatePath(`/assignments/${assignmentId}`);
    revalidatePath("/students");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save grades." };
  }
}

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function bulkImportGrades(
  assignmentId: string,
  pasteText: string
): Promise<ActionResult & { matched?: number; unmatched?: string[] }> {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: { include: { enrollments: { include: { student: true } } } } },
    });
    if (!assignment) return { ok: false, error: "Assignment not found." };

    const roster = assignment.course.enrollments.map((e) => e.student);
    const byName = new Map(roster.map((s) => [normalizeName(s.name), s]));

    const lines = pasteText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const updates: { studentId: string; score: number | null; feedback: string }[] = [];
    const unmatched: string[] = [];

    for (const line of lines) {
      // Accept tab, comma, or multiple-space separated: "Name<sep>Score<sep optional>Feedback"
      const parts = line.split(/\t|,|(?<=\S)\s{2,}(?=\S)/).map((p) => p.trim()).filter((p) => p.length > 0);
      if (parts.length < 2) continue;
      const [namePart, scorePart, ...rest] = parts;
      const student = byName.get(normalizeName(namePart));
      const score = Number(scorePart.replace(/[^0-9.\-]/g, ""));
      if (!student || Number.isNaN(score)) {
        unmatched.push(namePart);
        continue;
      }
      updates.push({ studentId: student.id, score, feedback: rest.join(" ").trim() });
    }

    if (updates.length > 0) {
      await prisma.$transaction(
        updates.map((r) =>
          prisma.grade.upsert({
            where: { studentId_assignmentId: { studentId: r.studentId, assignmentId } },
            update: { score: r.score, feedback: r.feedback || undefined, gradedAt: new Date() },
            create: { studentId: r.studentId, assignmentId, score: r.score, feedback: r.feedback },
          })
        )
      );
      await logActivity("Bulk imported grades", `${assignment.title} — ${updates.length} students`);
    }

    revalidatePath(`/assignments/${assignmentId}`);
    revalidatePath("/students");
    revalidatePath("/");
    return { ok: true, matched: updates.length, unmatched };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not import grades." };
  }
}
