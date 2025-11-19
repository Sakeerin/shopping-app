'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

// ============================================================================
// T151: CREATE PROMO CODE ACTION (Phase 7 - User Story 6)
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

// Helper to check admin authorization
async function requireAdmin() {
  const user = await getUserSession();
  if (!user || user.role !== 'ADMIN') {
    return { authorized: false, user: null };
  }
  return { authorized: true, user };
}

// ============================================================================
// T151: CREATE PROMO CODE
// ============================================================================

const createPromoCodeSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be at most 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
  discountType: z.enum(['PERCENTAGE', 'FIXED'], {
    errorMap: () => ({ message: 'Discount type must be PERCENTAGE or FIXED' }),
  }),
  discountValue: z.number().positive('Discount value must be positive'),
  minPurchase: z.number().min(0, 'Minimum purchase must be non-negative').optional(),
  maxUses: z.number().int().positive('Max uses must be a positive integer').optional(),
  expiresAt: z.date().optional(),
  isActive: z.boolean().optional(),
});

export async function createPromoCode(data: any): Promise<ActionResult> {
  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Validate input
    const validated = createPromoCodeSchema.parse({
      ...data,
      // Convert date string to Date object if provided
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });

    // Additional validation for PERCENTAGE type
    if (validated.discountType === 'PERCENTAGE') {
      if (validated.discountValue > 100) {
        return {
          success: false,
          error: 'Percentage discount cannot exceed 100%',
        };
      }
    }

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: validated.code },
    });

    if (existing) {
      return {
        success: false,
        error: 'Promo code already exists',
      };
    }

    // Validate expiration date is in the future
    if (validated.expiresAt && validated.expiresAt <= new Date()) {
      return {
        success: false,
        error: 'Expiration date must be in the future',
      };
    }

    // Create promo code
    const promoCode = await prisma.promoCode.create({
      data: {
        code: validated.code,
        discountType: validated.discountType,
        discountValue: validated.discountValue,
        minPurchase: validated.minPurchase || 0,
        maxUses: validated.maxUses,
        usedCount: 0,
        expiresAt: validated.expiresAt,
        isActive: validated.isActive !== false,
      },
    });

    revalidatePath('/admin/promotions');

    return {
      success: true,
      data: promoCode,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }
    if (error.code === 'P2002') {
      return { success: false, error: 'Promo code already exists' };
    }
    return {
      success: false,
      error: error.message || 'Failed to create promo code',
    };
  }
}
