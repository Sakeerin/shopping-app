import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { getOrderByNumber } from '@/services/orders';
import type { Metadata } from 'next';

// ============================================================================
// ORDER CONFIRMATION PAGE (Server Component)
// ============================================================================

interface OrderPageProps {
  params: {
    orderNumber: string;
  };
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  return {
    title: `Order ${params.orderNumber} | Shopping App`,
    description: 'Order confirmation and details',
  };
}

async function getUserSession() {
  const session = await getServerSession();
  return session?.user;
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const user = await getUserSession();
  const order = await getOrderByNumber(params.orderNumber);

  if (!order) {
    notFound();
  }

  // Verify order belongs to current user (if logged in)
  if (user && order.userId !== user.id) {
    redirect('/orders');
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {order.status === 'PENDING' && order.paymentStatus === 'PENDING' && (
        <div className="rounded-lg bg-green-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 flex-shrink-0 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h2 className="text-lg font-semibold text-green-900">Order Placed Successfully!</h2>
              <p className="mt-1 text-sm text-green-700">
                Thank you for your order. We'll send you a confirmation email shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Order #{order.orderNumber}
        </h1>
        <p className="mt-2 text-gray-600">Placed on {formatDate(order.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Order Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Status</h2>
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                Payment: {order.paymentStatus}
              </span>
            </div>
            {order.estimatedDelivery && (
              <p className="mt-4 text-sm text-gray-600">
                Estimated delivery: {formatDate(order.estimatedDelivery)}
              </p>
            )}
          </div>

          {/* Order Items */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Items</h2>
            <ul className="space-y-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        <Link href={`/products/${item.productSlug}`} className="hover:text-blue-600">
                          {item.productName}
                        </Link>
                      </h3>
                      {item.variantDetails && (
                        <p className="mt-1 text-sm text-gray-500">{item.variantDetails}</p>
                      )}
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-medium text-gray-900">{formatCurrency(item.lineTotal)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Shipping Address</h2>
            <address className="text-sm not-italic text-gray-600">
              <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
              <p className="mt-1">{order.shippingAddress.street}</p>
              {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2">{order.shippingAddress.phone}</p>
            </address>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">
                  {order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.taxAmount)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                href="/products"
                className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Continue Shopping
              </Link>
              {user && (
                <Link
                  href="/orders"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  View All Orders
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
