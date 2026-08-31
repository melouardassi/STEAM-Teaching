import { SkeletonHeader, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div className="card divide-y overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-8 w-1 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
