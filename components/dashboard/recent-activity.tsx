import { Activity } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

type Entry = { id: string; action: string; details: string; timestamp: Date };

export function RecentActivity({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return <EmptyState icon={Activity} title="No activity yet" description="Actions you take across the app will show up here." />;
  }

  return (
    <div className="card divide-y" style={{ borderColor: "var(--color-border)" }}>
      {entries.map((e) => (
        <div key={e.id} className="flex gap-3 px-4 py-3.5 sm:px-5">
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: "var(--color-primary)" }}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              {e.action}
            </p>
            {e.details && (
              <p className="truncate text-xs" style={{ color: "var(--color-ink-muted)" }}>
                {e.details}
              </p>
            )}
          </div>
          <span className="shrink-0 text-xs" style={{ color: "var(--color-ink-muted)" }}>
            {relativeTime(e.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}

function relativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}
