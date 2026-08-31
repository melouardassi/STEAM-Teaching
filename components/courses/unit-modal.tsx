"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { createUnit, updateUnit, deleteUnit } from "@/lib/actions/courses";

export type UnitDraft = { id?: string; courseId: string; name: string; description: string };

export function UnitModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial: UnitDraft | null }) {
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const isEdit = !!initial?.id;

  function handleSubmit(formData: FormData) {
    if (!initial) return;
    startTransition(async () => {
      const result = isEdit
        ? await updateUnit(initial.id!, initial.courseId, formData)
        : await createUnit(initial.courseId, formData);
      if (result.ok) {
        toast.success(isEdit ? "Unit updated" : "Unit added");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (!initial?.id) return;
    if (!window.confirm(`Delete "${initial.name}"? Its lessons will be removed too.`)) return;
    startDelete(async () => {
      const result = await deleteUnit(initial.id!, initial.courseId);
      if (result.ok) {
        toast.success("Unit removed");
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (!initial) return null;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit unit" : "Add unit"}>
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Unit name</label>
          <input name="name" defaultValue={initial.name} required autoFocus className="input" placeholder="e.g. Sustainable Housing Studio" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" defaultValue={initial.description} rows={3} className="input resize-none" placeholder="What does this unit cover?" />
        </div>
        <div className="flex items-center justify-between pt-2">
          {isEdit ? (
            <button type="button" onClick={handleDelete} disabled={deleting} className="btn-danger">
              {deleting ? "Removing…" : "Delete"}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add unit"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
