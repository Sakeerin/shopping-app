import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus, Edit, Trash2, Search } from 'lucide-react';
import { prisma } from '@/lib/db';
import { deleteProduct } from '@/actions/products';

// ============================================================================
// T160: PRODUCT MANAGEMENT PAGE (Phase 7 - User Story 6)
// ============================================================================

export const dynamic = 'force-dynamic';

interface SearchParams {
  search?: string;
  page?: string;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 20;
  const skip = (page - 1) * limit;

  // Build where clause for search
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Fetch products with pagination
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={search}
            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) {
                url.searchParams.set('search', e.target.value);
              } else {
                url.searchParams.delete('search');
              }
              url.searchParams.delete('page');
              window.location.href = url.toString();
            }}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-lg border bg-card">
        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    data-testid="product-row"
                    className="hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {product.images[0] ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p
                            className="font-medium"
                            data-testid="product-name"
                          >
                            {product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {product.category.name}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm ${
                          product.stock === 0
                            ? 'text-red-600'
                            : product.stock < 10
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          data-testid="edit-product"
                          className="rounded p-1 hover:bg-muted"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <form action={deleteProduct.bind(null, product.id)}>
                          <button
                            type="submit"
                            data-testid="delete-product"
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            aria-label={`Delete ${product.name}`}
                            onClick={(e) => {
                              if (
                                !confirm(
                                  'Are you sure you want to delete this product?'
                                )
                              ) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {search
                ? 'Try adjusting your search'
                : 'Get started by creating your first product'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between"
          data-testid="pagination"
        >
          <p className="text-sm text-muted-foreground">
            Showing {skip + 1} to {Math.min(skip + limit, totalCount)} of{' '}
            {totalCount} products
          </p>
          <div className="flex space-x-2">
            {page > 1 && (
              <Link
                href={`/admin/products?${new URLSearchParams({
                  ...(search && { search }),
                  page: (page - 1).toString(),
                })}`}
                className="rounded-lg border bg-background px-3 py-1 text-sm hover:bg-muted"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/products?${new URLSearchParams({
                  ...(search && { search }),
                  page: (page + 1).toString(),
                })}`}
                className="rounded-lg border bg-background px-3 py-1 text-sm hover:bg-muted"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
