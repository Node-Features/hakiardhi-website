/**
 * Skeleton Loader Components
 *
 * Loading state components for better perceived performance
 */

export function HeroSkeleton() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 animate-pulse"></div>
      <div className="relative z-10 container mx-auto px-6 lg:px-8 h-full flex items-center justify-center">
        <div className="max-w-4xl w-full text-center space-y-6">
          <div className="h-16 bg-gray-700 rounded-lg animate-pulse mx-auto max-w-2xl"></div>
          <div className="h-8 bg-gray-700 rounded-lg animate-pulse mx-auto max-w-xl"></div>
          <div className="flex gap-4 justify-center">
            <div className="h-14 w-40 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="h-14 w-40 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionSkeleton() {
  return (
    <section className="hakiardhi-section bg-white">
      <div className="hakiardhi-container">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="h-1 w-16 bg-gray-200 rounded-full mb-4 mx-auto animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded-lg mb-5 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse max-w-2xl mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CardSkeleton() {
  return (
    <div className="card-hakiardhi animate-pulse">
      <div className="w-14 h-14 bg-gray-200 rounded-xl mb-5"></div>
      <div className="h-6 bg-gray-200 rounded mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="card-hakiardhi animate-pulse">
      <div className="inline-flex p-4 rounded-xl bg-gray-200 mb-5">
        <div className="w-7 h-7"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="mt-4 h-1 bg-gray-200 rounded-full"></div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-lg">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-10 lg:px-16 py-4 lg:py-5">
        <div className="w-40 h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="hidden lg:flex items-center gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
          ))}
          <div className="w-32 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="lg:hidden w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
      </nav>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </header>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8">
          <div className="h-4 bg-gray-700 rounded w-48 animate-pulse mx-auto"></div>
        </div>
      </div>
    </footer>
  );
}
