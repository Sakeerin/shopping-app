// ============================================================================
// T192: PRODUCT DETAIL LOADING STATE (Phase 9 - Performance Optimization)
// ============================================================================

export default function ProductDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Breadcrumbs skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        <span>/</span>
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        <span>/</span>
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image skeleton */}
        <div className="aspect-square animate-pulse rounded-lg bg-gray-200" />

        {/* Product info skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
