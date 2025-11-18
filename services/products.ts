import { prisma } from '@/lib/db';
import type {
  ProductFilters,
  ProductListResponse,
  ProductCardData,
  ProductDetailData,
  CategoryTree,
} from '@/types/product';

// ============================================================================
// PRODUCT SERVICES
// ============================================================================

export async function getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
  const {
    categoryId,
    minPrice,
    maxPrice,
    search,
    sortBy = 'newest',
    page = 1,
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    isActive: true,
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Build orderBy clause
  let orderBy: any = {};
  switch (sortBy) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'name_asc':
      orderBy = { name: 'asc' };
      break;
    case 'name_desc':
      orderBy = { name: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  // Fetch products and total count
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        reviews: {
          select: { rating: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Transform to ProductCardData
  const productCards: ProductCardData[] = products.map((product) => {
    const ratings = product.reviews.map((r) => r.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : undefined;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      images: product.images,
      categoryName: product.category.name,
      isFeatured: product.isFeatured,
      averageRating,
      reviewCount: product.reviews.length,
    };
  });

  return {
    products: productCards,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetailData | null> {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      variants: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) return null;

  const ratings = product.reviews.map((r) => r.rating);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : 0;

  return {
    ...product,
    averageRating,
    reviewCount: product.reviews.length,
  };
}

export async function getCategories(): Promise<CategoryTree[]> {
  // Fetch all categories
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  // Get product counts for each category
  const productCounts = await Promise.all(
    categories.map(async (category) => {
      const count = await prisma.product.count({
        where: { categoryId: category.id, isActive: true },
      });
      return { id: category.id, count };
    })
  );

  const countMap = Object.fromEntries(productCounts.map((pc) => [pc.id, pc.count]));

  // Build category tree
  const categoryMap = new Map<string, CategoryTree>();
  const rootCategories: CategoryTree[] = [];

  // Initialize all categories
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
      productCount: countMap[cat.id] || 0,
    });
  });

  // Build tree structure
  categories.forEach((cat) => {
    const categoryNode = categoryMap.get(cat.id)!;
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(categoryNode);
      }
    } else {
      rootCategories.push(categoryNode);
    }
  });

  return rootCategories;
}

export async function getFeaturedProducts(limit: number = 8): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      category: true,
      reviews: {
        select: { rating: true },
      },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  return products.map((product) => {
    const ratings = product.reviews.map((r) => r.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : undefined;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      images: product.images,
      categoryName: product.category.name,
      isFeatured: product.isFeatured,
      averageRating,
      reviewCount: product.reviews.length,
    };
  });
}

// ============================================================================
// T131: SEARCH PRODUCTS SERVICE (Phase 6 - User Story 3)
// ============================================================================

export async function searchProducts(
  query: string,
  options: { page?: number; limit?: number } = {}
): Promise<ProductListResponse> {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  if (!query || query.length < 2) {
    return {
      products: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // PostgreSQL full-text search using case-insensitive pattern matching
  const where: any = {
    isActive: true,
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      {
        category: {
          name: { contains: query, mode: 'insensitive' },
        },
      },
    ],
  };

  // Fetch products and total count
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: [
        { isFeatured: 'desc' }, // Featured products first
        { createdAt: 'desc' }, // Then newest
      ],
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Transform to ProductCardData
  const productCards: ProductCardData[] = products.map((product) => {
    const ratings = product.reviews.map((r) => r.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : undefined;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      images: product.images,
      categoryName: product.category.name,
      isFeatured: product.isFeatured,
      averageRating,
      reviewCount: product.reviews.length,
    };
  });

  return {
    products: productCards,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============================================================================
// T132: FILTER PRODUCTS SERVICE (Phase 6 - User Story 3)
// ============================================================================

interface FilterOptions {
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
  page?: number;
  limit?: number;
}

export async function filterProducts(options: FilterOptions = {}): Promise<ProductListResponse> {
  const {
    categoryIds,
    minPrice,
    maxPrice,
    inStock,
    sortBy = 'newest',
    page = 1,
    limit = 20,
  } = options;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    isActive: true,
  };

  // Category filter - support multiple categories
  if (categoryIds && categoryIds.length > 0) {
    where.categoryId = { in: categoryIds };
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  // Stock availability filter
  if (inStock) {
    where.stock = { gt: 0 };
  }

  // Build orderBy clause
  let orderBy: any = {};
  switch (sortBy) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'name_asc':
      orderBy = { name: 'asc' };
      break;
    case 'name_desc':
      orderBy = { name: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  // Fetch products and total count
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        reviews: {
          select: { rating: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Transform to ProductCardData
  const productCards: ProductCardData[] = products.map((product) => {
    const ratings = product.reviews.map((r) => r.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : undefined;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      images: product.images,
      categoryName: product.category.name,
      isFeatured: product.isFeatured,
      averageRating,
      reviewCount: product.reviews.length,
    };
  });

  return {
    products: productCards,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
