// ============================================================================
// T192: CART LOADING STATE (Phase 9 - Performance Optimization)
// ============================================================================

export default function CartLoading() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart items skeleton */}
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-lg border p-4">
              <div className="h-24 w-24 animate-pulse rounded bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary skeleton */}
        <div className="h-64 animate-pulse rounded-lg border bg-gray-200" />
      </div>
    </div>
  );
}
