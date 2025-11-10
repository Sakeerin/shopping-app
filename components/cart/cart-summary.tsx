import Link from 'next/link';
import type { CartSummary as CartSummaryType } from '@/types/cart';

// ============================================================================
// CART SUMMARY COMPONENT (Server Component)
// ============================================================================

interface CartSummaryProps {
  summary: CartSummaryType;
  showCheckoutButton?: boolean;
  isCheckoutPage?: boolean;
}

export function CartSummary({
  summary,
  showCheckoutButton = true,
  isCheckoutPage = false,
}: CartSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

      <div className="mt-6 space-y-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Subtotal ({summary.itemCount} items)</span>
          <span className="font-medium text-gray-900">{formatCurrency(summary.subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">
            {summary.shipping === 0 ? 'FREE' : formatCurrency(summary.shipping)}
          </span>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium text-gray-900">{formatCurrency(summary.tax)}</span>
        </div>

        {/* Discount */}
        {summary.discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-green-600">-{formatCurrency(summary.discount)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && !isCheckoutPage && (
        <div className="mt-6">
          <Link
            href="/checkout"
            className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Proceed to Checkout
          </Link>
        </div>
      )}

      {/* Continue Shopping Link */}
      {!isCheckoutPage && (
        <div className="mt-4 text-center">
          <Link
            href="/products"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-6 space-y-2 border-t border-gray-200 pt-6">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <svg
            className="h-4 w-4 flex-shrink-0 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Free shipping on orders over $50</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <svg
            className="h-4 w-4 flex-shrink-0 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Secure checkout with SSL encryption</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <svg
            className="h-4 w-4 flex-shrink-0 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          <span>30-day return policy</span>
        </div>
      </div>
    </div>
  );
}
