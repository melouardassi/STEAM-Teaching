"use client";

import { useMemo, useState, useTransition } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EventTypeBadge, CourseDot } from "@/components/badges";
import { EventModal } from "@/components/schedule/event-modal";
import { deleteCalendarEvent } from "@/lib/actions/schedule";
import { DAY_NAMES_SHORT } from "@/lib/constants";

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  endDate: Date | null;
  type: string;
  description: string;
};
type Block = { dayOfWeek: number; course: { name: string; color: string } };

export function MonthlyView({ events, blocks }: { events: CalendarEvent[]; blocks: Block[] }) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [, startDelete] = useTransition();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  function eventsOn(day: Date) {
    return events.filter((e) => {
      const start = e.date;
      const end = e.endDate ?? e.date;
      return day >= stripTime(start) && day <= stripTime(end);
    });
  }

  function coursesOn(day: Date) {
    const dow = day.getDay();
    const seen = new Map<string, string>();
    for (const b of blocks) {
      if (b.dayOfWeek === dow) seen.set(b.course.name, b.course.color);
    }
    return Array.from(seen.entries());
  }

  const selectedEvents = selected ? eventsOn(selected) : [];

  function handleDeleteEvent(id: string) {
    startDelete(async () => {
      const result = await deleteCalendarEvent(id);
      if (result.ok) toast.success("Event removed");
      else toast.error(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setCursor((c) => subMonths(c, 1))} className="btn-secondary !px-2.5">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-heading w-40 text-center text-base font-semibold" style={{ color: "var(--color-ink)" }}>
            {format(cursor, "MMMM yyyy")}
          </h2>
          <button type="button" onClick={() => setCursor((c) => addMonths(c, 1))} className="btn-secondary !px-2.5">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add event
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="grid grid-cols-7 border-b text-center text-xs font-medium" style={{ borderColor: "var(--color-border)", color: "var(--color-ink-muted)" }}>
          {DAY_NAMES_SHORT.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const inMonth = isSameMonth(day, cursor);
            const dayEvents = eventsOn(day);
            const dayCourses = coursesOn(day);
            const isSelected = selected && isSameDay(day, selected);
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelected(day)}
                className={cn(
                  "flex min-h-[92px] flex-col items-start gap-1 border-b border-r p-1.5 text-left transition-colors sm:p-2",
                  !inMonth && "opacity-40",
                  isSelected && "bg-[var(--color-surface-hover)]"
                )}
                style={{ borderColor: "var(--color-border)" }}
              >
                <span
                  className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium")}
                  style={
                    isToday(day)
                      ? { background: "var(--color-primary)", color: "white" }
                      : { color: "var(--color-ink)" }
                  }
                >
                  {format(day, "d")}
                </span>
                <div className="flex w-full flex-col gap-0.5">
                  {dayEvents.slice(0, 2).map((e) => (
                    <span
                      key={e.id}
                      className="truncate rounded px-1 py-0.5 text-[10px] font-medium"
                      style={{ background: "var(--color-surface-hover)", color: "var(--color-ink)" }}
                    >
                      {e.title}
                    </span>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[10px]" style={{ color: "var(--color-ink-muted)" }}>
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                  {dayCourses.length > 0 && (
                    <div className="mt-0.5 flex flex-wrap gap-0.5">
                      {dayCourses.map(([name, color]) => (
                        <span key={name} title={name}>
                          <CourseDot color={color} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
              {format(selected, "EEEE, MMMM d")}
            </h3>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              No events on this day.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 rounded-lg p-2" style={{ background: "var(--color-bg)" }}>
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <EventTypeBadge type={e.type} />
                      <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                        {e.title}
                      </span>
                    </div>
                    {e.description && (
                      <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
                        {e.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(e.id)}
                    className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{ color: "var(--color-danger)" }}
                    aria-label="Delete event"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selected ? format(selected, "yyyy-MM-dd") : undefined}
      />
    </div>
  );
}

function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
