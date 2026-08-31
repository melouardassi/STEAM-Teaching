"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, Save } from "lucide-react";
import { upsertGrade, bulkSaveGrades } from "@/lib/actions/assignments";
import { round1 } from "@/lib/utils";
import { BulkImportModal } from "@/components/assignments/bulk-import-modal";

export type GradeRow = { studentId: string; name: string; score: number | null; feedback: string };

export function GradeTable({ assignmentId, maxPoints, rows }: { assignmentId: string; maxPoints: number; rows: GradeRow[] }) {
  const [values, setValues] = useState<Record<string, { score: string; feedback: string }>>(() =>
    Object.fromEntries(rows.map((r) => [r.studentId, { score: r.score === null ? "" : String(r.score), feedback: r.feedback }]))
  );
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingAll, startSaveAll] = useTransition();
  const [importOpen, setImportOpen] = useState(false);

  function setField(studentId: string, field: "score" | "feedback", value: string) {
    setValues((v) => ({ ...v, [studentId]: { ...v[studentId], [field]: value } }));
    setDirty((d) => new Set(d).add(studentId));
  }

  async function saveRow(studentId: string) {
    const v = values[studentId];
    const score = v.score.trim() === "" ? null : Number(v.score);
    if (score !== null && Number.isNaN(score)) {
      toast.error("Score must be a number");
      return;
    }
    setSavingId(studentId);
    const result = await upsertGrade(studentId, assignmentId, score, v.feedback);
    setSavingId(null);
    if (result.ok) {
      setDirty((d) => {
        const next = new Set(d);
        next.delete(studentId);
        return next;
      });
    } else {
      toast.error(result.error);
    }
  }

  function saveAll() {
    startSaveAll(async () => {
      const payload = Object.entries(values).map(([studentId, v]) => ({
        studentId,
        score: v.score.trim() === "" ? null : Number(v.score),
        feedback: v.feedback,
      }));
      const invalid = payload.some((p) => p.score !== null && Number.isNaN(p.score));
      if (invalid) {
        toast.error("One or more scores are not valid numbers.");
        return;
      }
      const result = await bulkSaveGrades(assignmentId, payload);
      if (result.ok) {
        toast.success("All grades saved");
        setDirty(new Set());
      } else {
        toast.error(result.error);
      }
    });
  }

  const stats = useMemo(() => {
    const scores = Object.values(values)
      .map((v) => (v.score.trim() === "" ? null : Number(v.score)))
      .filter((s): s is number => s !== null && !Number.isNaN(s));
    if (scores.length === 0) return { avg: null, gradedCount: 0 };
    const avgPct = scores.reduce((a, b) => a + (b / maxPoints) * 100, 0) / scores.length;
    return { avg: avgPct, gradedCount: scores.length };
  }, [values, maxPoints]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm" style={{ color: "var(--color-ink-muted)" }}>
          <span>
            <strong style={{ color: "var(--color-ink)" }}>{stats.gradedCount}</strong>/{rows.length} graded
          </span>
          {stats.avg !== null && (
            <span>
              Class average: <strong style={{ color: "var(--color-ink)" }}>{round1(stats.avg)}%</strong>
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setImportOpen(true)} className="btn-secondary">
            <Upload className="h-4 w-4" /> Bulk import
          </button>
          <button type="button" onClick={saveAll} disabled={savingAll || dirty.size === 0} className="btn-primary">
            <Save className="h-4 w-4" /> {savingAll ? "Saving…" : "Save all"}
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-ink-muted)" }}>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Score (/{maxPoints})</th>
              <th className="px-4 py-3 font-medium">%</th>
              <th className="px-4 py-3 font-medium">Feedback</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const v = values[r.studentId];
              const numeric = v.score.trim() === "" ? null : Number(v.score);
              const pct = numeric !== null && !Number.isNaN(numeric) ? round1((numeric / maxPoints) * 100) : null;
              const isDirty = dirty.has(r.studentId);
              return (
                <tr key={r.studentId} className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                  <td className="px-4 py-2 font-medium" style={{ color: "var(--color-ink)" }}>
                    {r.name}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      max={maxPoints}
                      step="0.5"
                      value={v.score}
                      onChange={(e) => setField(r.studentId, "score", e.target.value)}
                      onBlur={() => isDirty && saveRow(r.studentId)}
                      className="input w-24"
                      placeholder="—"
                    />
                  </td>
                  <td className="px-4 py-2" style={{ color: "var(--color-ink-muted)" }}>
                    {pct !== null ? `${pct}%` : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={v.feedback}
                      onChange={(e) => setField(r.studentId, "feedback", e.target.value)}
                      onBlur={() => isDirty && saveRow(r.studentId)}
                      className="input"
                      placeholder="Optional feedback"
                    />
                  </td>
                  <td className="px-4 py-2 text-right text-xs" style={{ color: "var(--color-ink-muted)" }}>
                    {savingId === r.studentId ? "Saving…" : isDirty ? "Unsaved" : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <BulkImportModal open={importOpen} onClose={() => setImportOpen(false)} assignmentId={assignmentId} />
    </div>
  );
}
