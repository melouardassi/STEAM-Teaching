"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { createCalendarEvent } from "@/lib/actions/schedule";

const EVENT_TYPES = ["HOLIDAY", "EXAM", "EXHIBITION", "BREAK", "OTHER"] as const;

export function EventModal({ open, onClose, defaultDate }: { open: boolean; onClose: () => void; defaultDate?: string }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createCalendarEvent(formData);
      if (result.ok) {
        toast.success("Event added");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Add calendar event">
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <input name="title" required autoFocus className="input" placeholder="e.g. Fall STEAM Exhibition" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date</label>
            <input name="date" type="date" required defaultValue={defaultDate} className="input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">End date (optional)</label>
            <input name="endDate" type="date" className="input" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Type</label>
          <select name="type" defaultValue="OTHER" className="input">
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" rows={2} className="input resize-none" placeholder="Optional details" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Adding…" : "Add event"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
