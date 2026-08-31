"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { AttendanceStatus } from "@prisma/client";
import type { ActionResult } from "@/lib/actions/tasks";

const studentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  gradeLevel: z.string().trim().min(1, "Grade level is required").max(100),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().default(""),
});

export async function createStudent(formData: FormData): Promise<ActionResult & { id?: string }> {
  try {
    const data = studentSchema.parse({
      name: formData.get("name"),
      gradeLevel: formData.get("gradeLevel"),
      email: formData.get("email") ?? "",
      notes: formData.get("notes") ?? "",
    });
    const student = await prisma.student.create({ data: { ...data, email: data.email || null } });
    await logActivity("Added student", data.name);
    revalidatePath("/students");
    revalidatePath("/");
    return { ok: true, id: student.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not add student." };
  }
}

const profileSchema = studentSchema.omit({ notes: true });

export async function updateStudent(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const data = profileSchema.parse({
      name: formData.get("name"),
      gradeLevel: formData.get("gradeLevel"),
      email: formData.get("email") ?? "",
    });
    // Notes are edited separately via updateStudentNotes — never touched here.
    await prisma.student.update({ where: { id }, data: { ...data, email: data.email || null } });
    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update student." };
  }
}

export async function deleteStudent(id: string): Promise<ActionResult> {
  try {
    await prisma.student.delete({ where: { id } });
    revalidatePath("/students");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete student." };
  }
}

export async function updateStudentNotes(id: string, notes: string): Promise<ActionResult> {
  try {
    await prisma.student.update({ where: { id }, data: { notes: notes.slice(0, 5000) } });
    revalidatePath(`/students/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save notes." };
  }
}

export async function recordAttendance(studentId: string, courseId: string | null, status: AttendanceStatus): Promise<ActionResult> {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const existing = await prisma.attendance.findFirst({
      where: { studentId, date: { gte: startOfDay, lt: endOfDay } },
    });

    if (existing) {
      await prisma.attendance.update({ where: { id: existing.id }, data: { status, courseId } });
    } else {
      await prisma.attendance.create({ data: { studentId, courseId, status, date: today } });
    }

    revalidatePath(`/students/${studentId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not record attendance." };
  }
}

const csvRowSchema = z.object({
  name: z.string().trim().min(1),
  gradeLevel: z.string().trim().min(1),
  email: z.string().trim().optional(),
});

export async function bulkAddStudents(csvText: string): Promise<ActionResult & { count?: number }> {
  try {
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return { ok: false, error: "Paste at least one row: Name, Grade Level, Email (optional)." };

    // Skip an optional header row.
    const first = lines[0].toLowerCase();
    const rows = first.startsWith("name") ? lines.slice(1) : lines;

    let count = 0;
    for (const line of rows) {
      const cols = line.split(",").map((c) => c.trim());
      const parsed = csvRowSchema.safeParse({ name: cols[0], gradeLevel: cols[1], email: cols[2] ?? "" });
      if (!parsed.success) continue;
      await prisma.student.create({
        data: { name: parsed.data.name, gradeLevel: parsed.data.gradeLevel, email: parsed.data.email || null },
      });
      count++;
    }

    if (count > 0) await logActivity("Bulk added students", `${count} student${count === 1 ? "" : "s"}`);
    revalidatePath("/students");
    revalidatePath("/settings");
    revalidatePath("/");
    return { ok: true, count };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not import students." };
  }
}
