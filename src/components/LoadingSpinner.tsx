interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading…' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-ink-secondary">{message}</p>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-4 items-center px-4 py-3 border-b border-border animate-pulse">
      <div className="w-8 h-8 bg-muted/40 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-muted/40 rounded w-1/3" />
        <div className="h-3 bg-muted/30 rounded w-1/2" />
      </div>
      <div className="h-3 bg-muted/40 rounded w-16" />
      <div className="h-6 bg-muted/30 rounded-badge w-16" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-surface rounded-card shadow-card overflow-hidden">
      {/* Header skeleton */}
      <div className="flex gap-4 px-4 py-3 bg-canvas border-b border-border animate-pulse">
        {[1, 2, 3, 4, 5].map((col) => (
          <div key={col} className="h-3 bg-muted/40 rounded flex-1" />
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  );
}
