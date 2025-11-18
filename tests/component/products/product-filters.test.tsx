import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductFilters } from '@/components/products/product-filters';

// ============================================================================
// PRODUCT FILTERS COMPONENT TESTS (T130 - Phase 6: User Story 3)
// ============================================================================

describe('ProductFilters Component', () => {
  const mockCategories = [
    { id: 'cat1', name: 'Electronics', slug: 'electronics', productCount: 15 },
    { id: 'cat2', name: 'Clothing', slug: 'clothing', productCount: 25 },
    { id: 'cat3', name: 'Books', slug: 'books', productCount: 10 },
  ];

  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render filter sections', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByText(/categories/i)).toBeInTheDocument();
      expect(screen.getByText(/price range/i)).toBeInTheDocument();
      expect(screen.getByText(/availability/i)).toBeInTheDocument();
    });

    it('should render all categories', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('Books')).toBeInTheDocument();
    });

    it('should display product counts for categories', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByText('(15)')).toBeInTheDocument();
      expect(screen.getByText('(25)')).toBeInTheDocument();
      expect(screen.getByText('(10)')).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('should toggle category selection', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const electronicsCheckbox = screen.getByLabelText(/electronics/i);

      fireEvent.click(electronicsCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryIds: ['cat1'],
        })
      );
    });

    it('should allow multiple category selection', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const electronicsCheckbox = screen.getByLabelText(/electronics/i);
      const clothingCheckbox = screen.getByLabelText(/clothing/i);

      fireEvent.click(electronicsCheckbox);
      fireEvent.click(clothingCheckbox);

      expect(mockOnFilterChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          categoryIds: expect.arrayContaining(['cat1', 'cat2']),
        })
      );
    });

    it('should unselect category on second click', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const electronicsCheckbox = screen.getByLabelText(/electronics/i);

      fireEvent.click(electronicsCheckbox);
      fireEvent.click(electronicsCheckbox);

      expect(mockOnFilterChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          categoryIds: [],
        })
      );
    });
  });

  describe('Price Range Filtering', () => {
    it('should update min price', async () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const minPriceInput = screen.getByLabelText(/min price/i);

      fireEvent.change(minPriceInput, { target: { value: '50' } });

      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            minPrice: 50,
          })
        );
      });
    });

    it('should update max price', async () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const maxPriceInput = screen.getByLabelText(/max price/i);

      fireEvent.change(maxPriceInput, { target: { value: '500' } });

      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            maxPrice: 500,
          })
        );
      });
    });

    it('should handle both min and max price', async () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const minPriceInput = screen.getByLabelText(/min price/i);
      const maxPriceInput = screen.getByLabelText(/max price/i);

      fireEvent.change(minPriceInput, { target: { value: '50' } });
      fireEvent.change(maxPriceInput, { target: { value: '500' } });

      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            minPrice: 50,
            maxPrice: 500,
          })
        );
      });
    });

    it('should clear price filters', async () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const minPriceInput = screen.getByLabelText(/min price/i);

      fireEvent.change(minPriceInput, { target: { value: '50' } });
      fireEvent.change(minPriceInput, { target: { value: '' } });

      await waitFor(() => {
        expect(mockOnFilterChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            minPrice: undefined,
          })
        );
      });
    });
  });

  describe('Stock Availability Filtering', () => {
    it('should toggle in stock filter', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const inStockCheckbox = screen.getByLabelText(/in stock only/i);

      fireEvent.click(inStockCheckbox);

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          inStock: true,
        })
      );
    });

    it('should uncheck in stock filter', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const inStockCheckbox = screen.getByLabelText(/in stock only/i);

      fireEvent.click(inStockCheckbox);
      fireEvent.click(inStockCheckbox);

      expect(mockOnFilterChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inStock: false,
        })
      );
    });
  });

  describe('Clear All Filters', () => {
    it('should clear all filters on button click', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      // Apply some filters
      const electronicsCheckbox = screen.getByLabelText(/electronics/i);
      const minPriceInput = screen.getByLabelText(/min price/i);

      fireEvent.click(electronicsCheckbox);
      fireEvent.change(minPriceInput, { target: { value: '50' } });

      // Clear all
      const clearButton = screen.getByText(/clear all/i);
      fireEvent.click(clearButton);

      expect(mockOnFilterChange).toHaveBeenLastCalledWith({
        categoryIds: [],
        minPrice: undefined,
        maxPrice: undefined,
        inStock: false,
      });
    });

    it('should show clear button only when filters applied', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      // Initially no clear button (or disabled)
      const clearButton = screen.queryByText(/clear all/i);
      expect(clearButton).toBeDisabled();

      // Apply filter
      const electronicsCheckbox = screen.getByLabelText(/electronics/i);
      fireEvent.click(electronicsCheckbox);

      // Clear button should be enabled
      expect(screen.getByText(/clear all/i)).not.toBeDisabled();
    });
  });

  describe('Filter Persistence', () => {
    it('should display initial selected filters', () => {
      render(
        <ProductFilters
          categories={mockCategories}
          onFilterChange={mockOnFilterChange}
          initialFilters={{
            categoryIds: ['cat1'],
            minPrice: 50,
            maxPrice: 500,
            inStock: true,
          }}
        />
      );

      const electronicsCheckbox = screen.getByLabelText(/electronics/i) as HTMLInputElement;
      const minPriceInput = screen.getByLabelText(/min price/i) as HTMLInputElement;
      const maxPriceInput = screen.getByLabelText(/max price/i) as HTMLInputElement;
      const inStockCheckbox = screen.getByLabelText(/in stock only/i) as HTMLInputElement;

      expect(electronicsCheckbox.checked).toBe(true);
      expect(minPriceInput.value).toBe('50');
      expect(maxPriceInput.value).toBe('500');
      expect(inStockCheckbox.checked).toBe(true);
    });
  });

  describe('Collapsible Sections', () => {
    it('should toggle category section', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const categoryHeader = screen.getByText(/categories/i);
      fireEvent.click(categoryHeader);

      // Categories should be hidden
      expect(screen.queryByText('Electronics')).not.toBeVisible();

      fireEvent.click(categoryHeader);

      // Categories should be visible again
      expect(screen.getByText('Electronics')).toBeVisible();
    });

    it('should toggle price range section', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const priceHeader = screen.getByText(/price range/i);
      fireEvent.click(priceHeader);

      // Price inputs should be hidden
      const minPriceInput = screen.queryByLabelText(/min price/i);
      expect(minPriceInput).not.toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByRole('group', { name: /categories/i })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /price range/i })).toBeInTheDocument();
    });

    it('should have accessible checkboxes', () => {
      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAccessibleName();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render mobile filter toggle button', () => {
      // Mock mobile viewport
      global.innerWidth = 375;

      render(<ProductFilters categories={mockCategories} onFilterChange={mockOnFilterChange} />);

      const filterButton = screen.getByText(/filters/i);
      expect(filterButton).toBeInTheDocument();
    });
  });
});
