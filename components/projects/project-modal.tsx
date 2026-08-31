"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { createProjectIdea, updateProjectIdea, deleteProjectIdea } from "@/lib/actions/projects";
import type { ActionResult } from "@/lib/actions/tasks";
import { PROJECT_TAGS } from "@/lib/constants";

export type ProjectDraft = {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  gradeLevel: string;
  duration: string;
  materials: string;
  objectives: string;
};

export function ProjectModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial: ProjectDraft }) {
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const isEdit = !!initial.id;
  const customTags = initial.tags.filter((t) => !(PROJECT_TAGS as readonly string[]).includes(t)).join(", ");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      let result: ActionResult;
      if (isEdit) {
        result = await updateProjectIdea(initial.id!, formData);
      } else {
        result = await createProjectIdea(formData);
      }
      if (result.ok) {
        toast.success(isEdit ? "Project idea updated" : "Project idea added");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!initial.id) return;
    if (!window.confirm(`Delete "${initial.title}"?`)) return;
    startDelete(async () => {
      const result = await deleteProjectIdea(initial.id!);
      if (result.ok) {
        toast.success("Project idea deleted");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit project idea" : "New project idea"} maxWidth="max-w-xl">
      <form action={handleSubmit} className="space-y-4" key={initial.id ?? "new"}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <input name="title" defaultValue={initial.title} required autoFocus className="input" placeholder="e.g. Miniature Sustainable House Model" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" defaultValue={initial.description} rows={3} className="input resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Grade level</label>
            <input name="gradeLevel" defaultValue={initial.gradeLevel} required className="input" placeholder="e.g. Grade 9" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Duration</label>
            <input name="duration" defaultValue={initial.duration} required className="input" placeholder="e.g. 2 weeks" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Subjects</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {PROJECT_TAGS.map((tag) => (
              <label key={tag} className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--color-ink)" }}>
                <input type="checkbox" name="tags" value={tag} defaultChecked={initial.tags.includes(tag)} className="accent-[var(--color-primary)]" />
                {tag}
              </label>
            ))}
          </div>
          <input name="customTags" defaultValue={customTags} className="input mt-1" placeholder="Other tags, comma separated" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Materials needed</label>
          <textarea name="materials" defaultValue={initial.materials} rows={2} className="input resize-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Learning objectives</label>
          <textarea name="objectives" defaultValue={initial.objectives} rows={2} className="input resize-none" />
        </div>

        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button type="button" onClick={handleDelete} disabled={deleting} className="btn-danger">
              {deleting ? "Deleting…" : "Delete"}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add idea"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
