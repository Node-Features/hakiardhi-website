/**
 * Program Card Skeleton Loader
 *
 * Loading state component for program cards
 */

export function ProgramCardSkeleton() {
  return (
    <div className="rounded-2xl border border-brand-500/20 overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-700"></div>

      {/* Content */}
      <div className="p-6 lg:p-8 bg-black/40 space-y-4">
        {/* Category badge placeholder */}
        <div className="h-6 w-24 bg-gray-700 rounded-full"></div>

        {/* Title placeholder */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-700 rounded w-3/4"></div>
        </div>

        {/* Description placeholder */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>

        {/* Button placeholder */}
        <div className="h-10 bg-gray-700 rounded-lg w-32"></div>
      </div>
    </div>
  );
}

export function ProgramsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ProgramCardSkeleton key={index} />
      ))}
    </div>
  );
}
