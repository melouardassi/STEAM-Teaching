import { SkeletonHeader, SkeletonKanban } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonKanban />
    </div>
  );
}
