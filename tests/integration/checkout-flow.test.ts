import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addToCart } from '@/services/cart';
import { createOrder } from '@/services/orders';
import { prisma } from '@/lib/db';

// ============================================================================
// CHECKOUT FLOW INTEGRATION TEST
// ============================================================================

vi.mock('@/lib/db', () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
    },
    cart: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    cartItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    order: {
      create: vi.fn(),
    },
    orderItem: {
      create: vi.fn(),
    },
    promoCode: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    productVariant: {
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock('@/lib/stripe', () => ({
  createPaymentIntent: vi.fn().mockResolvedValue({
    id: 'pi_test_123',
    client_secret: 'secret_test_123',
  }),
}));

vi.mock('@/services/cart', () => ({
  ...vi.importActual('@/services/cart'),
  clearCart: vi.fn(),
}));

describe('Checkout Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full checkout flow from cart to order', async () => {
    // Step 1: Setup product data
    const mockProduct = {
      id: 'prod1',
      name: 'Test Product',
      slug: 'test-product',
      price: 50.0,
      stock: 10,
      images: ['image1.jpg'],
      variants: [],
    };

    vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);

    // Step 2: Create cart
    const mockCart = {
      id: 'cart1',
      userId: 'user1',
      sessionId: null,
      items: [],
    };

    vi.mocked(prisma.cart.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.cart.create).mockResolvedValue(mockCart as any);

    // Step 3: Add items to cart
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.cartItem.create).mockResolvedValue({
      id: 'item1',
      cartId: 'cart1',
      productId: 'prod1',
      quantity: 2,
      priceSnapshot: 50.0,
    } as any);

    vi.mocked(prisma.cart.findUnique).mockResolvedValue({
      ...mockCart,
      items: [
        {
          id: 'item1',
          productId: 'prod1',
          variantId: null,
          quantity: 2,
          priceSnapshot: 50.0,
          product: mockProduct,
          variant: null,
        },
      ],
    } as any);

    const cart = await addToCart('prod1', 2, 'user1');

    expect(cart).toBeDefined();
    expect(cart.items).toHaveLength(1);
    expect(cart.subtotal).toBe(100);

    // Step 4: Create order from cart
    const mockOrder = {
      id: 'order1',
      orderNumber: 'ORD-TEST-123',
      userId: 'user1',
      subtotal: 100,
      taxAmount: 8,
      shippingCost: 5.99,
      discountAmount: 0,
      totalAmount: 113.99,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      shippingAddress: {
        fullName: 'John Doe',
        street: '123 Main St',
        city: 'City',
        state: 'ST',
        postalCode: '12345',
        country: 'US',
        phone: '555-1234',
      },
      billingAddress: {
        fullName: 'John Doe',
        street: '123 Main St',
        city: 'City',
        state: 'ST',
        postalCode: '12345',
        country: 'US',
        phone: '555-1234',
      },
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      vi.mocked(prisma.order.create).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.orderItem.create).mockResolvedValue({} as any);
      return callback(prisma);
    });

    const order = await createOrder({
      cartId: 'cart1',
      shippingAddress: {
        fullName: 'John Doe',
        street: '123 Main St',
        city: 'City',
        state: 'ST',
        postalCode: '12345',
        country: 'US',
        phone: '555-1234',
      },
    });

    expect(order).toBeDefined();
    expect(order.orderNumber).toBe('ORD-TEST-123');
    expect(order.totalAmount).toBe(113.99);
    expect(order.paymentStatus).toBe('PENDING');

    // Verify cart was cleared
    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cartId: 'cart1' },
    });
  });

  it('should handle promo code application in checkout flow', async () => {
    const mockProduct = {
      id: 'prod1',
      name: 'Test Product',
      slug: 'test-product',
      price: 100.0,
      stock: 10,
      images: ['image1.jpg'],
      variants: [],
    };

    const mockCart = {
      id: 'cart1',
      userId: 'user1',
      items: [
        {
          id: 'item1',
          productId: 'prod1',
          variantId: null,
          quantity: 1,
          priceSnapshot: 100.0,
          product: mockProduct,
          variant: null,
        },
      ],
    };

    const mockPromoCode = {
      id: 'promo1',
      code: 'SAVE20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      isActive: true,
      expiresAt: new Date(Date.now() + 86400000),
      usageLimit: 100,
      usageCount: 5,
    };

    vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);
    vi.mocked(prisma.promoCode.findUnique).mockResolvedValue(mockPromoCode as any);

    const mockOrder = {
      id: 'order1',
      orderNumber: 'ORD-TEST-456',
      subtotal: 100,
      discountAmount: 20,
      totalAmount: 93.99, // 100 - 20 (promo) + 8 (tax) + 5.99 (shipping)
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      vi.mocked(prisma.order.create).mockResolvedValue(mockOrder as any);
      return callback(prisma);
    });

    const order = await createOrder({
      cartId: 'cart1',
      shippingAddress: {
        fullName: 'Jane Doe',
        street: '456 Elm St',
        city: 'City',
        state: 'ST',
        postalCode: '54321',
        country: 'US',
        phone: '555-5678',
      },
      promoCode: 'SAVE20',
    });

    expect(order.discountAmount).toBe(20);
    expect(prisma.promoCode.updateMany).toHaveBeenCalled();
  });

  it('should handle out of stock error during checkout', async () => {
    const mockProduct = {
      id: 'prod1',
      name: 'Test Product',
      stock: 1,
      variants: [],
    };

    const mockCart = {
      id: 'cart1',
      userId: 'user1',
      items: [
        {
          id: 'item1',
          productId: 'prod1',
          variantId: null,
          quantity: 5,
          priceSnapshot: 50.0,
          product: mockProduct,
          variant: null,
        },
      ],
    };

    vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);

    await expect(
      createOrder({
        cartId: 'cart1',
        shippingAddress: {
          fullName: 'John Doe',
          street: '123 Main St',
          city: 'City',
          state: 'ST',
          postalCode: '12345',
          country: 'US',
          phone: '555-1234',
        },
      })
    ).rejects.toThrow('Insufficient stock');
  });
});
