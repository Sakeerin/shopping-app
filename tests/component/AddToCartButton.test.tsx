import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddToCartButton } from '@/components/products/add-to-cart-button';
import { addToCart } from '@/actions/cart';

// ============================================================================
// ADD TO CART BUTTON COMPONENT TESTS
// ============================================================================

vi.mock('@/actions/cart', () => ({
  addToCart: vi.fn(),
}));

describe('AddToCartButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default quantity', () => {
    render(<AddToCartButton productId="prod1" />);

    const quantityInput = screen.getByLabelText('Quantity:') as HTMLInputElement;
    expect(quantityInput.value).toBe('1');
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('should increase quantity when plus button clicked', async () => {
    render(<AddToCartButton productId="prod1" />);

    const increaseButton = screen.getByLabelText('Increase quantity');
    const quantityInput = screen.getByLabelText('Quantity:') as HTMLInputElement;

    fireEvent.click(increaseButton);

    await waitFor(() => {
      expect(quantityInput.value).toBe('2');
    });
  });

  it('should decrease quantity when minus button clicked', async () => {
    render(<AddToCartButton productId="prod1" initialQuantity={3} />);

    const decreaseButton = screen.getByLabelText('Decrease quantity');
    const quantityInput = screen.getByLabelText('Quantity:') as HTMLInputElement;

    fireEvent.click(decreaseButton);

    await waitFor(() => {
      expect(quantityInput.value).toBe('2');
    });
  });

  it('should not decrease quantity below 1', async () => {
    render(<AddToCartButton productId="prod1" />);

    const decreaseButton = screen.getByLabelText('Decrease quantity');
    const quantityInput = screen.getByLabelText('Quantity:') as HTMLInputElement;

    fireEvent.click(decreaseButton);

    await waitFor(() => {
      expect(quantityInput.value).toBe('1');
    });
  });

  it('should call addToCart action on form submit', async () => {
    vi.mocked(addToCart).mockResolvedValue({ success: true, data: {} });

    render(<AddToCartButton productId="prod1" />);

    const submitButton = screen.getByText('Add to Cart');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(addToCart).toHaveBeenCalled();
    });
  });

  it('should display success message on successful add', async () => {
    vi.mocked(addToCart).mockResolvedValue({ success: true, data: {} });

    render(<AddToCartButton productId="prod1" />);

    const submitButton = screen.getByText('Add to Cart');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Added to cart!')).toBeInTheDocument();
    });
  });

  it('should display error message on failed add', async () => {
    vi.mocked(addToCart).mockResolvedValue({
      success: false,
      error: 'Out of stock',
    });

    render(<AddToCartButton productId="prod1" />);

    const submitButton = screen.getByText('Add to Cart');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Out of stock')).toBeInTheDocument();
    });
  });

  it('should be disabled when disabled prop is true', () => {
    render(<AddToCartButton productId="prod1" disabled={true} />);

    const submitButton = screen.getByText('Add to Cart');
    expect(submitButton).toBeDisabled();
  });

  it('should show loading state while submitting', async () => {
    vi.mocked(addToCart).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: {} }), 100))
    );

    render(<AddToCartButton productId="prod1" />);

    const submitButton = screen.getByText('Add to Cart');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Adding...')).toBeInTheDocument();
    });
  });

  it('should include variantId in form data if provided', async () => {
    vi.mocked(addToCart).mockResolvedValue({ success: true, data: {} });

    render(<AddToCartButton productId="prod1" variantId="var1" />);

    const submitButton = screen.getByText('Add to Cart');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(addToCart).toHaveBeenCalled();
    });

    const formData = vi.mocked(addToCart).mock.calls[0][0] as FormData;
    expect(formData.get('variantId')).toBe('var1');
  });
});
