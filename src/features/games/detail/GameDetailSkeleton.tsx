import { Skeleton } from '@/shared/components/ui/skeleton';

export default function GameDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="hidden md:block h-6 w-px bg-border" />
            <Skeleton className="h-6 w-48 md:w-64" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Tabs */}
        <Skeleton className="h-9 w-full rounded-lg mb-6" />

        {/* Game Overview Card */}
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-lg flex-shrink-0 self-center md:self-start" />
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-7 w-48 md:w-72" />
                  <Skeleton className="h-4 w-64 md:w-96" />
                  <Skeleton className="h-4 w-48 md:w-80" />
                </div>
                <Skeleton className="h-7 w-16 rounded-full hidden md:block" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop preview cards */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
