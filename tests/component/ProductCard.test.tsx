import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/products/product-card';
import type { ProductCardData } from '@/types/product';

// ============================================================================
// PRODUCT CARD COMPONENT TESTS
// ============================================================================

describe('ProductCard Component', () => {
  const mockProduct: ProductCardData = {
    id: 'prod1',
    name: 'Test Product',
    slug: 'test-product',
    price: 29.99,
    images: ['test-image.jpg'],
    categoryName: 'Test Category',
    isFeatured: false,
    averageRating: 4.5,
    reviewCount: 10,
  };

  it('should render product information correctly', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(10)')).toBeInTheDocument();
  });

  it('should display featured badge for featured products', () => {
    const featuredProduct = { ...mockProduct, isFeatured: true };
    render(<ProductCard product={featuredProduct} />);

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('should not display rating if no reviews', () => {
    const noReviewProduct = { ...mockProduct, averageRating: undefined, reviewCount: 0 };
    render(<ProductCard product={noReviewProduct} />);

    expect(screen.queryByText('★')).not.toBeInTheDocument();
  });

  it('should have correct link to product detail page', () => {
    render(<ProductCard product={mockProduct} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/products/test-product');
  });

  it('should render product image with correct alt text', () => {
    render(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
  });

  it('should display View button', () => {
    render(<ProductCard product={mockProduct} />);

    const viewButton = screen.getByText('View');
    expect(viewButton).toBeInTheDocument();
    expect(viewButton.closest('a')).toHaveAttribute('href', '/products/test-product');
  });
});
