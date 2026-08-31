import { SkeletonHeader, SkeletonTable, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div className="mb-4 flex gap-3">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      <SkeletonTable rows={8} />
    </div>
  );
}
