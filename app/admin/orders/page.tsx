import Link from 'next/link';
import { ShoppingCart, Filter } from 'lucide-react';
import { getAllOrders } from '@/services/analytics';

// ============================================================================
// T163: ORDER MANAGEMENT PAGE (Phase 7 - User Story 6)
// ============================================================================

export const dynamic = 'force-dynamic';

interface SearchParams {
  status?: string;
  search?: string;
  page?: string;
}

const statusOptions = [
  { value: '', label: 'All Orders' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const status = searchParams.status;
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);

  const result = await getAllOrders({
    status: status as any,
    searchQuery: search,
    page,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="mt-2 text-muted-foreground">
          Manage and track customer orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search orders
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search by order number or email..."
            defaultValue={search}
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
        <div className="w-full sm:w-48">
          <label htmlFor="statusFilter" className="sr-only">
            Filter by status
          </label>
          <select
            id="statusFilter"
            name="statusFilter"
            value={status || ''}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) {
                url.searchParams.set('status', e.target.value);
              } else {
                url.searchParams.delete('status');
              }
              url.searchParams.delete('page');
              window.location.href = url.toString();
            }}
            className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border bg-card">
        {result.orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Order Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Total
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
                {result.orders.map((order) => (
                  <tr
                    key={order.id}
                    data-testid="order-row"
                    className="hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        data-testid="order-status"
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No orders found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {search || status
                ? 'Try adjusting your filters'
                : 'Orders will appear here once customers make purchases'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {result.pagination.totalPages > 1 && (
        <div
          className="flex items-center justify-between"
          data-testid="pagination"
        >
          <p className="text-sm text-muted-foreground">
            Showing page {result.pagination.page} of{' '}
            {result.pagination.totalPages}
          </p>
          <div className="flex space-x-2">
            {page > 1 && (
              <Link
                href={`/admin/orders?${new URLSearchParams({
                  ...(status && { status }),
                  ...(search && { search }),
                  page: (page - 1).toString(),
                })}`}
                className="rounded-lg border bg-background px-3 py-1 text-sm hover:bg-muted"
              >
                Previous
              </Link>
            )}
            {page < result.pagination.totalPages && (
              <Link
                href={`/admin/orders?${new URLSearchParams({
                  ...(status && { status }),
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
