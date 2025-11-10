import { Product, Category, ProductVariant, Review } from '@prisma/client';

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export type ProductWithCategory = Product & {
  category: Category;
};

export type ProductWithRelations = Product & {
  category: Category;
  variants: ProductVariant[];
  reviews: Review[];
};

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categoryName: string;
  isFeatured: boolean;
  averageRating?: number;
  reviewCount?: number;
};

export type ProductListResponse = {
  products: ProductCardData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProductDetailData = ProductWithRelations & {
  averageRating: number;
  reviewCount: number;
};

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export type CategoryWithCount = Category & {
  productCount: number;
};

export type CategoryTree = Category & {
  children: CategoryTree[];
  productCount: number;
};

// ============================================================================
// FILTER TYPES
// ============================================================================

export type ProductFilters = {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';
  page?: number;
  limit?: number;
};

export type PriceRange = {
  min: number;
  max: number;
};
