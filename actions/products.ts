'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

// ============================================================================
// T146-T149: ADMIN PRODUCT ACTIONS (Phase 7 - User Story 6)
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
// T146: CREATE PRODUCT
// ============================================================================

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function createProduct(data: any): Promise<ActionResult> {
  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Validate input
    const validated = createProductSchema.parse(data);

    // Create product
    const product = await prisma.product.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        price: validated.price,
        categoryId: validated.categoryId,
        stock: validated.stock,
        images: validated.images,
        isFeatured: validated.isFeatured || false,
        isActive: validated.isActive !== false,
      },
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      data: product,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation error' };
    }
    if (error.code === 'P2002') {
      return { success: false, error: 'Product slug already exists' };
    }
    return { success: false, error: error.message || 'Failed to create product' };
  }
}

// ============================================================================
// T147: UPDATE PRODUCT
// ============================================================================

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  categoryId: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function updateProduct(productId: string, data: any): Promise<ActionResult> {
  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Check product exists
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return { success: false, error: 'Product not found' };
    }

    // Validate input
    const validated = updateProductSchema.parse(data);

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: validated,
    });

    revalidatePath('/admin/products');
    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      data: product,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation error' };
    }
    return { success: false, error: error.message || 'Failed to update product' };
  }
}

// ============================================================================
// T148: DELETE PRODUCT (Soft Delete)
// ============================================================================

export async function deleteProduct(productId: string): Promise<ActionResult> {
  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Check product exists
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return { success: false, error: 'Product not found' };
    }

    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      data: { message: 'Product deleted successfully' },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete product' };
  }
}

// ============================================================================
// T149: CREATE CATEGORY
// ============================================================================

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  displayOrder: z.number().int().optional(),
});

export async function createCategory(data: any): Promise<ActionResult> {
  try {
    const { authorized } = await requireAdmin();
    if (!authorized) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    // Validate input
    const validated = createCategorySchema.parse(data);

    // Create category
    const category = await prisma.category.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        parentId: validated.parentId || null,
        displayOrder: validated.displayOrder || 0,
      },
    });

    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      data: category,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Validation error' };
    }
    if (error.code === 'P2002') {
      return { success: false, error: 'Category slug already exists' };
    }
    return { success: false, error: error.message || 'Failed to create category' };
  }
}
