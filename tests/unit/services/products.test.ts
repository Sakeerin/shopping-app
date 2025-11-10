import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getProducts, getProductBySlug, getCategories, getFeaturedProducts } from '@/services/products';
import { prisma } from '@/lib/db';

// ============================================================================
// PRODUCT SERVICES UNIT TESTS
// ============================================================================

vi.mock('@/lib/db', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  },
}));

describe('Product Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return paginated products with default filters', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          slug: 'product-1',
          price: 29.99,
          images: ['image1.jpg'],
          category: { id: 'cat1', name: 'Category 1' },
          reviews: [{ rating: 5 }, { rating: 4 }],
          isFeatured: true,
        },
      ];

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);
      vi.mocked(prisma.product.count).mockResolvedValue(1);

      const result = await getProducts();

      expect(result.products).toHaveLength(1);
      expect(result.products[0].averageRating).toBe(4.5);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter products by category', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.product.count).mockResolvedValue(0);

      await getProducts({ categoryId: 'cat1' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat1',
          }),
        })
      );
    });

    it('should filter products by price range', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.product.count).mockResolvedValue(0);

      await getProducts({ minPrice: 10, maxPrice: 50 });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 10, lte: 50 },
          }),
        })
      );
    });

    it('should search products by name and description', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.product.count).mockResolvedValue(0);

      await getProducts({ search: 'test' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should sort products by price ascending', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.product.count).mockResolvedValue(0);

      await getProducts({ sortBy: 'price_asc' });

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { price: 'asc' },
        })
      );
    });
  });

  describe('getProductBySlug', () => {
    it('should return product with reviews and ratings', async () => {
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        slug: 'product-1',
        price: 29.99,
        images: ['image1.jpg'],
        category: { id: 'cat1', name: 'Category 1' },
        variants: [],
        reviews: [
          { rating: 5, user: { name: 'User 1', image: null }, createdAt: new Date() },
          { rating: 3, user: { name: 'User 2', image: null }, createdAt: new Date() },
        ],
      };

      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);

      const result = await getProductBySlug('product-1');

      expect(result).toBeDefined();
      expect(result?.averageRating).toBe(4);
      expect(result?.reviewCount).toBe(2);
    });

    it('should return null for non-existent product', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const result = await getProductBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getCategories', () => {
    it('should return category tree with product counts', async () => {
      const mockCategories = [
        { id: 'cat1', name: 'Category 1', parentId: null, displayOrder: 1 },
        { id: 'cat2', name: 'Category 2', parentId: 'cat1', displayOrder: 2 },
      ];

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any);
      vi.mocked(prisma.product.count).mockResolvedValue(5);

      const result = await getCategories();

      expect(result).toHaveLength(1); // Only root categories
      expect(result[0].children).toHaveLength(1); // Child category
      expect(result[0].productCount).toBe(5);
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return featured products with limit', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Featured 1',
          slug: 'featured-1',
          price: 39.99,
          images: ['image1.jpg'],
          category: { id: 'cat1', name: 'Category 1' },
          reviews: [],
          isFeatured: true,
        },
      ];

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);

      const result = await getFeaturedProducts(5);

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true, isFeatured: true },
          take: 5,
        })
      );
      expect(result).toHaveLength(1);
    });
  });
});
