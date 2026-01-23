/**
 * Team Member Skeleton Loader
 *
 * Loading state component for team member cards
 */

export function TeamMemberSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-gray-200" />
      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}

export function TeamGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <TeamMemberSkeleton key={index} />
      ))}
    </div>
  );
}

export function TeamSectionSkeleton() {
  return (
    <div className="space-y-12">
      {/* Leadership Section */}
      <div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
        <TeamGridSkeleton count={3} />
      </div>

      {/* Staff Section */}
      <div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
        <TeamGridSkeleton count={6} />
      </div>
    </div>
  );
}
