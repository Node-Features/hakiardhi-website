/**
 * Impact Stat Skeleton Loader
 *
 * Loading state component for impact statistics cards
 */

export function ImpactStatSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 animate-pulse">
      {/* Icon placeholder */}
      <div className="mb-4 flex justify-center">
        <div className="w-14 h-14 rounded-full bg-gray-200"></div>
      </div>

      {/* Number placeholder */}
      <div className="flex justify-center mb-2">
        <div className="h-10 bg-gray-200 rounded w-20"></div>
      </div>

      {/* Label placeholder */}
      <div className="flex justify-center">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
}

export function ImpactStatsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ImpactStatSkeleton key={index} />
      ))}
    </div>
  );
}
