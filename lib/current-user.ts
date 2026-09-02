import { prisma } from "@/lib/prisma";

// This is a single-user app with no login — every page just operates on
// the one admin/teacher account seeded into the database.
export async function getCurrentUser() {
  return prisma.user.findFirst();
}
