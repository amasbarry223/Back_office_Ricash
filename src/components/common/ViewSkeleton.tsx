'use client';

export default function ViewSkeleton() {
  return (
    <div className="space-y-4 p-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-muted shimmer" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted shimmer" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-muted shimmer" />
    </div>
  );
}
