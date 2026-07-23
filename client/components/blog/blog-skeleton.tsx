import { Skeleton } from "@/components/ui/skeleton";

export function BlogCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <Skeleton className="h-3 w-24 bg-muted" />
      <Skeleton className="h-6 w-full bg-muted" />
      <Skeleton className="h-4 w-full bg-muted" />
      <Skeleton className="h-4 w-4/5 bg-muted" />
    </div>
  );
}

export function BlogListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  );
}
