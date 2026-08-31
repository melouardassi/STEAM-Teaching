"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { bulkImportGrades } from "@/lib/actions/assignments";

export function BulkImportModal({ open, onClose, assignmentId }: { open: boolean; onClose: () => void; assignmentId: string }) {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ matched: number; unmatched: string[] } | null>(null);

  function handleImport() {
    startTransition(async () => {
      const res = await bulkImportGrades(assignmentId, text);
      if (res.ok) {
        toast.success(`Imported ${res.matched ?? 0} grade${res.matched === 1 ? "" : "s"}`);
        setResult({ matched: res.matched ?? 0, unmatched: res.unmatched ?? [] });
        if ((res.unmatched ?? []).length === 0) {
          setText("");
        }
      } else {
        toast.error(res.error);
      }
    });
  }

  function handleClose() {
    setText("");
    setResult(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Bulk import scores" maxWidth="max-w-lg">
      <div className="space-y-3">
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Paste rows copied from a spreadsheet: <strong>Name</strong>, <strong>Score</strong>, and optionally{" "}
          <strong>Feedback</strong> — one student per line. Names are matched against this course&rsquo;s roster.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="input resize-none font-mono text-xs"
          placeholder={"Maya Chen\t44\nLucas Andersen\t39\tGood start, add more detail"}
        />
        {result && (
          <div className="rounded-lg p-3 text-xs" style={{ background: "var(--color-bg)" }}>
            <p style={{ color: "var(--color-success)" }}>{result.matched} grade{result.matched === 1 ? "" : "s"} imported.</p>
            {result.unmatched.length > 0 && (
              <p className="mt-1" style={{ color: "var(--color-danger)" }}>
                Couldn&rsquo;t match: {result.unmatched.join(", ")}
              </p>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-secondary" onClick={handleClose}>
            Close
          </button>
          <button type="button" onClick={handleImport} disabled={pending || !text.trim()} className="btn-primary">
            {pending ? "Importing…" : "Import"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
