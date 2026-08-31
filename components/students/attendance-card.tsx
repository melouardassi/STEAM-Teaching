"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CalendarCheck2 } from "lucide-react";
import { recordAttendance } from "@/lib/actions/students";
import { cn } from "@/lib/utils";
import { AttendanceStatus } from "@prisma/client";

export function AttendanceCard({
  studentId,
  present,
  absent,
  late,
}: {
  studentId: string;
  present: number;
  absent: number;
  late: number;
}) {
  const [pending, startTransition] = useTransition();

  function log(status: AttendanceStatus) {
    startTransition(async () => {
      const result = await recordAttendance(studentId, null, status);
      if (result.ok) toast.success(`Marked ${status.toLowerCase()} for today`);
      else toast.error(result.error);
    });
  }

  const stats = [
    { label: "Present", value: present, color: "var(--color-success)" },
    { label: "Late", value: late, color: "#F59E0B" },
    { label: "Absent", value: absent, color: "var(--color-danger)" },
  ];

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <CalendarCheck2 className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
        <h2 className="font-heading text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
          Attendance
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg py-2" style={{ background: "var(--color-bg)" }}>
            <p className="font-heading text-xl font-semibold" style={{ color: s.color }}>
              {s.value}
            </p>
            <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 mb-1.5 text-xs font-medium" style={{ color: "var(--color-ink-muted)" }}>
        Log today
      </p>
      <div className="flex gap-2">
        {(["PRESENT", "LATE", "ABSENT"] as const).map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => log(s)}
            className={cn("btn-secondary flex-1 !px-2 text-xs")}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
