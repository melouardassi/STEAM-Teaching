import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { formatTime, cn } from "@/lib/utils";

type Block = {
  id: string;
  startTime: string;
  endTime: string;
  room: string;
  course: { name: string; gradeLevel: string; color: string };
};

export function TodaySchedule({ blocks }: { blocks: Block[] }) {
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  if (blocks.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No classes today"
        description="Enjoy the free block, or head to Schedule to plan ahead."
        action={
          <Link href="/schedule" className="btn-secondary">
            Open schedule
          </Link>
        }
      />
    );
  }

  return (
    <div className="card divide-y" style={{ borderColor: "var(--color-border)" }}>
      {blocks.map((b) => {
        const isNow = nowMinutes >= toMinutes(b.startTime) && nowMinutes < toMinutes(b.endTime);
        return (
          <div
            key={b.id}
            className={cn("flex items-center gap-4 px-4 py-3.5 sm:px-5", isNow && "bg-[var(--color-surface-hover)]")}
          >
            <div className="w-20 shrink-0 text-xs font-medium sm:text-sm" style={{ color: "var(--color-ink-muted)" }}>
              {formatTime(b.startTime)}
            </div>
            <span
              className="h-8 w-1 shrink-0 rounded-full"
              style={{ background: b.course.color }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                {b.course.name}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: "var(--color-ink-muted)" }}>
                <span>{b.course.gradeLevel}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {b.room || "TBD"}
                </span>
              </div>
            </div>
            {isNow && (
              <span className="badge shrink-0" style={{ background: "var(--color-primary)", color: "white" }}>
                Now
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
