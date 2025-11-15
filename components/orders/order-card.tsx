import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

// ============================================================================
// ORDER CARD COMPONENT (T105)
// ============================================================================

interface OrderItem {
  id: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantDetails: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
}

interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt: Date;
    items: OrderItem[];
  };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const paymentStatusColors: Record<string, string> = {
  PENDING: 'text-yellow-600',
  PAID: 'text-green-600',
  FAILED: 'text-red-600',
  REFUNDED: 'text-gray-600',
};

export function OrderCard({ order }: OrderCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Order Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Order {order.orderNumber}
              </h3>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  statusColors[order.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>Placed on {formatDate(order.createdAt)}</span>
              <span className={`font-medium ${paymentStatusColors[order.paymentStatus]}`}>
                Payment: {order.paymentStatus}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <Image
                  src={item.productImage || '/placeholder-product.png'}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <Link
                  href={`/products/${item.productSlug}`}
                  className="font-medium text-gray-900 hover:text-blue-600"
                >
                  {item.productName}
                </Link>
                {item.variantDetails && (
                  <p className="text-sm text-gray-500">{item.variantDetails}</p>
                )}
                <p className="text-sm text-gray-600">
                  Qty: {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.lineTotal)}
                </p>
              </div>
            </div>
          ))}

          {order.items.length > 3 && (
            <p className="text-sm text-gray-500">
              + {order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Order Actions */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Details
          </Link>

          {order.status === 'DELIVERED' && (
            <Link
              href={`/products/${order.items[0]?.productSlug}`}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Buy Again
            </Link>
          )}

          {order.status === 'SHIPPED' && (
            <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Track Package
            </button>
          )}

          {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
            <button className="inline-flex items-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
