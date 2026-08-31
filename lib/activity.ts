import { prisma } from "@/lib/prisma";

export async function logActivity(action: string, details = "") {
  await prisma.activityLog.create({ data: { action, details } });
}
