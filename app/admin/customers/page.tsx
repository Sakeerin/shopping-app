import Link from 'next/link';
import { Users } from 'lucide-react';
import { getCustomers } from '@/services/analytics';

// ============================================================================
// T165: CUSTOMER MANAGEMENT PAGE (Phase 7 - User Story 6)
// ============================================================================

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const result = await getCustomers(page, 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Customers</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage customer accounts
        </p>
      </div>

      {/* Customers Table */}
      <div className="rounded-lg border bg-card">
        {result.customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Total Spent
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{customer.name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-primary hover:underline"
                      >
                        {customer.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{customer.orderCount}</span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders?search=${encodeURIComponent(
                          customer.email
                        )}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View Orders
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No customers found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Customers will appear here once they register
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {result.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing page {result.pagination.page} of{' '}
            {result.pagination.totalPages}
          </p>
          <div className="flex space-x-2">
            {page > 1 && (
              <Link
                href={`/admin/customers?page=${page - 1}`}
                className="rounded-lg border bg-background px-3 py-1 text-sm hover:bg-muted"
              >
                Previous
              </Link>
            )}
            {page < result.pagination.totalPages && (
              <Link
                href={`/admin/customers?page=${page + 1}`}
                className="rounded-lg border bg-background px-3 py-1 text-sm hover:bg-muted"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Customer Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Customers</p>
          <p className="mt-2 text-3xl font-bold">{result.pagination.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Average Orders</p>
          <p className="mt-2 text-3xl font-bold">
            {result.customers.length > 0
              ? (
                  result.customers.reduce((sum, c) => sum + c.orderCount, 0) /
                  result.customers.length
                ).toFixed(1)
              : '0'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Average Lifetime Value</p>
          <p className="mt-2 text-3xl font-bold">
            $
            {result.customers.length > 0
              ? (
                  result.customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                  result.customers.length
                ).toFixed(2)
              : '0.00'}
          </p>
        </div>
      </div>
    </div>
  );
}
