/**
 * Publication Card Skeleton Loader
 * Loading placeholder for publication cards while data is being fetched
 */

import Card from './Card';

export default function PublicationCardSkeleton() {
  return (
    <Card variant="elevated" className="animate-pulse w-full flex flex-col">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-200 rounded-t-xl flex-shrink-0" />

      {/* Content placeholder */}
      <Card.Body className="p-5 flex-1 flex flex-col">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 rounded mb-3 w-4/5" />

        {/* Authors skeleton */}
        <div className="h-3 bg-gray-100 rounded mb-2 w-3/5" />

        {/* Date & type skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>

        {/* Abstract lines skeleton */}
        <div className="h-3 bg-gray-100 rounded mb-2" />
        <div className="h-3 bg-gray-100 rounded mb-2 w-5/6" />
        <div className="h-3 bg-gray-100 rounded mb-4 w-4/6" />

        {/* Topics skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-24" />
        </div>

        {/* Meta info skeleton */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="space-y-2 mb-3">
            <div className="h-3 bg-gray-100 rounded w-32" />
            <div className="flex justify-between">
              <div className="h-3 bg-gray-100 rounded w-16" />
              <div className="h-3 bg-gray-100 rounded w-16" />
              <div className="h-3 bg-gray-100 rounded w-16" />
            </div>
          </div>

          {/* Button skeleton */}
          <div className="h-10 bg-gray-200 rounded-xl w-full" />
        </div>
      </Card.Body>
    </Card>
  );
}
