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
