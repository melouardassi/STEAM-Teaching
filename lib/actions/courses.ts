"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { LessonStatus } from "@prisma/client";
import type { ActionResult } from "@/lib/actions/tasks";

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

const courseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  gradeLevel: z.string().trim().min(1, "Grade level is required").max(100),
  description: z.string().trim().max(2000).optional().default(""),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color").default("#0000FF"),
});

export async function createCourse(formData: FormData): Promise<ActionResult & { id?: string }> {
  try {
    const data = courseSchema.parse({
      name: formData.get("name"),
      gradeLevel: formData.get("gradeLevel"),
      description: formData.get("description") ?? "",
      color: formData.get("color") || "#0000FF",
    });
    const course = await prisma.course.create({ data });
    await logActivity("Created course", data.name);
    revalidatePath("/courses");
    revalidatePath("/");
    return { ok: true, id: course.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create course." };
  }
}

export async function updateCourse(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const data = courseSchema.parse({
      name: formData.get("name"),
      gradeLevel: formData.get("gradeLevel"),
      description: formData.get("description") ?? "",
      color: formData.get("color") || "#0000FF",
    });
    await prisma.course.update({ where: { id }, data });
    revalidatePath("/courses");
    revalidatePath(`/courses/${id}`);
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update course." };
  }
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  try {
    await prisma.course.delete({ where: { id } });
    revalidatePath("/courses");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete course." };
  }
}

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

const unitSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(2000).optional().default(""),
});

export async function createUnit(courseId: string, formData: FormData): Promise<ActionResult> {
  try {
    const data = unitSchema.parse({ name: formData.get("name"), description: formData.get("description") ?? "" });
    const count = await prisma.unit.count({ where: { courseId } });
    await prisma.unit.create({ data: { ...data, courseId, order: count } });
    revalidatePath(`/courses/${courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not add unit." };
  }
}

export async function updateUnit(id: string, courseId: string, formData: FormData): Promise<ActionResult> {
  try {
    const data = unitSchema.parse({ name: formData.get("name"), description: formData.get("description") ?? "" });
    await prisma.unit.update({ where: { id }, data });
    revalidatePath(`/courses/${courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update unit." };
  }
}

export async function deleteUnit(id: string, courseId: string): Promise<ActionResult> {
  try {
    await prisma.unit.delete({ where: { id } });
    revalidatePath(`/courses/${courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete unit." };
  }
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

const lessonSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  status: z.nativeEnum(LessonStatus).default(LessonStatus.PLANNED),
  content: z.string().trim().max(5000).optional().default(""),
});

export async function createLesson(unitId: string, courseId: string, formData: FormData): Promise<ActionResult> {
  try {
    const data = lessonSchema.parse({
      title: formData.get("title"),
      status: formData.get("status") || undefined,
      content: formData.get("content") ?? "",
    });
    const count = await prisma.lesson.count({ where: { unitId } });
    await prisma.lesson.create({ data: { ...data, unitId, order: count } });
    revalidatePath(`/courses/${courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not add lesson." };
  }
}

export async function updateLesson(id: string, courseId: string, formData: FormData): Promise<ActionResult> {
  try {
    const data = lessonSchema.parse({
      title: formData.get("title"),
      status: formData.get("status") || undefined,
      content: formData.get("content") ?? "",
    });
    await prisma.lesson.update({ where: { id }, data });
    revalidatePath(`/courses/${courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update lesson." };
  }
}

export async function setLessonStatus(id: string, courseId: string, status: LessonStatus): Promise<ActionResult> {
  try {
    await prisma.lesson.update({ where: { id }, data: { status } });
    revalidatePath(`/courses/${courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update lesson status." };
  }
}

export async function deleteLesson(id: string, courseId: string): Promise<ActionResult> {
  try {
    await prisma.lesson.delete({ where: { id } });
    revalidatePath(`/courses/${courseId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete lesson." };
  }
}

// ---------------------------------------------------------------------------
// Enrollment
// ---------------------------------------------------------------------------

export async function enrollStudent(courseId: string, studentId: string): Promise<ActionResult> {
  try {
    await prisma.enrollment.create({ data: { courseId, studentId } });
    const [student] = await Promise.all([prisma.student.findUnique({ where: { id: studentId } })]);
    await logActivity("Enrolled student", student ? student.name : undefined);
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/students");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not enroll student." };
  }
}

export async function unenrollStudent(enrollmentId: string, courseId: string): Promise<ActionResult> {
  try {
    await prisma.enrollment.delete({ where: { id: enrollmentId } });
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/students");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not remove student." };
  }
}
