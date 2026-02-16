import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-white/5 rounded-md', className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-bg-card border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
      <Skeleton className="w-8 h-4" />
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-16 ml-auto" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}
