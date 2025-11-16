import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/db';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  mergeGuestCart,
} from '@/services/cart';

// ============================================================================
// CART PERSISTENCE INTEGRATION TESTS (T116)
// ============================================================================

describe('Cart Persistence Integration', () => {
  let testUserId: string;
  let testProductId: string;
  let guestSessionId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-cart-${Date.now()}@example.com`,
        name: 'Test User',
        password: 'hashedpassword',
        role: 'CUSTOMER',
      },
    });
    testUserId = user.id;

    // Create test product
    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: `test-product-${Date.now()}`,
        description: 'A test product',
        price: 50.0,
        stock: 100,
        categoryId: null,
        images: [],
      },
    });
    testProductId = product.id;

    guestSessionId = `guest-${Date.now()}`;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          OR: [{ userId: testUserId }, { sessionId: guestSessionId }],
        },
      },
    });

    await prisma.cart.deleteMany({
      where: {
        OR: [{ userId: testUserId }, { sessionId: guestSessionId }],
      },
    });

    await prisma.product.delete({
      where: { id: testProductId },
    });

    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  describe('Guest Cart Persistence', () => {
    it('should persist guest cart with session ID', async () => {
      // Add item to guest cart
      const cart = await addToCart(testProductId, 2, null, guestSessionId);

      expect(cart).toBeDefined();
      expect(cart.sessionId).toBe(guestSessionId);
      expect(cart.userId).toBeNull();
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(2);
    });

    it('should retrieve guest cart by session ID', async () => {
      // Add item
      await addToCart(testProductId, 3, null, guestSessionId);

      // Retrieve cart
      const cart = await getCart(null, guestSessionId);

      expect(cart).toBeDefined();
      expect(cart?.sessionId).toBe(guestSessionId);
      expect(cart?.items).toHaveLength(1);
      expect(cart?.items[0].quantity).toBe(3);
    });

    it('should update guest cart items', async () => {
      // Add item
      const cart = await addToCart(testProductId, 1, null, guestSessionId);
      const cartItemId = cart.items[0].id;

      // Update quantity
      const updatedCart = await updateCartItem(cartItemId, 5, null);

      expect(updatedCart.items[0].quantity).toBe(5);
    });

    it('should remove items from guest cart', async () => {
      // Add item
      const cart = await addToCart(testProductId, 1, null, guestSessionId);
      const cartItemId = cart.items[0].id;

      // Remove item
      const updatedCart = await removeFromCart(cartItemId, null);

      expect(updatedCart.items).toHaveLength(0);
    });
  });

  describe('User Cart Persistence', () => {
    it('should persist user cart with user ID', async () => {
      const cart = await addToCart(testProductId, 2, testUserId, null);

      expect(cart).toBeDefined();
      expect(cart.userId).toBe(testUserId);
      expect(cart.sessionId).toBeNull();
      expect(cart.items).toHaveLength(1);
    });

    it('should retrieve user cart by user ID', async () => {
      await addToCart(testProductId, 3, testUserId, null);

      const cart = await getCart(testUserId, null);

      expect(cart).toBeDefined();
      expect(cart?.userId).toBe(testUserId);
      expect(cart?.items).toHaveLength(1);
      expect(cart?.items[0].quantity).toBe(3);
    });

    it('should maintain cart across multiple requests', async () => {
      // First request
      await addToCart(testProductId, 2, testUserId, null);

      // Second request (retrieve)
      const cart = await getCart(testUserId, null);

      expect(cart?.items).toHaveLength(1);
      expect(cart?.items[0].quantity).toBe(2);
    });

    it('should update existing item quantity when adding same product', async () => {
      // Add item
      await addToCart(testProductId, 2, testUserId, null);

      // Add same product again
      const cart = await addToCart(testProductId, 3, testUserId, null);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
    });
  });

  describe('Cart Merge on Login', () => {
    it('should merge guest cart with empty user cart', async () => {
      // Create guest cart
      await addToCart(testProductId, 3, null, guestSessionId);

      // Merge with user (who has no cart)
      const mergedCart = await mergeGuestCart(guestSessionId, testUserId);

      expect(mergedCart).toBeDefined();
      expect(mergedCart?.userId).toBe(testUserId);
      expect(mergedCart?.items).toHaveLength(1);
      expect(mergedCart?.items[0].quantity).toBe(3);

      // Verify guest cart is deleted
      const guestCart = await getCart(null, guestSessionId);
      expect(guestCart).toBeNull();
    });

    it('should merge guest cart with existing user cart', async () => {
      // Create user cart
      await addToCart(testProductId, 2, testUserId, null);

      // Create guest cart with same product
      await addToCart(testProductId, 3, null, guestSessionId);

      // Merge
      const mergedCart = await mergeGuestCart(guestSessionId, testUserId);

      expect(mergedCart?.items).toHaveLength(1);
      expect(mergedCart?.items[0].quantity).toBe(5); // 2 + 3
    });

    it('should merge multiple different products', async () => {
      // Create second product
      const product2 = await prisma.product.create({
        data: {
          name: 'Test Product 2',
          slug: `test-product-2-${Date.now()}`,
          description: 'Another test product',
          price: 30.0,
          stock: 50,
          categoryId: null,
          images: [],
        },
      });

      // User cart has product 1
      await addToCart(testProductId, 2, testUserId, null);

      // Guest cart has product 2
      await addToCart(product2.id, 1, null, guestSessionId);

      // Merge
      const mergedCart = await mergeGuestCart(guestSessionId, testUserId);

      expect(mergedCart?.items).toHaveLength(2);

      // Clean up
      await prisma.product.delete({ where: { id: product2.id } });
    });

    it('should respect stock limits when merging', async () => {
      // Create product with limited stock
      const limitedProduct = await prisma.product.create({
        data: {
          name: 'Limited Stock Product',
          slug: `limited-product-${Date.now()}`,
          description: 'Limited stock',
          price: 25.0,
          stock: 5,
          categoryId: null,
          images: [],
        },
      });

      // User cart has 3 items
      await addToCart(limitedProduct.id, 3, testUserId, null);

      // Guest cart has 4 items (total would be 7, but stock is 5)
      await addToCart(limitedProduct.id, 4, null, guestSessionId);

      // Merge
      const mergedCart = await mergeGuestCart(guestSessionId, testUserId);

      expect(mergedCart?.items).toHaveLength(1);
      expect(mergedCart?.items[0].quantity).toBe(5); // Capped at stock limit

      // Clean up
      await prisma.product.delete({ where: { id: limitedProduct.id } });
    });

    it('should handle empty guest cart merge', async () => {
      // Create empty guest cart
      await prisma.cart.create({
        data: { sessionId: guestSessionId },
      });

      // User has items
      await addToCart(testProductId, 2, testUserId, null);

      // Merge empty guest cart
      const mergedCart = await mergeGuestCart(guestSessionId, testUserId);

      expect(mergedCart?.items).toHaveLength(1);
      expect(mergedCart?.items[0].quantity).toBe(2);
    });
  });

  describe('Cart Calculations', () => {
    it('should calculate correct subtotal', async () => {
      const cart = await addToCart(testProductId, 2, testUserId, null);

      expect(cart.subtotal).toBe(100); // 2 × $50
    });

    it('should calculate correct item count', async () => {
      await addToCart(testProductId, 3, testUserId, null);

      const cart = await getCart(testUserId, null);

      expect(cart?.itemCount).toBe(3);
    });

    it('should update calculations when quantity changes', async () => {
      const cart = await addToCart(testProductId, 2, testUserId, null);
      const cartItemId = cart.items[0].id;

      const updatedCart = await updateCartItem(cartItemId, 5, testUserId);

      expect(updatedCart.itemCount).toBe(5);
      expect(updatedCart.subtotal).toBe(250); // 5 × $50
    });
  });
});
