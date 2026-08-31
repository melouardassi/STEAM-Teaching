"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import type { ActionResult } from "@/lib/actions/tasks";

export function CsvImportCard({
  title,
  description,
  placeholder,
  action,
}: {
  title: string;
  description: string;
  placeholder: string;
  action: (csvText: string) => Promise<ActionResult & { count?: number }>;
}) {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function handleImport() {
    startTransition(async () => {
      const result = await action(text);
      if (result.ok) {
        toast.success(`Imported ${result.count ?? 0} row${result.count === 1 ? "" : "s"}`);
        setText("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="card p-4 sm:p-5">
      <h2 className="font-heading text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
        {title}
      </h2>
      <p className="mt-0.5 text-xs" style={{ color: "var(--color-ink-muted)" }}>
        {description}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="input mt-3 resize-none font-mono text-xs"
        placeholder={placeholder}
      />
      <div className="mt-2 flex justify-end">
        <button type="button" onClick={handleImport} disabled={pending || !text.trim()} className="btn-secondary">
          <Upload className="h-3.5 w-3.5" /> {pending ? "Importing…" : "Import"}
        </button>
      </div>
    </div>
  );
}
