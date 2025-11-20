'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { verifyPurchase, hasUserReviewed } from '@/services/reviews';

// ============================================================================
// T174-T177: REVIEW SERVER ACTIONS (Phase 8 - User Story 5)
// ============================================================================

interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Helper to get user session
async function getUserSession() {
  const session = await getServerSession();
  return session?.user;
}

// ============================================================================
// T174: SUBMIT REVIEW ACTION
// ============================================================================

const submitReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().optional(),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be at most 1000 characters'),
});

export async function submitReview(data: any): Promise<ActionResult> {
  try {
    const user = await getUserSession();
    if (!user || !user.id) {
      return { success: false, error: 'Unauthorized: Please sign in to submit a review' };
    }

    // Validate input
    const validated = submitReviewSchema.parse(data);

    // Check if user has already reviewed this product
    const alreadyReviewed = await hasUserReviewed(user.id, validated.productId);
    if (alreadyReviewed) {
      return {
        success: false,
        error: 'You have already reviewed this product. You can update your existing review instead.',
      };
    }

    // Verify if user has purchased this product
    const isVerifiedPurchase = await verifyPurchase(user.id, validated.productId);

    // Create review
    const review = await prisma.review.create({
      data: {
        productId: validated.productId,
        userId: user.id,
        rating: validated.rating,
        title: validated.title || null,
        comment: validated.comment,
        isVerifiedPurchase,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    revalidatePath(`/products/${validated.productId}`);
    revalidatePath('/products');

    return {
      success: true,
      data: review,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }
    return {
      success: false,
      error: error.message || 'Failed to submit review',
    };
  }
}

// ============================================================================
// T175: UPDATE REVIEW ACTION
// ============================================================================

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().optional(),
  comment: z.string().min(10).max(1000).optional(),
});

export async function updateReview(
  reviewId: string,
  data: any
): Promise<ActionResult> {
  try {
    const user = await getUserSession();
    if (!user || !user.id) {
      return { success: false, error: 'Unauthorized: Please sign in' };
    }

    // Validate input
    const validated = updateReviewSchema.parse(data);

    // Check if review exists and belongs to user
    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existing) {
      return { success: false, error: 'Review not found' };
    }

    if (existing.userId !== user.id) {
      return {
        success: false,
        error: 'Unauthorized: You can only update your own reviews',
      };
    }

    // Update review
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(validated.rating !== undefined && { rating: validated.rating }),
        ...(validated.title !== undefined && { title: validated.title || null }),
        ...(validated.comment !== undefined && { comment: validated.comment }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    revalidatePath(`/products/${existing.productId}`);

    return {
      success: true,
      data: review,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }
    return {
      success: false,
      error: error.message || 'Failed to update review',
    };
  }
}

// ============================================================================
// T176: DELETE REVIEW ACTION
// ============================================================================

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  try {
    const user = await getUserSession();
    if (!user || !user.id) {
      return { success: false, error: 'Unauthorized: Please sign in' };
    }

    // Check if review exists
    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existing) {
      return { success: false, error: 'Review not found' };
    }

    // Check if user owns the review or is an admin
    if (existing.userId !== user.id && user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Unauthorized: You can only delete your own reviews',
      };
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    revalidatePath(`/products/${existing.productId}`);

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to delete review',
    };
  }
}

// ============================================================================
// T177: MARK REVIEW HELPFUL ACTION
// ============================================================================

export async function markReviewHelpful(reviewId: string): Promise<ActionResult> {
  try {
    const user = await getUserSession();
    if (!user || !user.id) {
      return { success: false, error: 'Unauthorized: Please sign in' };
    }

    // Check if review exists
    const existing = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existing) {
      return { success: false, error: 'Review not found' };
    }

    // Increment helpful count
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });

    revalidatePath(`/products/${existing.productId}`);

    return {
      success: true,
      data: review,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to mark review as helpful',
    };
  }
}
