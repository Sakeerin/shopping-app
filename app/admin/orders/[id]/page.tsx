import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/db';
import { OrderActions } from '@/components/admin/order-actions';

// ============================================================================
// T164: ORDER DETAILS PAGE (Phase 7 - User Story 6)
// ============================================================================

export const dynamic = 'force-dynamic';

interface OrderDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { id } = params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
      promoCode: {
        select: {
          code: true,
          discountType: true,
          discountValue: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
        <p className="mt-2 text-muted-foreground">
          Placed on{' '}
          {new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 border-b pb-4 last:border-b-0 last:pb-0"
                >
                  {item.product.images[0] ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Customer Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a
                  href={`mailto:${order.user.email}`}
                  className="font-medium text-primary hover:underline"
                >
                  {order.user.email}
                </a>
              </div>
              <div>
                <Link
                  href={`/admin/customers/${order.user.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View Customer Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>
              <div className="space-y-1 text-sm">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-2 text-muted-foreground">
                    Phone: {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Actions */}
          <OrderActions orderId={order.id} currentStatus={order.status as any} />

          {/* Order Summary */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.promoCode && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount ({order.promoCode.code})
                  </span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : order.paymentStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.stripePaymentIntentId && (
                <div className="mt-2 break-all text-xs text-muted-foreground">
                  Stripe ID: {order.stripePaymentIntentId}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
