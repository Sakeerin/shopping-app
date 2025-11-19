import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createProduct, updateProduct, deleteProduct, createCategory } from '@/actions/products';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// ============================================================================
// T139: PRODUCT ACTIONS UNIT TESTS (Phase 7 - User Story 6)
// ============================================================================

vi.mock('@/lib/db', () => ({
  prisma: {
    product: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    category: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
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

describe('Product Actions - Admin', () => {
  const mockAdminSession = {
    user: {
      id: 'admin1',
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  };

  const mockUserSession = {
    user: {
      id: 'user1',
      email: 'user@example.com',
      role: 'CUSTOMER',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    const validProductData = {
      name: 'New Product',
      slug: 'new-product',
      description: 'A new test product',
      price: 99.99,
      categoryId: 'cat1',
      stock: 100,
      images: ['image1.jpg', 'image2.jpg'],
      isFeatured: false,
      isActive: true,
    };

    it('should create product as admin', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.product.create).mockResolvedValue({
        id: 'prod1',
        ...validProductData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await createProduct(validProductData);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('New Product');
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: validProductData,
      });
    });

    it('should reject creation for non-admin users', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);

      const result = await createProduct(validProductData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('should reject creation for unauthenticated users', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await createProduct(validProductData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should validate required fields', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);

      const invalidData = { ...validProductData, name: '' };
      const result = await createProduct(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate price is positive', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);

      const invalidData = { ...validProductData, price: -10 };
      const result = await createProduct(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('price');
    });

    it('should validate stock is non-negative', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);

      const invalidData = { ...validProductData, stock: -5 };
      const result = await createProduct(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('stock');
    });

    it('should handle duplicate slug error', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.product.create).mockRejectedValue({
        code: 'P2002',
        meta: { target: ['slug'] },
      });

      const result = await createProduct(validProductData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('slug');
    });
  });

  describe('updateProduct', () => {
    const updateData = {
      name: 'Updated Product',
      price: 149.99,
      stock: 50,
    };

    it('should update product as admin', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: 'prod1',
        name: 'Old Product',
      } as any);
      vi.mocked(prisma.product.update).mockResolvedValue({
        id: 'prod1',
        ...updateData,
      } as any);

      const result = await updateProduct('prod1', updateData);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Product');
    });

    it('should reject update for non-admin users', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);

      const result = await updateProduct('prod1', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should handle non-existent product', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const result = await updateProduct('nonexistent', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete product as admin', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: 'prod1',
        isActive: true,
      } as any);
      vi.mocked(prisma.product.update).mockResolvedValue({
        id: 'prod1',
        isActive: false,
      } as any);

      const result = await deleteProduct('prod1');

      expect(result.success).toBe(true);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod1' },
        data: { isActive: false },
      });
    });

    it('should reject deletion for non-admin users', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);

      const result = await deleteProduct('prod1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should handle non-existent product', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const result = await deleteProduct('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('createCategory', () => {
    const categoryData = {
      name: 'New Category',
      slug: 'new-category',
      description: 'A new category',
      displayOrder: 1,
    };

    it('should create category as admin', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);
      vi.mocked(prisma.category.create).mockResolvedValue({
        id: 'cat1',
        ...categoryData,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await createCategory(categoryData);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('New Category');
    });

    it('should reject creation for non-admin users', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockUserSession as any);

      const result = await createCategory(categoryData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should validate required fields', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession as any);

      const invalidData = { ...categoryData, name: '' };
      const result = await createCategory(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
