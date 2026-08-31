"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarRange, Save, Plus, Trash2 } from "lucide-react";
import { updateSemesterDates } from "@/lib/actions/settings";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/actions/schedule";
import { formatDate } from "@/lib/utils";

type BreakEvent = { id: string; title: string; date: Date; endDate: Date | null };

export function SemesterCard({
  semesterStart,
  semesterEnd,
  breaks,
}: {
  semesterStart: string;
  semesterEnd: string;
  breaks: BreakEvent[];
}) {
  const [pending, startTransition] = useTransition();
  const [addingBreak, startAddBreak] = useTransition();
  const [showAddBreak, setShowAddBreak] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateSemesterDates(formData);
      if (result.ok) toast.success("Semester dates saved");
      else toast.error(result.error);
    });
  }

  function handleAddBreak(formData: FormData) {
    formData.set("type", "BREAK");
    startAddBreak(async () => {
      const result = await createCalendarEvent(formData);
      if (result.ok) {
        toast.success("Break added");
        setShowAddBreak(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDeleteBreak(id: string) {
    startAddBreak(async () => {
      const result = await deleteCalendarEvent(id);
      if (result.ok) toast.success("Break removed");
      else toast.error(result.error);
    });
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <CalendarRange className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
        <h2 className="font-heading text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
          Semester dates
        </h2>
      </div>
      <form action={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Start date</label>
            <input name="semesterStart" type="date" defaultValue={semesterStart} className="input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">End date</label>
            <input name="semesterEnd" type="date" defaultValue={semesterEnd} className="input" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={pending} className="btn-primary">
            <Save className="h-3.5 w-3.5" /> {pending ? "Saving…" : "Save dates"}
          </button>
        </div>
      </form>

      <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
            Breaks
          </p>
          <button
            type="button"
            onClick={() => setShowAddBreak((s) => !s)}
            className="inline-flex items-center gap-1 text-xs font-medium"
            style={{ color: "var(--color-primary)" }}
          >
            <Plus className="h-3.5 w-3.5" /> Add break
          </button>
        </div>

        {showAddBreak && (
          <form action={handleAddBreak} className="mb-3 flex flex-wrap items-end gap-2 rounded-lg p-3" style={{ background: "var(--color-bg)" }}>
            <input name="title" required placeholder="e.g. Winter Break" className="input min-w-[140px] flex-1" />
            <input name="date" type="date" required className="input w-auto" />
            <input name="endDate" type="date" className="input w-auto" />
            <button type="submit" disabled={addingBreak} className="btn-secondary">
              Add
            </button>
          </form>
        )}

        {breaks.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--color-ink-muted)" }}>
            No breaks scheduled yet.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {breaks.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs" style={{ background: "var(--color-bg)" }}>
                <span style={{ color: "var(--color-ink)" }}>
                  {b.title} — {formatDate(b.date)}
                  {b.endDate ? ` to ${formatDate(b.endDate)}` : ""}
                </span>
                <button type="button" onClick={() => handleDeleteBreak(b.id)} style={{ color: "var(--color-danger)" }} aria-label={`Remove ${b.title}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
