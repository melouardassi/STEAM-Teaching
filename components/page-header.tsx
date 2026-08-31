export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl" style={{ color: "var(--color-ink)" }}>
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
