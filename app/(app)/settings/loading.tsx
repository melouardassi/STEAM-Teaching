import { SkeletonHeader, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
