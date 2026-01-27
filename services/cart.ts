import { prisma } from '@/lib/db';
import type { CartData, CartItemData } from '@/types/cart';

// ============================================================================
// CART SERVICES
// ============================================================================

export async function getCart(userId: string | null, sessionId?: string): Promise<CartData | null> {
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!cart) return null;

  const items: CartItemData[] = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productSlug: item.product.slug,
    productImage: item.product.images[0] || '',
    variantId: item.variantId,
    variantDetails: item.variant
      ? `${item.variant.variantType}: ${item.variant.variantValue}`
      : null,
    price: Number(item.priceSnapshot),
    quantity: item.quantity,
    lineTotal: Number(item.priceSnapshot) * item.quantity,
    stock: item.variant ? item.variant.stock : item.product.stock,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    id: cart.id,
    items,
    subtotal,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export async function addToCart(
  productId: string,
  quantity: number,
  userId: string | null,
  sessionId?: string,
  variantId?: string
): Promise<CartData> {
  // Fetch product to get current price and check stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product || !product.isActive) {
    throw new Error('Product not found or unavailable');
  }

  const variant = variantId
    ? product.variants.find((v) => v.id === variantId)
    : null;

  const availableStock = variant ? variant.stock : product.stock;

  if (availableStock < quantity) {
    throw new Error('Insufficient stock');
  }

  // Find or create cart
  let cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        sessionId,
      },
    });
  }

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_variantId: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > availableStock) {
      throw new Error('Insufficient stock');
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        priceSnapshot: product.price,
      },
    });
  }

  // Return updated cart
  const updatedCart = await getCart(userId, sessionId);
  if (!updatedCart) {
    throw new Error('Failed to retrieve cart');
  }

  return updatedCart;
}

export async function updateCartItem(
  cartItemId: string,
  quantity: number,
  userId: string | null
): Promise<CartData> {
  if (quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }

  if (quantity === 0) {
    return removeFromCart(cartItemId, userId);
  }

  // Fetch cart item with product info
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      product: true,
      variant: true,
      cart: true,
    },
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  // Verify cart ownership
  if (userId && cartItem.cart.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // Check stock
  const availableStock = cartItem.variant
    ? cartItem.variant.stock
    : cartItem.product.stock;

  if (quantity > availableStock) {
    throw new Error('Insufficient stock');
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  const cart = await getCart(userId, cartItem.cart.sessionId || undefined);
  if (!cart) {
    throw new Error('Failed to retrieve cart');
  }

  return cart;
}

export async function removeFromCart(
  cartItemId: string,
  userId: string | null
): Promise<CartData> {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  // Verify cart ownership
  if (userId && cartItem.cart.userId !== userId) {
    throw new Error('Unauthorized');
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  const cart = await getCart(userId, cartItem.cart.sessionId || undefined);
  if (!cart) {
    // Return empty cart if no items left
    return {
      id: cartItem.cartId,
      items: [],
      subtotal: 0,
      itemCount: 0,
    };
  }

  return cart;
}

export async function clearCart(cartId: string): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: { cartId },
  });
}

// ============================================================================
// PROMO CODE SERVICES (T119-T121)
// ============================================================================

// T119: Validate promo code
export async function validatePromoCode(
  code: string,
  userId: string | null,
  subtotal: number
): Promise<{ valid: boolean; error?: string; promoCode?: any }> {
  const promoCode = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!promoCode) {
    return { valid: false, error: 'Invalid promo code' };
  }

  // Check if promo code is active
  if (!promoCode.isActive) {
    return { valid: false, error: 'This promo code is no longer active' };
  }

  // Check start date
  const now = new Date();
  if (promoCode.startDate > now) {
    return { valid: false, error: 'This promo code is not yet valid' };
  }

  // Check end date
  if (promoCode.endDate && promoCode.endDate < now) {
    return { valid: false, error: 'This promo code has expired' };
  }

  // Check usage limit
  if (
    promoCode.usageLimit !== null &&
    promoCode.usageCount >= promoCode.usageLimit
  ) {
    return { valid: false, error: 'This promo code has reached its usage limit' };
  }

  // Check per-user limit (if user is logged in)
  if (userId && promoCode.perUserLimit !== null) {
    const userUsageCount = await prisma.order.count({
      where: {
        userId,
        promoCode: code.toUpperCase(),
      },
    });

    if (userUsageCount >= promoCode.perUserLimit) {
      return {
        valid: false,
        error: 'You have already used this promo code the maximum number of times',
      };
    }
  }

  // Check minimum purchase requirement
  if (promoCode.minPurchase && Number(promoCode.minPurchase) > subtotal) {
    return {
      valid: false,
      error: `Minimum purchase of $${Number(promoCode.minPurchase).toFixed(2)} required`,
    };
  }

  return { valid: true, promoCode };
}

// T120: Calculate discount
export function calculateDiscount(
  subtotal: number,
  promoCode: {
    discountType: string;
    discountValue: any;
    maxDiscount: any;
  }
): number {
  let discount = 0;

  if (promoCode.discountType === 'PERCENTAGE') {
    discount = (subtotal * Number(promoCode.discountValue)) / 100;

    // Apply max discount cap if set
    if (promoCode.maxDiscount) {
      discount = Math.min(discount, Number(promoCode.maxDiscount));
    }
  } else if (promoCode.discountType === 'FIXED') {
    discount = Math.min(Number(promoCode.discountValue), subtotal);
  }

  return Number(discount.toFixed(2));
}

// T121: Merge guest cart with user cart on login
export async function mergeGuestCart(
  guestSessionId: string,
  userId: string
): Promise<CartData | null> {
  // Find guest cart
  const guestCart = await prisma.cart.findFirst({
    where: { sessionId: guestSessionId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!guestCart || guestCart.items.length === 0) {
    return getCart(userId);
  }

  // Find or create user cart
  let userCart = await prisma.cart.findFirst({
    where: { userId },
  });

  if (!userCart) {
    userCart = await prisma.cart.create({
      data: { userId },
    });
  }

  // Merge items
  for (const guestItem of guestCart.items) {
    // Check if product/variant combo already exists in user cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: userCart.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId || null,
        },
      },
    });

    // Check stock availability
    const availableStock = guestItem.variant
      ? guestItem.variant.stock
      : guestItem.product.stock;

    if (existingItem) {
      // Combine quantities (respecting stock limits)
      const newQuantity = Math.min(
        existingItem.quantity + guestItem.quantity,
        availableStock
      );

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new item to user cart (respecting stock limits)
      const quantity = Math.min(guestItem.quantity, availableStock);

      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
          quantity,
          priceSnapshot: guestItem.priceSnapshot,
        },
      });
    }
  }

  // Delete guest cart
  await prisma.cartItem.deleteMany({
    where: { cartId: guestCart.id },
  });
  await prisma.cart.delete({
    where: { id: guestCart.id },
  });

  // Return merged cart
  return getCart(userId);
}

// ============================================================================
// HELPER: GET CART ITEM COUNT (for header display)
// ============================================================================

export async function getCartItemCount(userId: string): Promise<number> {
  const cart = await prisma.cart.findFirst({
    where: { userId },
    select: {
      items: {
        select: {
          quantity: true,
        },
      },
    },
  });

  if (!cart) return 0;

  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
