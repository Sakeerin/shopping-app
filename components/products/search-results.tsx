import Link from 'next/link';
import Image from 'next/image';
import type { ProductCardData } from '@/types/product';

// ============================================================================
// T136: SEARCH RESULTS COMPONENT (Phase 6 - User Story 3)
// ============================================================================

interface SearchResultsProps {
  products: ProductCardData[];
  query: string;
  totalResults: number;
  className?: string;
}

export function SearchResults({
  products,
  query,
  totalResults,
  className = '',
}: SearchResultsProps) {
  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          No results found for "{query}"
        </h2>
        <p className="mt-2 text-gray-600">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Results Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Search Results for "{query}"
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {totalResults} {totalResults === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg"
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <svg
                    className="h-16 w-16 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* Featured Badge */}
              {product.isFeatured && (
                <div className="absolute left-2 top-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  Featured
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-1 flex-col p-4">
              {/* Category */}
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {product.categoryName}
              </p>

              {/* Name */}
              <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2">
                {product.name}
              </h3>

              {/* Rating */}
              {product.averageRating !== undefined && (
                <div className="mt-2 flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(product.averageRating!)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    ({product.reviewCount})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mt-auto pt-4">
                <p className="text-lg font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
