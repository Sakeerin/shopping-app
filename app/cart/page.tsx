import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { getCart } from '@/services/cart';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import type { CartSummary as CartSummaryType } from '@/types/cart';

// ============================================================================
// CART PAGE (Server Component)
// ============================================================================

export const metadata = {
  title: 'Shopping Cart | Shopping App',
  description: 'Review your cart and proceed to checkout',
};

async function getUserSession() {
  const session = await getServerSession();
  return session?.user;
}

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get('cart-session')?.value;
}

export default async function CartPage() {
  const user = await getUserSession();
  const sessionId = await getSessionId();

  const cart = await getCart(user?.id || null, sessionId);

  // Calculate cart summary
  const summary: CartSummaryType = {
    subtotal: cart?.subtotal || 0,
    tax: cart?.subtotal ? cart.subtotal * 0.08 : 0, // 8% tax
    shipping: cart?.subtotal && cart.subtotal > 50 ? 0 : 5.99, // Free shipping over $50
    discount: 0, // Apply promo code discount if available
    total: 0,
    itemCount: cart?.itemCount || 0,
  };

  summary.total = summary.subtotal + summary.tax + summary.shipping - summary.discount;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>

        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12">
          <svg
            className="h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-center text-gray-600">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            href="/products"
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-gray-600">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Link
          href="/products"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <CartSummary summary={summary} showCheckoutButton={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
