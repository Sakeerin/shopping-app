import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applyPromoCode, removePromoCode, mergeGuestCart } from '@/actions/cart';
import * as cartService from '@/services/cart';
import { getServerSession } from 'next-auth';

// ============================================================================
// CART ACTIONS UNIT TESTS (T115)
// ============================================================================

vi.mock('@/services/cart', () => ({
  validatePromoCode: vi.fn(),
  calculateDiscount: vi.fn(),
  mergeGuestCart: vi.fn(),
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Cart Actions - Promo Code', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('applyPromoCode', () => {
    const mockPromoCode = {
      id: 'promo1',
      code: 'SAVE20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxDiscount: 50,
      minPurchase: 10,
      usageLimit: 100,
      usageCount: 5,
      perUserLimit: 1,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      isActive: true,
    };

    it('should successfully apply valid promo code', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cartService.validatePromoCode).mockResolvedValue({
        valid: true,
        promoCode: mockPromoCode,
      });
      vi.mocked(cartService.calculateDiscount).mockReturnValue(20);

      const result = await applyPromoCode('SAVE20', 100);

      expect(result.success).toBe(true);
      expect(result.data?.code).toBe('SAVE20');
      expect(result.data?.discount).toBe(20);
      expect(result.data?.discountType).toBe('PERCENTAGE');
      expect(cartService.validatePromoCode).toHaveBeenCalledWith('SAVE20', null, 100);
      expect(cartService.calculateDiscount).toHaveBeenCalledWith(100, mockPromoCode);
    });

    it('should apply promo code for logged-in user', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1', email: 'user@example.com' },
      } as any);
      vi.mocked(cartService.validatePromoCode).mockResolvedValue({
        valid: true,
        promoCode: mockPromoCode,
      });
      vi.mocked(cartService.calculateDiscount).mockReturnValue(20);

      const result = await applyPromoCode('SAVE20', 100);

      expect(result.success).toBe(true);
      expect(cartService.validatePromoCode).toHaveBeenCalledWith('SAVE20', 'user1', 100);
    });

    it('should convert code to uppercase', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cartService.validatePromoCode).mockResolvedValue({
        valid: true,
        promoCode: mockPromoCode,
      });
      vi.mocked(cartService.calculateDiscount).mockReturnValue(20);

      const result = await applyPromoCode('save20', 100);

      expect(result.success).toBe(true);
      expect(result.data?.code).toBe('SAVE20');
    });

    it('should reject invalid promo code', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cartService.validatePromoCode).mockResolvedValue({
        valid: false,
        error: 'Invalid promo code',
      });

      const result = await applyPromoCode('INVALID', 100);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid promo code');
    });

    it('should reject expired promo code', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cartService.validatePromoCode).mockResolvedValue({
        valid: false,
        error: 'This promo code has expired',
      });

      const result = await applyPromoCode('EXPIRED', 100);

      expect(result.success).toBe(false);
      expect(result.error).toBe('This promo code has expired');
    });

    it('should reject promo code below minimum purchase', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cartService.validatePromoCode).mockResolvedValue({
        valid: false,
        error: 'Minimum purchase of $50.00 required',
      });

      const result = await applyPromoCode('SAVE20', 30);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Minimum purchase of $50.00 required');
    });

    it('should reject empty promo code', async () => {
      const result = await applyPromoCode('', 100);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Promo code is required');
    });

    it('should calculate discount with percentage type', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cartService.validatePromoCode).mockResolvedValue({
        valid: true,
        promoCode: mockPromoCode,
      });
      vi.mocked(cartService.calculateDiscount).mockReturnValue(20);

      const result = await applyPromoCode('SAVE20', 100);

      expect(result.success).toBe(true);
      expect(result.data?.discountType).toBe('PERCENTAGE');
      expect(result.data?.discountValue).toBe(20);
    });

    it('should calculate discount with fixed type', async () => {
      const fixedPromo = {
        ...mockPromoCode,
        discountType: 'FIXED',
        discountValue: 15,
      };

      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cartService.validatePromoCode).mockResolvedValue({
        valid: true,
        promoCode: fixedPromo,
      });
      vi.mocked(cartService.calculateDiscount).mockReturnValue(15);

      const result = await applyPromoCode('SAVE15', 100);

      expect(result.success).toBe(true);
      expect(result.data?.discountType).toBe('FIXED');
      expect(result.data?.discount).toBe(15);
    });

    it('should respect max discount limit', async () => {
      const promoWithMax = {
        ...mockPromoCode,
        discountType: 'PERCENTAGE',
        discountValue: 20,
        maxDiscount: 10,
      };

      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cartService.validatePromoCode).mockResolvedValue({
        valid: true,
        promoCode: promoWithMax,
      });
      vi.mocked(cartService.calculateDiscount).mockReturnValue(10);

      const result = await applyPromoCode('SAVE20', 100);

      expect(result.success).toBe(true);
      expect(result.data?.promoCode.maxDiscount).toBe(10);
    });
  });

  describe('removePromoCode', () => {
    it('should successfully remove promo code', async () => {
      const result = await removePromoCode();

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Promo code removed');
    });
  });

  describe('mergeGuestCart', () => {
    it('should successfully merge guest cart with user cart', async () => {
      const mockCart = {
        id: 'cart1',
        userId: 'user1',
        sessionId: null,
        items: [],
        itemCount: 2,
        subtotal: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1', email: 'user@example.com' },
      } as any);
      vi.mocked(cartService.mergeGuestCart).mockResolvedValue(mockCart);

      const result = await mergeGuestCart('guest-session-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCart);
      expect(cartService.mergeGuestCart).toHaveBeenCalledWith('guest-session-123', 'user1');
    });

    it('should fail if user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await mergeGuestCart('guest-session-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
    });

    it('should handle merge errors gracefully', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user1', email: 'user@example.com' },
      } as any);
      vi.mocked(cartService.mergeGuestCart).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await mergeGuestCart('guest-session-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connection failed');
    });
  });
});
