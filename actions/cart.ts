'use server';

import { revalidatePath } from 'next/cache';
import { addToCart as addToCartService, updateCartItem as updateCartItemService, removeFromCart as removeFromCartService } from '@/services/cart';
import { addToCartSchema, updateCartItemSchema } from '@/lib/validations';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers';

// ============================================================================
// CART SERVER ACTIONS
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
  let sessionId = cookieStore.get('cart-session')?.value;

  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    cookieStore.set('cart-session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return sessionId;
}

export async function addToCart(formData: FormData): Promise<ActionResult> {
  try {
    const data = {
      productId: formData.get('productId') as string,
      variantId: formData.get('variantId') as string | undefined,
      quantity: Number(formData.get('quantity')) || 1,
    };

    const validated = addToCartSchema.parse(data);
    const user = await getUserSession();
    const sessionId = await getSessionId();

    const cart = await addToCartService(
      validated.productId,
      validated.quantity,
      user?.id || null,
      sessionId,
      validated.variantId
    );

    revalidatePath('/cart');
    revalidatePath('/checkout');

    return {
      success: true,
      data: cart,
    };
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return {
      success: false,
      error: error.message || 'Failed to add item to cart',
    };
  }
}

export async function updateCartItem(
  cartItemId: string,
  quantity: number
): Promise<ActionResult> {
  try {
    const validated = updateCartItemSchema.parse({ quantity });
    const user = await getUserSession();

    const cart = await updateCartItemService(
      cartItemId,
      validated.quantity,
      user?.id || null
    );

    revalidatePath('/cart');
    revalidatePath('/checkout');

    return {
      success: true,
      data: cart,
    };
  } catch (error: any) {
    console.error('Update cart item error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update cart item',
    };
  }
}

export async function removeFromCart(cartItemId: string): Promise<ActionResult> {
  try {
    const user = await getUserSession();

    const cart = await removeFromCartService(cartItemId, user?.id || null);

    revalidatePath('/cart');
    revalidatePath('/checkout');

    return {
      success: true,
      data: cart,
    };
  } catch (error: any) {
    console.error('Remove from cart error:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove item from cart',
    };
  }
}
