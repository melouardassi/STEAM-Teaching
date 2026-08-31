"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard, type ProjectData } from "@/components/projects/project-card";
import { ProjectModal } from "@/components/projects/project-modal";
import { PROJECT_TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ProjectsView({ projects, courses }: { projects: ProjectData[]; courses: { id: string; name: string }[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [usedFilter, setUsedFilter] = useState<"all" | "used" | "unused">("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (usedFilter === "used" && !p.usedDate) return false;
      if (usedFilter === "unused" && p.usedDate) return false;
      return true;
    });
  }, [projects, query, activeTag, usedFilter]);

  return (
    <div>
      <PageHeader
        title="Project Ideas Bank"
        description="A library of STEAM projects to browse, adapt, and assign."
        action={
          <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> New idea
          </button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No project ideas yet — add your first one"
          description="Build a library of STEAM projects you can reuse across semesters."
          action={
            <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> New idea
            </button>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-ink-muted)" }} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ideas…" className="input pl-9" />
              </div>
              <select value={usedFilter} onChange={(e) => setUsedFilter(e.target.value as typeof usedFilter)} className="input sm:w-44">
                <option value="all">All ideas</option>
                <option value="used">Used</option>
                <option value="unused">Not used yet</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className={cn("badge", !activeTag && "ring-1")}
                style={{
                  background: !activeTag ? "var(--color-primary)" : "var(--color-surface-hover)",
                  color: !activeTag ? "white" : "var(--color-ink-muted)",
                }}
              >
                All subjects
              </button>
              {PROJECT_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className="badge"
                  style={{
                    background: activeTag === tag ? "var(--color-primary)" : "var(--color-surface-hover)",
                    color: activeTag === tag ? "white" : "var(--color-ink-muted)",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="No ideas match" description="Try a different search or subject filter." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProjectCard key={p.id} project={p} courses={courses} />
              ))}
            </div>
          )}
        </>
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={{ title: "", description: "", tags: [], gradeLevel: "", duration: "", materials: "", objectives: "" }}
      />
    </div>
  );
}
