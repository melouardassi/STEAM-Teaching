import Link from "next/link";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ProfileCard } from "@/components/settings/profile-card";
import { PasswordCard } from "@/components/settings/password-card";
import { SemesterCard } from "@/components/settings/semester-card";
import { CsvImportCard } from "@/components/settings/csv-import-card";
import { bulkAddStudents } from "@/lib/actions/students";
import { bulkAddCourses } from "@/lib/actions/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user, courseCount, studentCount, breaks] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.course.count(),
    prisma.student.count(),
    prisma.calendarEvent.findMany({ where: { type: "BREAK" }, orderBy: { date: "asc" } }),
  ]);

  if (!user) return null;

  return (
    <div>
      <PageHeader title="Settings" description="Your profile, semester setup, and roster management." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ProfileCard name={user.name} schoolName={user.schoolName} />
          <SemesterCard
            semesterStart={user.semesterStart ? user.semesterStart.toISOString().slice(0, 10) : ""}
            semesterEnd={user.semesterEnd ? user.semesterEnd.toISOString().slice(0, 10) : ""}
            breaks={breaks}
          />
          <PasswordCard />
        </div>

        <div className="space-y-6">
          <div className="card p-4 sm:p-5">
            <h2 className="font-heading text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
              Courses &amp; roster
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href="/courses" className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--color-surface-hover)]" style={{ background: "var(--color-bg)" }}>
                <span className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                  <BookOpen className="h-4 w-4" style={{ color: "var(--color-primary)" }} /> {courseCount} courses
                </span>
                <ArrowRight className="h-3.5 w-3.5" style={{ color: "var(--color-ink-muted)" }} />
              </Link>
              <Link href="/students" className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-[var(--color-surface-hover)]" style={{ background: "var(--color-bg)" }}>
                <span className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                  <Users className="h-4 w-4" style={{ color: "var(--color-primary)" }} /> {studentCount} students
                </span>
                <ArrowRight className="h-3.5 w-3.5" style={{ color: "var(--color-ink-muted)" }} />
              </Link>
            </div>
          </div>

          <CsvImportCard
            title="Bulk add students"
            description="Paste rows as: Name, Grade Level, Email (optional). One student per line."
            placeholder={"Maya Chen, Grade 8, maya.chen@student.edu\nLucas Andersen, Grade 8"}
            action={bulkAddStudents}
          />

          <CsvImportCard
            title="Bulk add courses"
            description="Paste rows as: Name, Grade Level, Color hex (optional). One course per line."
            placeholder={"Digital Fabrication, Grade 9, #0000FF"}
            action={bulkAddCourses}
          />
        </div>
      </div>
    </div>
  );
}
