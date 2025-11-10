import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createOrder, getOrderById, getOrderByNumber, getUserOrders } from '@/services/orders';
import { prisma } from '@/lib/db';
import { createPaymentIntent } from '@/lib/stripe';

// ============================================================================
// ORDER SERVICES UNIT TESTS
// ============================================================================

vi.mock('@/lib/db', () => ({
  prisma: {
    cart: {
      findUnique: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    orderItem: {
      create: vi.fn(),
    },
    product: {
      update: vi.fn(),
    },
    productVariant: {
      update: vi.fn(),
    },
    promoCode: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock('@/lib/stripe', () => ({
  createPaymentIntent: vi.fn(),
}));

vi.mock('@/services/cart', () => ({
  clearCart: vi.fn(),
}));

describe('Order Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order with valid cart', async () => {
      const mockCart = {
        id: 'cart1',
        userId: 'user1',
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            variantId: null,
            quantity: 2,
            priceSnapshot: 29.99,
            product: {
              id: 'prod1',
              name: 'Product 1',
              slug: 'product-1',
              images: ['image1.jpg'],
              stock: 10,
            },
            variant: null,
          },
        ],
      };

      const mockOrder = {
        id: 'order1',
        orderNumber: 'ORD-123',
        userId: 'user1',
        subtotal: 59.98,
        taxAmount: 4.80,
        shippingCost: 5.99,
        discountAmount: 0,
        totalAmount: 70.77,
        paymentStatus: 'PENDING',
      };

      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        vi.mocked(prisma.order.create).mockResolvedValue(mockOrder as any);
        return callback(prisma);
      });
      vi.mocked(createPaymentIntent).mockResolvedValue({ id: 'pi_123', client_secret: 'secret' } as any);

      const result = await createOrder({
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

      expect(result).toBeDefined();
      expect(result.orderNumber).toBe('ORD-123');
    });

    it('should throw error for empty cart', async () => {
      const mockCart = {
        id: 'cart1',
        userId: 'user1',
        items: [],
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
      ).rejects.toThrow('Cart is empty');
    });

    it('should throw error for insufficient stock', async () => {
      const mockCart = {
        id: 'cart1',
        userId: 'user1',
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            variantId: null,
            quantity: 10,
            priceSnapshot: 29.99,
            product: {
              id: 'prod1',
              name: 'Product 1',
              stock: 5,
            },
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
      ).rejects.toThrow('Insufficient stock for Product 1');
    });

    it('should apply promo code discount', async () => {
      const mockCart = {
        id: 'cart1',
        userId: 'user1',
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            variantId: null,
            quantity: 2,
            priceSnapshot: 50,
            product: {
              id: 'prod1',
              name: 'Product 1',
              slug: 'product-1',
              images: ['image1.jpg'],
              stock: 10,
            },
            variant: null,
          },
        ],
      };

      const mockPromoCode = {
        id: 'promo1',
        code: 'SAVE10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: true,
        expiresAt: new Date(Date.now() + 86400000), // Tomorrow
        usageLimit: 100,
        usageCount: 5,
      };

      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);
      vi.mocked(prisma.promoCode.findUnique).mockResolvedValue(mockPromoCode as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        vi.mocked(prisma.order.create).mockResolvedValue({
          id: 'order1',
          orderNumber: 'ORD-123',
          discountAmount: 10,
        } as any);
        return callback(prisma);
      });
      vi.mocked(createPaymentIntent).mockResolvedValue({ id: 'pi_123', client_secret: 'secret' } as any);

      await createOrder({
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
        promoCode: 'SAVE10',
      });

      expect(prisma.promoCode.findUnique).toHaveBeenCalledWith({
        where: { code: 'SAVE10' },
      });
    });
  });

  describe('getOrderById', () => {
    it('should return order with items', async () => {
      const mockOrder = {
        id: 'order1',
        orderNumber: 'ORD-123',
        items: [
          {
            id: 'item1',
            productName: 'Product 1',
            quantity: 2,
          },
        ],
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);

      const result = await getOrderById('order1', 'user1');

      expect(result).toBeDefined();
      expect(result?.orderNumber).toBe('ORD-123');
    });
  });

  describe('getOrderByNumber', () => {
    it('should return order by order number', async () => {
      const mockOrder = {
        id: 'order1',
        orderNumber: 'ORD-123',
        items: [],
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);

      const result = await getOrderByNumber('ORD-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('order1');
    });
  });

  describe('getUserOrders', () => {
    it('should return user orders', async () => {
      const mockOrders = [
        {
          id: 'order1',
          orderNumber: 'ORD-123',
          status: 'PENDING',
          totalAmount: 70.77,
          items: [{ id: 'item1' }],
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

      const result = await getUserOrders('user1');

      expect(result).toHaveLength(1);
      expect(result[0].itemCount).toBe(1);
    });
  });
});
