import { cn } from '../../lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200/80', className)} aria-hidden="true" />
}

export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn('h-3.5', className)} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-2/5" />
          <SkeletonText className="w-3/5" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonText className="w-4/5" />
        <SkeletonText className="w-3/5" />
        <SkeletonText className="w-2/5" />
      </div>
    </div>
  )
}

export function SkeletonGrid() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
          <SkeletonText className="w-1/3" />
          <Skeleton className="mt-2 h-7 w-12" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonDetails() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-1/2" />
          <SkeletonText className="w-1/3" />
        </div>
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}