import { SkeletonHeader, SkeletonCardsGrid, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>
      <SkeletonCardsGrid count={6} />
    </div>
  );
}
