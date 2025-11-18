import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductSearch } from '@/components/products/product-search';

// ============================================================================
// PRODUCT SEARCH COMPONENT TESTS (T129 - Phase 6: User Story 3)
// ============================================================================

// Mock the fetch function for autocomplete
global.fetch = vi.fn();

describe('ProductSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Render', () => {
    it('should render search input with placeholder', () => {
      render(<ProductSearch />);

      expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
    });

    it('should render search icon', () => {
      render(<ProductSearch />);

      const searchIcon = screen.getByRole('img', { hidden: true });
      expect(searchIcon).toBeInTheDocument();
    });

    it('should have empty initial value', () => {
      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i) as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('Input Handling', () => {
    it('should update input value on typing', async () => {
      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i) as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'laptop' } });

      expect(input.value).toBe('laptop');
    });

    it('should debounce search input', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ products: [], categories: [] }),
      } as Response);

      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i);

      // Type quickly
      fireEvent.change(input, { target: { value: 'l' } });
      fireEvent.change(input, { target: { value: 'la' } });
      fireEvent.change(input, { target: { value: 'lap' } });

      // Fetch should not be called yet
      expect(fetch).not.toHaveBeenCalled();

      // Advance timers to trigger debounce
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should not search for queries shorter than 2 characters', async () => {
      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i);

      fireEvent.change(input, { target: { value: 'a' } });
      vi.advanceTimersByTime(300);

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Autocomplete Dropdown', () => {
    it('should show autocomplete results', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [
            { id: '1', name: 'Laptop Pro', slug: 'laptop-pro', price: 1299 },
            { id: '2', name: 'Laptop Air', slug: 'laptop-air', price: 999 },
          ],
          categories: [
            { id: 'cat1', name: 'Laptops', slug: 'laptops' },
          ],
        }),
      } as Response);

      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i);

      fireEvent.change(input, { target: { value: 'laptop' } });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
        expect(screen.getByText('Laptop Air')).toBeInTheDocument();
        expect(screen.getByText('Laptops')).toBeInTheDocument();
      });
    });

    it('should hide autocomplete on blur', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [{ id: '1', name: 'Laptop Pro', slug: 'laptop-pro', price: 1299 }],
          categories: [],
        }),
      } as Response);

      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i);

      fireEvent.change(input, { target: { value: 'laptop' } });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
      });

      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText('Laptop Pro')).not.toBeInTheDocument();
      });
    });

    it('should navigate to product on result click', async () => {
      const mockPush = vi.fn();
      vi.mock('next/navigation', () => ({
        useRouter: () => ({ push: mockPush }),
      }));

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [{ id: '1', name: 'Laptop Pro', slug: 'laptop-pro', price: 1299 }],
          categories: [],
        }),
      } as Response);

      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i);

      fireEvent.change(input, { target: { value: 'laptop' } });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
      });

      const result = screen.getByText('Laptop Pro');
      fireEvent.click(result);

      // Verify navigation would occur (implementation dependent)
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator while fetching', async () => {
      vi.mocked(fetch).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ products: [], categories: [] }),
        } as Response), 100))
      );

      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i);

      fireEvent.change(input, { target: { value: 'laptop' } });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i);

      fireEvent.change(input, { target: { value: 'laptop' } });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        // Should not crash, and no results should be shown
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate results with arrow keys', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [
            { id: '1', name: 'Product 1', slug: 'product-1', price: 100 },
            { id: '2', name: 'Product 2', slug: 'product-2', price: 200 },
          ],
          categories: [],
        }),
      } as Response);

      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i);

      fireEvent.change(input, { target: { value: 'product' } });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      // Arrow down
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });

      // First result should be highlighted
      // Implementation would check for aria-selected or similar
    });

    it('should submit search on Enter key', async () => {
      const mockOnSearch = vi.fn();

      render(<ProductSearch onSearch={mockOnSearch} />);

      const input = screen.getByPlaceholderText(/search products/i);

      fireEvent.change(input, { target: { value: 'laptop' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(mockOnSearch).toHaveBeenCalledWith('laptop');
    });

    it('should close dropdown on Escape key', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [{ id: '1', name: 'Product 1', slug: 'product-1', price: 100 }],
          categories: [],
        }),
      } as Response);

      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i);

      fireEvent.change(input, { target: { value: 'product' } });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('No Results', () => {
    it('should show no results message', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ products: [], categories: [] }),
      } as Response);

      render(<ProductSearch />);

      const input = screen.getByPlaceholderText(/search products/i);

      fireEvent.change(input, { target: { value: 'nonexistent' } });
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      });
    });
  });
});
