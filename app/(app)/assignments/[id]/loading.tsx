import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-3 h-4 w-24" />
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Skeleton className="h-80 w-full rounded-lg lg:col-span-2" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
