import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--color-bg)" }}
      >
        <Icon className="h-6 w-6" style={{ color: "var(--color-primary)" }} />
      </div>
      <div className="space-y-1">
        <p className="font-heading text-base font-semibold" style={{ color: "var(--color-ink)" }}>
          {title}
        </p>
        {description && (
          <p className="max-w-sm text-sm" style={{ color: "var(--color-ink-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
