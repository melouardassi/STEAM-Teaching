import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [dbUser, courses] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.course.findMany({ select: { id: true, name: true, color: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <AppShell
      userName={dbUser?.name ?? session.user.name ?? "Teacher"}
      schoolName={dbUser?.schoolName ?? "STEAM Hub"}
      courses={courses}
      signOutSlot={<SignOutButton />}
    >
      {children}
    </AppShell>
  );
}
