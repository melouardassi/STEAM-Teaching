import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [dbUser, courses] = await Promise.all([
    getCurrentUser(),
    prisma.course.findMany({ select: { id: true, name: true, color: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <AppShell userName={dbUser?.name ?? "Teacher"} schoolName={dbUser?.schoolName ?? "STEAM Hub"} courses={courses}>
      {children}
    </AppShell>
  );
}
