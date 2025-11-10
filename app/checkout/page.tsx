import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import { getCart } from '@/services/cart';
import { CheckoutForm } from '@/components/cart/checkout-form';
import { CartSummary } from '@/components/cart/cart-summary';
import type { CartSummary as CartSummaryType } from '@/types/cart';

// ============================================================================
// CHECKOUT PAGE (Server Component with Stripe Integration)
// ============================================================================

export const metadata = {
  title: 'Checkout | Shopping App',
  description: 'Complete your purchase',
};

async function getUserSession() {
  const session = await getServerSession();
  return session?.user;
}

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get('cart-session')?.value;
}

export default async function CheckoutPage() {
  const user = await getUserSession();
  const sessionId = await getSessionId();

  const cart = await getCart(user?.id || null, sessionId);

  // Redirect if cart is empty
  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }

  // Calculate cart summary
  const summary: CartSummaryType = {
    subtotal: cart.subtotal,
    tax: cart.subtotal * 0.08, // 8% tax
    shipping: cart.subtotal > 50 ? 0 : 5.99, // Free shipping over $50
    discount: 0, // Apply promo code discount if available
    total: 0,
    itemCount: cart.itemCount,
  };

  summary.total = summary.subtotal + summary.tax + summary.shipping - summary.discount;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>
        <p className="mt-2 text-gray-600">Complete your order details</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <CheckoutForm />
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Cart Summary */}
            <CartSummary summary={summary} showCheckoutButton={false} isCheckoutPage={true} />

            {/* Order Items Preview */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Order Items</h3>
              <ul className="space-y-3">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(item.lineTotal)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
