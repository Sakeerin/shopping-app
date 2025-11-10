import { Suspense } from 'react';
import Link from 'next/link';
import { getProducts, getCategories } from '@/services/products';
import { ProductGrid } from '@/components/products/product-grid';
import type { ProductFilters } from '@/types/product';

// ============================================================================
// PRODUCT LISTING PAGE (ISR with revalidate: 60)
// ============================================================================

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata = {
  title: 'Products | Shopping App',
  description: 'Browse our collection of quality products',
};

interface SearchParams {
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  sortBy?: string;
  page?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters: ProductFilters = {
    categoryId: searchParams.categoryId,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    search: searchParams.search,
    sortBy: searchParams.sortBy as any,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  };

  const [{ products, pagination }, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
        <p className="mt-2 text-gray-600">
          {filters.search
            ? `Search results for "${filters.search}"`
            : 'Browse our collection of quality products'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4 space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="mb-4 font-semibold text-gray-900">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className={`block rounded px-3 py-2 text-sm transition-colors ${
                      !filters.categoryId
                        ? 'bg-blue-50 font-medium text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/products?categoryId=${category.id}`}
                      className={`block rounded px-3 py-2 text-sm transition-colors ${
                        filters.categoryId === category.id
                          ? 'bg-blue-50 font-medium text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category.name}
                      <span className="ml-2 text-xs text-gray-500">({category.productCount})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 font-semibold text-gray-900">Sort By</h3>
              <select
                defaultValue={filters.sortBy || 'newest'}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('sortBy', e.target.value);
                  window.location.href = url.toString();
                }}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                  <p className="mt-4 text-sm text-gray-600">Loading products...</p>
                </div>
              </div>
            }
          >
            <ProductGrid products={products} emptyMessage="No products found matching your criteria" />
          </Suspense>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {pagination.page > 1 && (
                <Link
                  href={`/products?${new URLSearchParams({ ...searchParams, page: String(pagination.page - 1) }).toString()}`}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}

              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              {pagination.page < pagination.totalPages && (
                <Link
                  href={`/products?${new URLSearchParams({ ...searchParams, page: String(pagination.page + 1) }).toString()}`}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
