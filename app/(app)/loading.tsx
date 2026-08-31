import { Skeleton, SkeletonCardsGrid } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card space-y-3 p-4 sm:p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
      <SkeletonCardsGrid count={2} />
    </div>
  );
}
