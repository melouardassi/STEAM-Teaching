"use client";

import { Filter } from "lucide-react";
import { TASK_PRIORITIES } from "@/lib/constants";

export type Filters = {
  priority: string;
  courseId: string;
  dueRange: "all" | "overdue" | "week" | "month";
};

export function TaskFilters({
  filters,
  onChange,
  courses,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  courses: { id: string; name: string }[];
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--color-ink-muted)" }}>
        <Filter className="h-3.5 w-3.5" /> Filter:
      </span>
      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className="input w-auto py-1.5 text-xs"
      >
        <option value="All">All priorities</option>
        {TASK_PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p.charAt(0) + p.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      <select
        value={filters.courseId}
        onChange={(e) => onChange({ ...filters, courseId: e.target.value })}
        className="input w-auto py-1.5 text-xs"
      >
        <option value="All">All courses</option>
        <option value="none">No course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        value={filters.dueRange}
        onChange={(e) => onChange({ ...filters, dueRange: e.target.value as Filters["dueRange"] })}
        className="input w-auto py-1.5 text-xs"
      >
        <option value="all">Any due date</option>
        <option value="overdue">Overdue</option>
        <option value="week">Due this week</option>
        <option value="month">Due this month</option>
      </select>
      {(filters.priority !== "All" || filters.courseId !== "All" || filters.dueRange !== "all") && (
        <button
          type="button"
          onClick={() => onChange({ priority: "All", courseId: "All", dueRange: "all" })}
          className="text-xs font-medium underline"
          style={{ color: "var(--color-primary)" }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
