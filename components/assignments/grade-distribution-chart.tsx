"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { EmptyState } from "@/components/empty-state";
import { BarChart3 } from "lucide-react";

const BUCKETS = [
  { label: "0–59", min: 0, max: 59 },
  { label: "60–69", min: 60, max: 69 },
  { label: "70–79", min: 70, max: 79 },
  { label: "80–89", min: 80, max: 89 },
  { label: "90–100", min: 90, max: 100 },
];

export function GradeDistributionChart({ percentages }: { percentages: number[] }) {
  if (percentages.length === 0) {
    return <EmptyState icon={BarChart3} title="No scores yet" description="The distribution chart fills in once grades are entered." />;
  }

  const data = BUCKETS.map((b) => ({
    label: b.label,
    count: percentages.filter((p) => p >= b.min && p <= b.max).length,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
            tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "var(--color-surface-hover)" }}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              color: "var(--color-ink)",
              fontSize: 12,
            }}
            formatter={(value) => [`${value} student${value === 1 ? "" : "s"}`, "Count"]}
          />
          <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={48}>
            <LabelList dataKey="count" position="top" style={{ fill: "var(--color-ink-muted)", fontSize: 12 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
