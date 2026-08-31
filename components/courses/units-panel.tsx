"use client";

import { useState } from "react";
import { Plus, Layers } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { UnitSection } from "@/components/courses/unit-section";
import { UnitModal, type UnitDraft } from "@/components/courses/unit-modal";

type Lesson = { id: string; title: string; status: string; content: string; order: number };
type Unit = { id: string; name: string; description: string; lessons: Lesson[] };

export function UnitsPanel({ units, courseId }: { units: Unit[]; courseId: string }) {
  const [open, setOpen] = useState(false);
  const draft: UnitDraft = { courseId, name: "", description: "" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
          Course outline
        </h2>
        <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
          <Plus className="h-4 w-4" /> Add unit
        </button>
      </div>

      {units.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No units yet — add your first one"
          description="Break the course into units, then add lessons inside each."
          action={
            <button type="button" onClick={() => setOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Add unit
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {units.map((u) => (
            <UnitSection key={u.id} unit={u} courseId={courseId} />
          ))}
        </div>
      )}

      <UnitModal open={open} onClose={() => setOpen(false)} initial={draft} />
    </div>
  );
}
