import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitReview, updateReview, deleteReview, markReviewHelpful } from '@/actions/reviews';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// ============================================================================
// T170: UNIT TESTS FOR REVIEW ACTIONS (Phase 8 - User Story 5)
// ============================================================================

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    review: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    orderItem: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Review Actions', () => {
  const mockUserSession = {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
      role: 'CUSTOMER',
    },
  };

  const mockAdminSession = {
    user: {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitReview', () => {
    const validReviewData = {
      productId: 'product-1',
      rating: 5,
      title: 'Great product!',
      comment: 'I really enjoyed this product. Highly recommended!',
    };

    it('should submit review with verified purchase', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);
      vi.mocked(prisma.orderItem.findFirst).mockResolvedValue({
        id: 'order-item-1',
        orderId: 'order-1',
        productId: 'product-1',
        quantity: 1,
        price: 99.99,
      } as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.review.create).mockResolvedValue({
        id: 'review-1',
        productId: 'product-1',
        userId: 'user-1',
        rating: 5,
        title: 'Great product!',
        comment: 'I really enjoyed this product. Highly recommended!',
        helpfulCount: 0,
        isVerifiedPurchase: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await submitReview(validReviewData);

      expect(result.success).toBe(true);
      expect(result.data?.isVerifiedPurchase).toBe(true);
      expect(prisma.review.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'product-1',
          userId: 'user-1',
          rating: 5,
          title: 'Great product!',
          comment: 'I really enjoyed this product. Highly recommended!',
          isVerifiedPurchase: true,
        }),
      });
    });

    it('should submit review without verified purchase', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);
      vi.mocked(prisma.orderItem.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.review.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.review.create).mockResolvedValue({
        id: 'review-1',
        productId: 'product-1',
        userId: 'user-1',
        rating: 4,
        title: null,
        comment: 'Good product',
        helpfulCount: 0,
        isVerifiedPurchase: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await submitReview({
        productId: 'product-1',
        rating: 4,
        comment: 'Good product',
      });

      expect(result.success).toBe(true);
      expect(result.data?.isVerifiedPurchase).toBe(false);
    });

    it('should reject unauthenticated users', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await submitReview(validReviewData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should validate rating is between 1 and 5', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);

      const result = await submitReview({
        productId: 'product-1',
        rating: 6,
        comment: 'Invalid rating',
      });

      expect(result.success).toBe(false);
    });

    it('should prevent duplicate reviews', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);
      vi.mocked(prisma.orderItem.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'existing-review',
        productId: 'product-1',
        userId: 'user-1',
        rating: 4,
        title: null,
        comment: 'Previous review',
        helpfulCount: 0,
        isVerifiedPurchase: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await submitReview(validReviewData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already reviewed');
    });

    it('should validate comment is not empty', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);

      const result = await submitReview({
        productId: 'product-1',
        rating: 5,
        comment: '',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('updateReview', () => {
    it('should update own review', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        productId: 'product-1',
        userId: 'user-1',
        rating: 4,
        title: 'Good',
        comment: 'Nice product',
        helpfulCount: 5,
        isVerifiedPurchase: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(prisma.review.update).mockResolvedValue({
        id: 'review-1',
        productId: 'product-1',
        userId: 'user-1',
        rating: 5,
        title: 'Excellent!',
        comment: 'Updated: Amazing product!',
        helpfulCount: 5,
        isVerifiedPurchase: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await updateReview('review-1', {
        rating: 5,
        title: 'Excellent!',
        comment: 'Updated: Amazing product!',
      });

      expect(result.success).toBe(true);
      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: 'review-1' },
        data: expect.objectContaining({
          rating: 5,
          title: 'Excellent!',
          comment: 'Updated: Amazing product!',
        }),
      });
    });

    it('should reject update by non-owner', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        productId: 'product-1',
        userId: 'other-user',
        rating: 4,
        title: 'Good',
        comment: 'Nice product',
        helpfulCount: 5,
        isVerifiedPurchase: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await updateReview('review-1', {
        rating: 5,
        comment: 'Updated',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should reject non-existent review', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue(null);

      const result = await updateReview('non-existent', {
        rating: 5,
        comment: 'Updated',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('deleteReview', () => {
    it('should delete own review', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        productId: 'product-1',
        userId: 'user-1',
        rating: 4,
        title: 'Good',
        comment: 'Nice product',
        helpfulCount: 5,
        isVerifiedPurchase: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(prisma.review.delete).mockResolvedValue({} as any);

      const result = await deleteReview('review-1');

      expect(result.success).toBe(true);
      expect(prisma.review.delete).toHaveBeenCalledWith({
        where: { id: 'review-1' },
      });
    });

    it('should allow admin to delete any review', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        productId: 'product-1',
        userId: 'user-1',
        rating: 1,
        title: 'Bad',
        comment: 'Inappropriate content',
        helpfulCount: 0,
        isVerifiedPurchase: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(prisma.review.delete).mockResolvedValue({} as any);

      const result = await deleteReview('review-1');

      expect(result.success).toBe(true);
      expect(prisma.review.delete).toHaveBeenCalled();
    });

    it('should reject delete by non-owner non-admin', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        productId: 'product-1',
        userId: 'other-user',
        rating: 4,
        title: 'Good',
        comment: 'Nice product',
        helpfulCount: 5,
        isVerifiedPurchase: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await deleteReview('review-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });
  });

  describe('markReviewHelpful', () => {
    it('should increment helpful count', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue({
        id: 'review-1',
        productId: 'product-1',
        userId: 'other-user',
        rating: 5,
        title: 'Excellent',
        comment: 'Great product!',
        helpfulCount: 10,
        isVerifiedPurchase: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      vi.mocked(prisma.review.update).mockResolvedValue({
        id: 'review-1',
        productId: 'product-1',
        userId: 'other-user',
        rating: 5,
        title: 'Excellent',
        comment: 'Great product!',
        helpfulCount: 11,
        isVerifiedPurchase: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await markReviewHelpful('review-1');

      expect(result.success).toBe(true);
      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: 'review-1' },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      });
    });

    it('should require authentication', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await markReviewHelpful('review-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should handle non-existent review', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);
      vi.mocked(prisma.review.findUnique).mockResolvedValue(null);

      const result = await markReviewHelpful('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
