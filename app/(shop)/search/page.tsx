import { searchProducts } from '@/services/products';
import { SearchResults } from '@/components/products/search-results';
import { ProductSearch } from '@/components/products/product-search';
import Link from 'next/link';

// ============================================================================
// T137: SEARCH RESULTS PAGE (Phase 6 - User Story 3)
// ============================================================================

export const metadata = {
  title: 'Search Products | Shopping App',
  description: 'Search for products in our catalog',
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 20;

  // Fetch search results
  const results = query
    ? await searchProducts(query, { page, limit })
    : { products: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Search</h1>
            <p className="mt-2 text-gray-600">
              Find the products you're looking for
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Browse All Products
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mt-6 max-w-2xl">
          <ProductSearch />
        </div>
      </div>

      {/* Search Results or Empty State */}
      {query ? (
        <>
          <SearchResults
            products={results.products}
            query={query}
            totalResults={results.pagination.total}
          />

          {/* Pagination */}
          {results.pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {/* Previous Button */}
              {page > 1 && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}

              {/* Page Numbers */}
              {[...Array(results.pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isCurrentPage = pageNum === page;
                const shouldShow =
                  pageNum === 1 ||
                  pageNum === results.pagination.totalPages ||
                  Math.abs(pageNum - page) <= 2;

                if (!shouldShow) {
                  if (pageNum === page - 3 || pageNum === page + 3) {
                    return (
                      <span key={pageNum} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <Link
                    key={pageNum}
                    href={`/search?q=${encodeURIComponent(query)}&page=${pageNum}`}
                    className={`rounded-md px-4 py-2 text-sm font-medium ${
                      isCurrentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {/* Next Button */}
              {page < results.pagination.totalPages && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
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
            Start searching for products
          </h2>
          <p className="mt-2 text-gray-600">
            Enter a search term above to find products
          </p>
        </div>
      )}
    </div>
  );
}
