export function GradesPageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 w-full rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
