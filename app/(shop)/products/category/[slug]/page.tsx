import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { filterProducts } from '@/services/products';
import { SearchResults } from '@/components/products/search-results';
import { ProductFilters } from '@/components/products/product-filters';
import { getCategories } from '@/services/products';
import Link from 'next/link';

// ============================================================================
// T138: CATEGORY PAGE WITH ISR (Phase 6 - User Story 3)
// ============================================================================

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour

// Generate static params for known categories
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    return {
      title: 'Category Not Found | Shopping App',
    };
  }

  return {
    title: `${category.name} | Shopping App`,
    description: category.description || `Browse products in the ${category.name} category`,
  };
}

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sortBy?: string;
    page?: string;
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // Fetch category
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    notFound();
  }

  // Parse search params
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  const inStock = searchParams.inStock === 'true';
  const sortBy = (searchParams.sortBy as any) || 'newest';
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 20;

  // Fetch products with filters
  const results = await filterProducts({
    categoryIds: [category.id],
    minPrice,
    maxPrice,
    inStock,
    sortBy,
    page,
    limit,
  });

  // Fetch all categories for filter sidebar
  const allCategories = await getCategories();
  const flatCategories = allCategories.flatMap((cat) => [
    cat,
    ...cat.children.map((child) => ({ ...child, children: [] })),
  ]);

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex text-sm text-gray-500" aria-label="Breadcrumb">
              <Link href="/products" className="hover:text-gray-700">
                Products
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{category.name}</span>
            </nav>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-2 text-gray-600">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4">
            <ProductFilters
              categories={flatCategories}
              onFilterChange={(filters) => {
                // This will be handled client-side in a real implementation
                // For now, filters are passed via searchParams
              }}
              initialFilters={{
                categoryIds: [category.id],
                minPrice,
                maxPrice,
                inStock,
              }}
            />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Sort and Filter Bar */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {results.pagination.total} {results.pagination.total === 1 ? 'product' : 'products'}
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-600">
                Sort by:
              </label>
              <select
                id="sort"
                defaultValue={sortBy}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  params.set('sortBy', e.target.value);
                  window.location.href = `?${params.toString()}`;
                }}
                className="rounded-md border border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Products */}
          {results.products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg"
                  >
                    {/* Product Card (simplified from SearchResults) */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
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
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="mt-auto pt-4 text-lg font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {results.pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`?page=${page - 1}`}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  )}

                  {[...Array(results.pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isCurrentPage = pageNum === page;

                    return (
                      <Link
                        key={pageNum}
                        href={`?page=${pageNum}`}
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

                  {page < results.pagination.totalPages && (
                    <Link
                      href={`?page=${page + 1}`}
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
              <p className="text-gray-600">No products found in this category with the selected filters.</p>
              <Link
                href={`/products/category/${params.slug}`}
                className="mt-4 inline-block text-blue-600 hover:text-blue-700"
              >
                Clear Filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
