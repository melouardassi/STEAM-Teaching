"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { TaskPriority, TaskStatus } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; error: string };

const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).optional().default(""),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  dueDate: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
});

function parseTaskForm(formData: FormData) {
  return taskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    priority: formData.get("priority") || undefined,
    status: formData.get("status") || undefined,
    dueDate: formData.get("dueDate") || null,
    courseId: formData.get("courseId") || null,
  });
}

export async function createTask(formData: FormData): Promise<ActionResult> {
  try {
    const data = parseTaskForm(formData);
    const count = await prisma.task.count({ where: { status: data.status } });
    await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        courseId: data.courseId || null,
        order: count,
      },
    });
    await logActivity("Created task", data.title);
    revalidatePath("/tasks");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create task." };
  }
}

export async function updateTask(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const data = parseTaskForm(formData);
    await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        courseId: data.courseId || null,
      },
    });
    revalidatePath("/tasks");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update task." };
  }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    await prisma.task.delete({ where: { id } });
    revalidatePath("/tasks");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete task." };
  }
}

export async function moveTask(id: string, status: TaskStatus, order: number): Promise<ActionResult> {
  try {
    await prisma.task.update({ where: { id }, data: { status, order } });
    revalidatePath("/tasks");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not move task." };
  }
}

export async function reorderTasks(updates: { id: string; status: TaskStatus; order: number }[]): Promise<ActionResult> {
  try {
    await prisma.$transaction(
      updates.map((u) => prisma.task.update({ where: { id: u.id }, data: { status: u.status, order: u.order } }))
    );
    revalidatePath("/tasks");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not reorder tasks." };
  }
}
