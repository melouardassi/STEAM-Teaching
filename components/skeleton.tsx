import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md", className)} style={{ background: "var(--color-surface-hover)" }} />;
}

export function SkeletonHeader() {
  return (
    <div className="mb-6 flex items-center justify-between sm:mb-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-32 rounded-lg" />
    </div>
  );
}

export function SkeletonCardsGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card space-y-3 p-5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-14 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden p-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0" style={{ borderColor: "var(--color-border)" }}>
          <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonKanban() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      {Array.from({ length: 3 }).map((_, col) => (
        <div key={col} className="flex-1 space-y-2.5">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card space-y-2 p-3.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonCardsGrid />
    </div>
  );
}
