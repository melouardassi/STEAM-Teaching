"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { CalendarEventType } from "@prisma/client";
import type { ActionResult } from "@/lib/actions/tasks";

const blockSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid start time"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid end time"),
  room: z.string().trim().max(100).optional().default(""),
  semester: z.string().trim().min(1).max(100).default("Fall 2026"),
});

function parseBlockForm(formData: FormData) {
  const parsed = blockSchema.parse({
    courseId: formData.get("courseId"),
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    room: formData.get("room") ?? "",
    semester: formData.get("semester") || "Fall 2026",
  });
  if (parsed.endTime <= parsed.startTime) {
    throw new Error("End time must be after start time.");
  }
  return parsed;
}

export async function createScheduleBlock(formData: FormData): Promise<ActionResult> {
  try {
    const data = parseBlockForm(formData);
    await prisma.scheduleBlock.create({ data });
    await logActivity("Added schedule block", `${data.startTime}–${data.endTime}`);
    revalidatePath("/schedule");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not add class session." };
  }
}

export async function updateScheduleBlock(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const data = parseBlockForm(formData);
    await prisma.scheduleBlock.update({ where: { id }, data });
    revalidatePath("/schedule");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update class session." };
  }
}

export async function deleteScheduleBlock(id: string): Promise<ActionResult> {
  try {
    await prisma.scheduleBlock.delete({ where: { id } });
    revalidatePath("/schedule");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete class session." };
  }
}

const eventSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  date: z.string().min(1, "Date is required"),
  endDate: z.string().optional().nullable(),
  type: z.nativeEnum(CalendarEventType).default(CalendarEventType.OTHER),
  description: z.string().trim().max(1000).optional().default(""),
});

export async function createCalendarEvent(formData: FormData): Promise<ActionResult> {
  try {
    const data = eventSchema.parse({
      title: formData.get("title"),
      date: formData.get("date"),
      endDate: formData.get("endDate") || null,
      type: formData.get("type") || undefined,
      description: formData.get("description") ?? "",
    });
    await prisma.calendarEvent.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        type: data.type,
        description: data.description,
      },
    });
    await logActivity("Added calendar event", data.title);
    revalidatePath("/schedule");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not add event." };
  }
}

export async function deleteCalendarEvent(id: string): Promise<ActionResult> {
  try {
    await prisma.calendarEvent.delete({ where: { id } });
    revalidatePath("/schedule");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete event." };
  }
}
