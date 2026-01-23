/**
 * Partner Card Skeleton Loader
 *
 * Loading state component for partner/donor cards
 */

export function PartnerCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
      <div className="flex items-center justify-center h-20">
        <div className="w-full h-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export function PartnersGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <PartnerCardSkeleton key={index} />
      ))}
    </div>
  );
}
