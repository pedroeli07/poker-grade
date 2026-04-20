import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardRouteLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48 max-w-full" />
        <Skeleton className="h-4 w-[min(28rem,100%)]" />
      </div>
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
