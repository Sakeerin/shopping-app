import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '@/services/cart';
import { prisma } from '@/lib/db';

// ============================================================================
// CART SERVICES UNIT TESTS
// ============================================================================

vi.mock('@/lib/db', () => ({
  prisma: {
    cart: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    cartItem: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
    productVariant: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Cart Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add item to cart with sufficient stock', async () => {
      const mockProduct = {
        id: 'prod1',
        name: 'Product 1',
        price: 29.99,
        stock: 10,
        variants: [],
      };

      const mockCart = {
        id: 'cart1',
        userId: 'user1',
        sessionId: null,
        items: [],
      };

      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);
      vi.mocked(prisma.cart.findFirst).mockResolvedValue(mockCart as any);
      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.cartItem.create).mockResolvedValue({} as any);
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        ...mockCart,
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            quantity: 2,
            priceSnapshot: 29.99,
            product: mockProduct,
            variant: null,
          },
        ],
      } as any);

      const result = await addToCart('prod1', 2, 'user1');

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
    });

    it('should throw error for insufficient stock', async () => {
      const mockProduct = {
        id: 'prod1',
        name: 'Product 1',
        price: 29.99,
        stock: 1,
        variants: [],
      };

      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);

      await expect(addToCart('prod1', 5, 'user1')).rejects.toThrow('Insufficient stock');
    });

    it('should create new cart for guest user', async () => {
      const mockProduct = {
        id: 'prod1',
        name: 'Product 1',
        price: 29.99,
        stock: 10,
        variants: [],
      };

      const mockNewCart = {
        id: 'cart-new',
        userId: null,
        sessionId: 'session123',
        items: [],
      };

      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);
      vi.mocked(prisma.cart.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.cart.create).mockResolvedValue(mockNewCart as any);
      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.cartItem.create).mockResolvedValue({} as any);
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        ...mockNewCart,
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            quantity: 1,
            priceSnapshot: 29.99,
            product: mockProduct,
            variant: null,
          },
        ],
      } as any);

      const result = await addToCart('prod1', 1, null, 'session123');

      expect(prisma.cart.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should update quantity if item already exists in cart', async () => {
      const mockProduct = {
        id: 'prod1',
        name: 'Product 1',
        price: 29.99,
        stock: 10,
        variants: [],
      };

      const mockCart = {
        id: 'cart1',
        userId: 'user1',
        sessionId: null,
      };

      const mockExistingItem = {
        id: 'item1',
        cartId: 'cart1',
        productId: 'prod1',
        variantId: null,
        quantity: 2,
        priceSnapshot: 29.99,
      };

      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);
      vi.mocked(prisma.cart.findFirst).mockResolvedValue(mockCart as any);
      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(mockExistingItem as any);
      vi.mocked(prisma.cartItem.update).mockResolvedValue({ ...mockExistingItem, quantity: 4 } as any);
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        ...mockCart,
        items: [{ ...mockExistingItem, quantity: 4, product: mockProduct, variant: null }],
      } as any);

      const result = await addToCart('prod1', 2, 'user1');

      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item1' },
        data: { quantity: 4 },
      });
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity', async () => {
      const mockCartItem = {
        id: 'item1',
        productId: 'prod1',
        variantId: null,
        quantity: 2,
        product: { stock: 10 },
        variant: null,
      };

      const mockCart = {
        id: 'cart1',
        userId: 'user1',
        items: [mockCartItem],
      };

      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(mockCartItem as any);
      vi.mocked(prisma.cartItem.update).mockResolvedValue({ ...mockCartItem, quantity: 5 } as any);
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);

      const result = await updateCartItem('item1', 5, 'user1');

      expect(result).toBeDefined();
    });

    it('should throw error for insufficient stock', async () => {
      const mockCartItem = {
        id: 'item1',
        productId: 'prod1',
        variantId: null,
        quantity: 2,
        product: { stock: 3 },
        variant: null,
      };

      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(mockCartItem as any);

      await expect(updateCartItem('item1', 10, 'user1')).rejects.toThrow('Insufficient stock');
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const mockCartItem = {
        id: 'item1',
        cartId: 'cart1',
      };

      const mockCart = {
        id: 'cart1',
        userId: 'user1',
        items: [],
      };

      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(mockCartItem as any);
      vi.mocked(prisma.cartItem.delete).mockResolvedValue({} as any);
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);

      const result = await removeFromCart('item1', 'user1');

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'item1' },
      });
      expect(result).toBeDefined();
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      vi.mocked(prisma.cartItem.deleteMany).mockResolvedValue({ count: 3 } as any);

      await clearCart('cart1');

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart1' },
      });
    });
  });
});
