import { prisma } from '@/lib/db';
import { createPaymentIntent } from '@/lib/stripe';
import { sendOrderConfirmation } from '@/lib/email';
import { TAX_RATE, FLAT_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import type { CreateOrderInput, OrderData, CartSummary } from '@/types/order';
import { clearCart } from './cart';

// ============================================================================
// ORDER SERVICES
// ============================================================================

export async function calculateOrderTotals(
  subtotal: number,
  promoCode?: string
): Promise<CartSummary> {
  let discount = 0;

  // Apply promo code if provided
  if (promoCode) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: promoCode.toUpperCase() },
    });

    if (
      promo &&
      promo.isActive &&
      (!promo.usageLimit || promo.usageCount < promo.usageLimit) &&
      (!promo.endDate || promo.endDate > new Date())
    ) {
      if (promo.minPurchase && Number(promo.minPurchase) > subtotal) {
        // Minimum purchase not met
      } else {
        if (promo.discountType === 'PERCENTAGE') {
          discount = (subtotal * Number(promo.discountValue)) / 100;
          if (promo.maxDiscount) {
            discount = Math.min(discount, Number(promo.maxDiscount));
          }
        } else {
          discount = Math.min(Number(promo.discountValue), subtotal);
        }
      }
    }
  }

  const discountedSubtotal = subtotal - discount;
  const shipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const tax = discountedSubtotal * TAX_RATE;
  const total = discountedSubtotal + tax + shipping;

  return {
    subtotal,
    tax: Number(tax.toFixed(2)),
    shipping,
    discount,
    total: Number(total.toFixed(2)),
    itemCount: 0, // Will be set by caller
  };
}

export async function createOrder(input: CreateOrderInput): Promise<OrderData> {
  const { cartId, shippingAddress, billingAddress, promoCode, notes } = input;

  // Fetch cart with items and user
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      user: true,
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Validate stock for all items
  for (const item of cart.items) {
    const availableStock = item.variant ? item.variant.stock : item.product.stock;
    if (item.quantity > availableStock) {
      throw new Error(`Insufficient stock for ${item.product.name}`);
    }
  }

  // Calculate totals
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.priceSnapshot) * item.quantity,
    0
  );

  const totals = await calculateOrderTotals(subtotal, promoCode);
  totals.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: cart.userId,
        userEmail: cart.user?.email || 'guest@example.com',
        subtotal,
        taxAmount: totals.tax,
        shippingCost: totals.shipping,
        discountAmount: totals.discount,
        totalAmount: totals.total,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        promoCode,
        notes,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
    });

    // Create order items and update stock
    for (const item of cart.items) {
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          productSlug: item.product.slug,
          productImage: item.product.images[0] || '',
          variantDetails: item.variant
            ? `${item.variant.variantType}: ${item.variant.variantValue}`
            : null,
          priceSnapshot: item.priceSnapshot,
          quantity: item.quantity,
          lineTotal: Number(item.priceSnapshot) * item.quantity,
        },
      });

      // Decrement stock
      if (item.variant) {
        await tx.productVariant.update({
          where: { id: item.variantId! },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    // Update promo code usage
    if (promoCode) {
      await tx.promoCode.updateMany({
        where: { code: promoCode.toUpperCase() },
        data: { usageCount: { increment: 1 } },
      });
    }

    return newOrder;
  });

  // Create Stripe Payment Intent
  const paymentIntent = await createPaymentIntent(totals.total, order.id);

  // Update order with payment intent ID
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentIntentId: paymentIntent.id },
  });

  // Clear cart
  await clearCart(cartId);

  // Fetch and return complete order data
  const orderData = await getOrderById(order.id);
  if (!orderData) {
    throw new Error('Failed to retrieve order');
  }

  // Send order confirmation email
  const customerEmail = cart.user?.email || order.userEmail;
  const customerName = cart.user?.name || shippingAddress.fullName;

  if (customerEmail) {
    try {
      await sendOrderConfirmation({
        email: customerEmail,
        customerName,
        orderData: {
          orderNumber: orderData.orderNumber,
          orderDate: orderData.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          customerName,
          items: orderData.items.map((item) => ({
            id: item.id,
            productName: item.productName,
            productImage: item.productImage,
            productSlug: item.productSlug,
            quantity: item.quantity,
            price: item.price,
            lineTotal: item.lineTotal,
            variantDetails: item.variantDetails || undefined,
          })),
          subtotal: orderData.subtotal,
          taxAmount: orderData.taxAmount,
          shippingCost: orderData.shippingCost,
          discountAmount: orderData.discountAmount,
          totalAmount: orderData.totalAmount,
          shippingAddress: orderData.shippingAddress,
          estimatedDelivery: orderData.estimatedDelivery
            ? orderData.estimatedDelivery.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : undefined,
        },
      });
    } catch (emailError) {
      // Log error but don't fail the order creation
      console.error('Failed to send order confirmation email:', emailError);
    }
  }

  return orderData;
}

export async function getOrderById(orderId: string): Promise<OrderData | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount),
    shippingCost: Number(order.shippingCost),
    discountAmount: Number(order.discountAmount),
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      productSlug: item.productSlug,
      productImage: item.productImage,
      variantDetails: item.variantDetails,
      price: Number(item.priceSnapshot),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
    })),
    shippingAddress: order.shippingAddress as any,
    createdAt: order.createdAt,
    estimatedDelivery: order.shippedAt
      ? new Date(order.shippedAt.getTime() + 5 * 24 * 60 * 60 * 1000)
      : undefined,
  };
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderData | null> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!order) return null;

  return getOrderById(order.id);
}

export async function getUserOrders(userId: string): Promise<OrderData[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return Promise.all(orders.map((order) => getOrderById(order.id) as Promise<OrderData>));
}
