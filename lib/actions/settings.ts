"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/tasks";

async function currentUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in.");
  return session.user.id;
}

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  schoolName: z.string().trim().min(1, "School name is required").max(200),
});

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const id = await currentUserId();
    const data = profileSchema.parse({ name: formData.get("name"), schoolName: formData.get("schoolName") });
    await prisma.user.update({ where: { id }, data });
    revalidatePath("/settings");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update profile." };
  }
}

const semesterSchema = z
  .object({
    semesterStart: z.string().optional().nullable(),
    semesterEnd: z.string().optional().nullable(),
  })
  .refine((d) => !d.semesterStart || !d.semesterEnd || d.semesterStart <= d.semesterEnd, {
    message: "Semester end must be after the start date.",
  });

export async function updateSemesterDates(formData: FormData): Promise<ActionResult> {
  try {
    const id = await currentUserId();
    const data = semesterSchema.parse({
      semesterStart: formData.get("semesterStart") || null,
      semesterEnd: formData.get("semesterEnd") || null,
    });
    await prisma.user.update({
      where: { id },
      data: {
        semesterStart: data.semesterStart ? new Date(data.semesterStart) : null,
        semesterEnd: data.semesterEnd ? new Date(data.semesterEnd) : null,
      },
    });
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update semester dates." };
  }
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "New passwords don't match.", path: ["confirmPassword"] });

export async function changePassword(formData: FormData): Promise<ActionResult> {
  try {
    const id = await currentUserId();
    const data = passwordSchema.parse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { ok: false, error: "User not found." };

    const valid = await bcrypt.compare(data.currentPassword, user.password);
    if (!valid) return { ok: false, error: "Current password is incorrect." };

    const hash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({ where: { id }, data: { password: hash } });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not change password." };
  }
}

const courseRowSchema = z.object({
  name: z.string().trim().min(1),
  gradeLevel: z.string().trim().min(1),
  color: z.string().trim().optional(),
});

export async function bulkAddCourses(csvText: string): Promise<ActionResult & { count?: number }> {
  try {
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return { ok: false, error: "Paste at least one row: Name, Grade Level, Color (optional)." };

    const first = lines[0].toLowerCase();
    const rows = first.startsWith("name") ? lines.slice(1) : lines;

    let count = 0;
    for (const line of rows) {
      const cols = line.split(",").map((c) => c.trim());
      const parsed = courseRowSchema.safeParse({ name: cols[0], gradeLevel: cols[1], color: cols[2] ?? "" });
      if (!parsed.success) continue;
      const color = parsed.data.color && /^#[0-9a-fA-F]{6}$/.test(parsed.data.color) ? parsed.data.color : "#0000FF";
      await prisma.course.create({ data: { name: parsed.data.name, gradeLevel: parsed.data.gradeLevel, color } });
      count++;
    }

    revalidatePath("/courses");
    revalidatePath("/settings");
    revalidatePath("/");
    return { ok: true, count };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not import courses." };
  }
}
