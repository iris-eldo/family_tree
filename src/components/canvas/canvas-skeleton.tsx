export function CanvasSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-6 opacity-40">
        {/* Simulated three-node skeleton */}
        <div className="flex items-center gap-12">
          <div className="h-14 w-28 animate-pulse rounded-lg bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-7 w-7 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-14 w-28 animate-pulse rounded-lg bg-zinc-300 dark:bg-zinc-700" />
        </div>
        <div className="h-4 w-0.5 animate-pulse bg-zinc-300 dark:bg-zinc-700" />
        <div className="h-14 w-28 animate-pulse rounded-lg bg-zinc-300 dark:bg-zinc-700" />
      </div>
    </div>
  );
}
