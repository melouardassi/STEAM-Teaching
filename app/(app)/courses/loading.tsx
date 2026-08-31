import { SkeletonHeader, SkeletonCardsGrid } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonCardsGrid count={6} />
    </div>
  );
}
