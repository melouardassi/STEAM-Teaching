"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { WeeklyView } from "@/components/schedule/weekly-view";
import { MonthlyView } from "@/components/schedule/monthly-view";

type CourseOption = { id: string; name: string; color: string };
type Block = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
  course: { id: string; name: string; gradeLevel: string; color: string };
};
type CalendarEvent = { id: string; title: string; date: Date; endDate: Date | null; type: string; description: string };

export function ScheduleTabs({
  blocks,
  courses,
  events,
  defaultSemester,
}: {
  blocks: Block[];
  courses: CourseOption[];
  events: CalendarEvent[];
  defaultSemester: string;
}) {
  const [view, setView] = useState<"week" | "month">("week");

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-lg p-1" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        {(["week", "month"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn("rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors")}
            style={
              view === v
                ? { background: "var(--color-primary)", color: "white" }
                : { color: "var(--color-ink-muted)" }
            }
          >
            {v}ly
          </button>
        ))}
      </div>

      {view === "week" ? (
        <WeeklyView blocks={blocks} courses={courses} defaultSemester={defaultSemester} />
      ) : (
        <MonthlyView events={events} blocks={blocks} />
      )}
    </div>
  );
}
