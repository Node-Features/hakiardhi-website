/**
 * Testimonial Card Skeleton Loader
 *
 * Loading state component for testimonial cards
 */

export function TestimonialCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 animate-pulse">
      {/* Image placeholder */}
      <div className="relative h-64 bg-gray-200">
        {/* Program badge placeholder */}
        <div className="absolute top-4 left-4">
          <div className="h-6 w-24 bg-gray-300 rounded-full"></div>
        </div>
        {/* Quote icon placeholder */}
        <div className="absolute bottom-4 right-4">
          <div className="w-12 h-12 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Quote placeholder */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Author section */}
        <div className="flex items-center gap-4 pt-2">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>

          {/* Author info */}
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <TestimonialCardSkeleton key={index} />
      ))}
    </div>
  );
}
