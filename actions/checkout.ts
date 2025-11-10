'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createOrder } from '@/services/orders';
import { getCart } from '@/services/cart';
import { checkoutSchema } from '@/lib/validations';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';
import type { CreateOrderInput } from '@/types/order';

// ============================================================================
// CHECKOUT SERVER ACTIONS
// ============================================================================

type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function getUserSession() {
  const session = await getServerSession();
  return session?.user;
}

async function getSessionId() {
  const cookieStore = await cookies();
  return cookieStore.get('cart-session')?.value;
}

export async function createOrderAction(formData: FormData): Promise<ActionResult> {
  try {
    // Parse form data
    const data = {
      shippingAddress: {
        fullName: formData.get('fullName') as string,
        street: formData.get('street') as string,
        street2: (formData.get('street2') as string) || undefined,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        postalCode: formData.get('postalCode') as string,
        country: (formData.get('country') as string) || 'US',
        phone: formData.get('phone') as string,
      },
      useSameAddress: formData.get('useSameAddress') === 'true',
      promoCode: (formData.get('promoCode') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
    };

    // Validate checkout data
    const validated = checkoutSchema.parse(data);

    // Get user and session
    const user = await getUserSession();
    const sessionId = await getSessionId();

    // Get cart
    const cart = await getCart(user?.id || null, sessionId);
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        error: 'Your cart is empty',
      };
    }

    // Create order input
    const orderInput: CreateOrderInput = {
      cartId: cart.id,
      shippingAddress: validated.shippingAddress,
      billingAddress: validated.useSameAddress
        ? validated.shippingAddress
        : validated.billingAddress,
      promoCode: validated.promoCode,
      notes: validated.notes,
    };

    // Create order
    const order = await createOrder(orderInput);

    // Revalidate relevant paths
    revalidatePath('/cart');
    revalidatePath('/orders');

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentIntentClientSecret: order.paymentStatus === 'PENDING' ? 'mock-secret' : undefined,
      },
    };
  } catch (error: any) {
    console.error('Create order error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create order',
    };
  }
}

export async function applyPromoCode(code: string): Promise<ActionResult> {
  try {
    // This would validate the promo code and return discount info
    // For now, returning a simple validation
    if (!code || code.trim().length === 0) {
      return {
        success: false,
        error: 'Please enter a promo code',
      };
    }

    return {
      success: true,
      data: {
        code: code.toUpperCase(),
        message: 'Promo code will be applied at checkout',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Invalid promo code',
    };
  }
}
