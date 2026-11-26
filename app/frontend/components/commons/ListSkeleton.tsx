import { cn } from "cn";

import { Skeleton } from "@/components/ui/skeleton";

type ListSkeletonProps = { rows?: number; className?: string };

// Holds a list's place while it loads. It fades in late, so a quick load doesn't flash it.
const ListSkeleton = ({ rows = 4, className }: ListSkeletonProps) => (
  <div
    aria-hidden
    className={cn("grid animate-in gap-3 py-2 delay-200 fill-mode-backwards fade-in", className)}
    data-testid="list-skeleton"
  >
    {Array.from({ length: rows }, (_, index) => (
      <Skeleton key={index} className={cn("h-5", index % 2 === 0 ? "w-4/5" : "w-3/5")} />
    ))}
  </div>
);

export default ListSkeleton;
