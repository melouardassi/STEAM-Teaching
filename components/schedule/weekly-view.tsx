"use client";

import { useState } from "react";
import { Plus, MapPin, Pencil } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { DAY_NAMES } from "@/lib/constants";
import { EmptyState } from "@/components/empty-state";
import { CalendarDays } from "lucide-react";
import { ScheduleBlockModal, type BlockDraft } from "@/components/schedule/schedule-block-modal";

type Block = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
  course: { id: string; name: string; gradeLevel: string; color: string };
};

type CourseOption = { id: string; name: string; color: string };

const WEEKDAYS = [1, 2, 3, 4, 5];

export function WeeklyView({ blocks, courses, defaultSemester }: { blocks: Block[]; courses: CourseOption[]; defaultSemester: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<BlockDraft | null>(null);
  const todayDow = new Date().getDay();

  const byDay = new Map<number, Block[]>();
  for (const b of blocks) {
    const list = byDay.get(b.dayOfWeek) ?? [];
    list.push(b);
    byDay.set(b.dayOfWeek, list);
  }
  for (const list of byDay.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime));

  function openCreate(dayOfWeek: number) {
    setDraft({ courseId: courses[0]?.id ?? "", dayOfWeek, startTime: "08:30", endTime: "09:20", room: "", semester: defaultSemester });
    setModalOpen(true);
  }

  function openEdit(b: Block) {
    setDraft({
      id: b.id,
      courseId: b.course.id,
      dayOfWeek: b.dayOfWeek,
      startTime: b.startTime,
      endTime: b.endTime,
      room: b.room,
      semester: b.semester,
    });
    setModalOpen(true);
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Add a course first"
        description="Create a course under Courses before building your weekly schedule."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {WEEKDAYS.map((day) => (
          <div key={day} className="flex flex-col">
            <div
              className="mb-2 flex items-center justify-between rounded-lg px-3 py-2"
              style={{
                background: day === todayDow ? "var(--color-primary)" : "var(--color-surface)",
                color: day === todayDow ? "white" : "var(--color-ink)",
              }}
            >
              <span className="text-sm font-semibold">{DAY_NAMES[day]}</span>
              <button
                type="button"
                onClick={() => openCreate(day)}
                className="rounded-md p-1 transition-colors hover:bg-black/10"
                title={`Add class on ${DAY_NAMES[day]}`}
                aria-label={`Add class on ${DAY_NAMES[day]}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {(byDay.get(day) ?? []).length === 0 && (
                <button
                  type="button"
                  onClick={() => openCreate(day)}
                  className="flex-1 rounded-lg border border-dashed px-3 py-6 text-center text-xs transition-colors hover:bg-[var(--color-surface-hover)]"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink-muted)" }}
                >
                  No classes — click to add
                </button>
              )}
              {(byDay.get(day) ?? []).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => openEdit(b)}
                  className="group card flex flex-col items-start gap-1 p-3 text-left transition-shadow hover:shadow-md"
                  style={{ borderLeft: `3px solid ${b.course.color}` }}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-xs font-medium" style={{ color: "var(--color-ink-muted)" }}>
                      {formatTime(b.startTime)} – {formatTime(b.endTime)}
                    </span>
                    <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                    {b.course.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs" style={{ color: "var(--color-ink-muted)" }}>
                    <span>{b.course.gradeLevel}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {b.room || "TBD"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ScheduleBlockModal open={modalOpen} onClose={() => setModalOpen(false)} courses={courses} initial={draft} />
    </>
  );
}
