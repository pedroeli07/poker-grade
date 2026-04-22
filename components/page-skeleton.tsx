import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
interface PageSkeletonProps {
  titleWidth?: string;
  contentHeight?: string;
  className?: string;
}

export function PageSkeleton({
  titleWidth = "w-64",
  contentHeight = "h-64",
  className,
}: PageSkeletonProps) {
  return (
    <div className={cn("animate-pulse space-y-4", className)}>
      <Skeleton className={cn("h-9 rounded-md", titleWidth)} />
      <Skeleton className={cn("rounded-lg", contentHeight)} />
    </div>
  );
}
