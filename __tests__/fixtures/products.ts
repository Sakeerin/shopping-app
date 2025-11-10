import { Product, Category } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const mockCategory: Category = {
  id: 'cat-1',
  name: 'Electronics',
  slug: 'electronics',
  description: 'Electronic devices and accessories',
  image: 'https://example.com/electronics.jpg',
  parentId: null,
  displayOrder: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockProduct: Product = {
  id: 'prod-1',
  name: 'Wireless Headphones',
  slug: 'wireless-headphones',
  description:
    'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
  price: new Decimal('149.99'),
  images: ['https://example.com/headphones.jpg'],
  categoryId: 'cat-1',
  stock: 50,
  isActive: true,
  isFeatured: true,
  metaTitle: 'Premium Wireless Headphones',
  metaDescription: 'Experience superior sound quality',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockProducts: Product[] = [
  mockProduct,
  {
    id: 'prod-2',
    name: 'Smart Watch',
    slug: 'smart-watch',
    description: 'Feature-rich smartwatch with health tracking.',
    price: new Decimal('299.99'),
    images: ['https://example.com/smartwatch.jpg'],
    categoryId: 'cat-1',
    stock: 30,
    isActive: true,
    isFeatured: true,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'prod-3',
    name: 'USB-C Cable',
    slug: 'usb-c-cable',
    description: 'Durable USB-C charging cable.',
    price: new Decimal('12.99'),
    images: ['https://example.com/cable.jpg'],
    categoryId: 'cat-1',
    stock: 100,
    isActive: true,
    isFeatured: false,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    ...mockProduct,
    ...overrides,
    id: overrides.id || `prod-${Date.now()}`,
    price: overrides.price || mockProduct.price,
  };
}

export function createMockCategory(overrides: Partial<Category> = {}): Category {
  return {
    ...mockCategory,
    ...overrides,
    id: overrides.id || `cat-${Date.now()}`,
  };
}
