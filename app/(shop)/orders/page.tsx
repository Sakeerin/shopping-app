import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserByEmail } from '@/services/users';
import { getUserOrders } from '@/services/orders';
import { OrderCard } from '@/components/orders/order-card';
import Link from 'next/link';

// ============================================================================
// ORDER HISTORY PAGE (T112)
// ============================================================================

export const metadata = {
  title: 'My Orders | ShopApp',
  description: 'View your order history and track shipments',
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    redirect('/login');
  }

  const orders = await getUserOrders(user.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            View and track your order history
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No orders yet
            </h2>
            <p className="mt-2 text-gray-600">
              Start shopping to see your orders here
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={{
                  id: order.id,
                  orderNumber: order.orderNumber,
                  status: order.status,
                  paymentStatus: order.paymentStatus,
                  totalAmount: order.totalAmount,
                  createdAt: order.createdAt,
                  items: order.items,
                }}
              />
            ))}
          </div>
        )}

        {/* Order Stats */}
        {orders.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="text-sm font-medium text-gray-600">Total Orders</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{orders.length}</div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="text-sm font-medium text-gray-600">Delivered</div>
              <div className="mt-2 text-3xl font-bold text-green-600">
                {orders.filter((o) => o.status === 'DELIVERED').length}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <div className="text-sm font-medium text-gray-600">In Progress</div>
              <div className="mt-2 text-3xl font-bold text-blue-600">
                {
                  orders.filter(
                    (o) =>
                      o.status === 'PENDING' ||
                      o.status === 'PROCESSING' ||
                      o.status === 'SHIPPED'
                  ).length
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
