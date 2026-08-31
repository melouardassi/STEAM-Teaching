"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Clock, Layers3, Pencil, CheckCircle2, Sparkles, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ProjectModal, type ProjectDraft } from "@/components/projects/project-modal";
import { CoursePickerModal } from "@/components/projects/course-picker-modal";
import { unmarkProjectUsed } from "@/lib/actions/projects";

export type ProjectData = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  gradeLevel: string;
  duration: string;
  materials: string;
  objectives: string;
  usedDate: Date | null;
  usedCourse: { id: string; name: string } | null;
};

export function ProjectCard({ project, courses }: { project: ProjectData; courses: { id: string; name: string }[] }) {
  const [editOpen, setEditOpen] = useState(false);
  const [useOpen, setUseOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [, startTransition] = useTransition();

  const draft: ProjectDraft = {
    id: project.id,
    title: project.title,
    description: project.description,
    tags: project.tags,
    gradeLevel: project.gradeLevel,
    duration: project.duration,
    materials: project.materials,
    objectives: project.objectives,
  };

  function handleUnmark() {
    startTransition(async () => {
      const result = await unmarkProjectUsed(project.id);
      if (result.ok) toast.success("Marked as not used");
      else toast.error(result.error);
    });
  }

  return (
    <div className="card flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
          {project.title}
        </h3>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-[var(--color-surface-hover)]"
          aria-label={`Edit ${project.title}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="line-clamp-3 text-sm" style={{ color: "var(--color-ink-muted)" }}>
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span key={t} className="badge" style={{ background: "var(--color-surface-hover)", color: "var(--color-primary)" }}>
            {t}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: "var(--color-ink-muted)" }}>
        <span className="inline-flex items-center gap-1">
          <Layers3 className="h-3.5 w-3.5" /> {project.gradeLevel}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {project.duration}
        </span>
      </div>

      {project.usedDate && project.usedCourse ? (
        <div
          className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs"
          style={{ background: "rgba(0,200,83,0.1)", color: "var(--color-success)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Used in {project.usedCourse.name} · {formatDate(project.usedDate)}
          </span>
          <button type="button" onClick={handleUnmark} aria-label="Unmark as used" className="opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="mt-auto flex gap-2 pt-1">
          <button type="button" onClick={() => setUseOpen(true)} className="btn-secondary flex-1 !px-2 text-xs">
            Mark used
          </button>
          <button type="button" onClick={() => setAssignOpen(true)} className="btn-primary flex-1 !px-2 text-xs">
            <Sparkles className="h-3.5 w-3.5" /> Create assignment
          </button>
        </div>
      )}

      <ProjectModal open={editOpen} onClose={() => setEditOpen(false)} initial={draft} />
      <CoursePickerModal open={useOpen} onClose={() => setUseOpen(false)} mode="use" projectId={project.id} projectTitle={project.title} courses={courses} />
      <CoursePickerModal open={assignOpen} onClose={() => setAssignOpen(false)} mode="assignment" projectId={project.id} projectTitle={project.title} courses={courses} />
    </div>
  );
}
