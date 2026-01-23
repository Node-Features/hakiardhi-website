/**
 * News Card Skeleton Loader
 *
 * Loading state component for news cards
 */

export function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-200"></div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Category */}
        <div className="h-3 bg-gray-200 rounded w-20"></div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Meta info */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        {/* Button */}
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function FeaturedNewsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-56 bg-gray-200 relative">
        {/* Badges */}
        <div className="absolute top-4 left-4">
          <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
        </div>
        <div className="absolute top-4 right-4">
          <div className="h-6 w-12 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Category */}
        <div className="h-3 bg-gray-200 rounded w-20"></div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-28"></div>
        </div>

        {/* Button */}
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function NewsGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <NewsCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function FeaturedNewsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <FeaturedNewsCardSkeleton key={index} />
      ))}
    </div>
  );
}
