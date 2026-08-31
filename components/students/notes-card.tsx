"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { NotebookPen, Save } from "lucide-react";
import { updateStudentNotes } from "@/lib/actions/students";

export function NotesCard({ studentId, initialNotes }: { studentId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [pending, startTransition] = useTransition();
  const dirty = notes !== initialNotes;

  function save() {
    startTransition(async () => {
      const result = await updateStudentNotes(studentId, notes);
      if (result.ok) toast.success("Notes saved");
      else toast.error(result.error);
    });
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <NotebookPen className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
        <h2 className="font-heading text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
          Teacher notes
        </h2>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        placeholder="Private observations — strengths, accommodations, things to follow up on…"
        className="input resize-none"
      />
      <div className="mt-2 flex justify-end">
        <button type="button" onClick={save} disabled={!dirty || pending} className="btn-secondary">
          <Save className="h-3.5 w-3.5" /> {pending ? "Saving…" : "Save notes"}
        </button>
      </div>
    </div>
  );
}
