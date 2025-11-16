import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromoCodeInput } from '@/components/cart/promo-code-input';
import { applyPromoCode, removePromoCode } from '@/actions/cart';

// ============================================================================
// PROMO CODE INPUT COMPONENT TESTS (T117)
// ============================================================================

vi.mock('@/actions/cart', () => ({
  applyPromoCode: vi.fn(),
  removePromoCode: vi.fn(),
}));

describe('PromoCodeInput Component', () => {
  const mockOnApply = vi.fn();
  const mockOnRemove = vi.fn();
  const defaultProps = {
    subtotal: 100,
    onApply: mockOnApply,
    onRemove: mockOnRemove,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render input and apply button', () => {
      render(<PromoCodeInput {...defaultProps} />);

      expect(screen.getByPlaceholderText('Enter promo code')).toBeInTheDocument();
      expect(screen.getByText('Apply')).toBeInTheDocument();
    });

    it('should have disabled apply button when input is empty', () => {
      render(<PromoCodeInput {...defaultProps} />);

      const applyButton = screen.getByText('Apply');
      expect(applyButton).toBeDisabled();
    });

    it('should enable apply button when code is entered', async () => {
      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter promo code');
      fireEvent.change(input, { target: { value: 'SAVE20' } });

      await waitFor(() => {
        const applyButton = screen.getByText('Apply');
        expect(applyButton).not.toBeDisabled();
      });
    });
  });

  describe('Applying Promo Code', () => {
    it('should apply valid promo code successfully', async () => {
      vi.mocked(applyPromoCode).mockResolvedValue({
        success: true,
        data: {
          code: 'SAVE20',
          discount: 20,
          discountType: 'PERCENTAGE',
          discountValue: 20,
          promoCode: {
            id: 'promo1',
            code: 'SAVE20',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            maxDiscount: null,
          },
        },
      });

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter promo code');
      const applyButton = screen.getByText('Apply');

      fireEvent.change(input, { target: { value: 'SAVE20' } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(applyPromoCode).toHaveBeenCalledWith('SAVE20', 100);
      });

      await waitFor(() => {
        expect(mockOnApply).toHaveBeenCalledWith(20, 'SAVE20', {
          id: 'promo1',
          code: 'SAVE20',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          maxDiscount: null,
        });
      });
    });

    it('should convert input to uppercase', async () => {
      vi.mocked(applyPromoCode).mockResolvedValue({
        success: true,
        data: {
          code: 'SAVE20',
          discount: 20,
          discountType: 'PERCENTAGE',
          discountValue: 20,
          promoCode: {
            id: 'promo1',
            code: 'SAVE20',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            maxDiscount: null,
          },
        },
      });

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter promo code') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'save20' } });

      expect(input.value).toBe('SAVE20');
    });

    it('should show loading state while applying', async () => {
      vi.mocked(applyPromoCode).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  data: {
                    code: 'SAVE20',
                    discount: 20,
                    discountType: 'PERCENTAGE',
                    discountValue: 20,
                    promoCode: {
                      id: 'promo1',
                      code: 'SAVE20',
                      discountType: 'PERCENTAGE',
                      discountValue: 20,
                      maxDiscount: null,
                    },
                  },
                }),
              100
            )
          )
      );

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter promo code');
      fireEvent.change(input, { target: { value: 'SAVE20' } });

      const applyButton = screen.getByText('Apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('Applying...')).toBeInTheDocument();
      });
    });

    it('should show success message after applying', async () => {
      vi.mocked(applyPromoCode).mockResolvedValue({
        success: true,
        data: {
          code: 'SAVE20',
          discount: 20,
          discountType: 'PERCENTAGE',
          discountValue: 20,
          promoCode: {
            id: 'promo1',
            code: 'SAVE20',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            maxDiscount: null,
          },
        },
      });

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter promo code');
      const applyButton = screen.getByText('Apply');

      fireEvent.change(input, { target: { value: 'SAVE20' } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('Promo code applied successfully!')).toBeInTheDocument();
      });
    });

    it('should clear input after successful apply', async () => {
      vi.mocked(applyPromoCode).mockResolvedValue({
        success: true,
        data: {
          code: 'SAVE20',
          discount: 20,
          discountType: 'PERCENTAGE',
          discountValue: 20,
          promoCode: {
            id: 'promo1',
            code: 'SAVE20',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            maxDiscount: null,
          },
        },
      });

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter promo code') as HTMLInputElement;
      const applyButton = screen.getByText('Apply');

      fireEvent.change(input, { target: { value: 'SAVE20' } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error for invalid promo code', async () => {
      vi.mocked(applyPromoCode).mockResolvedValue({
        success: false,
        error: 'Invalid promo code',
      });

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter promo code');
      const applyButton = screen.getByText('Apply');

      fireEvent.change(input, { target: { value: 'INVALID' } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid promo code')).toBeInTheDocument();
      });
    });

    it('should show error for expired promo code', async () => {
      vi.mocked(applyPromoCode).mockResolvedValue({
        success: false,
        error: 'This promo code has expired',
      });

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter promo code');
      const applyButton = screen.getByText('Apply');

      fireEvent.change(input, { target: { value: 'EXPIRED' } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('This promo code has expired')).toBeInTheDocument();
      });
    });

    it('should show error if subtotal below minimum', async () => {
      vi.mocked(applyPromoCode).mockResolvedValue({
        success: false,
        error: 'Minimum purchase of $50.00 required',
      });

      render(<PromoCodeInput {...defaultProps} subtotal={30} />);

      const input = screen.getByPlaceholderText('Enter promo code');
      const applyButton = screen.getByText('Apply');

      fireEvent.change(input, { target: { value: 'SAVE20' } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('Minimum purchase of $50.00 required')).toBeInTheDocument();
      });
    });

    it('should show error when submitting empty code', async () => {
      render(<PromoCodeInput {...defaultProps} />);

      const form = screen.getByPlaceholderText('Enter promo code').closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Please enter a promo code')).toBeInTheDocument();
      });
    });

    it('should clear error when typing new code', async () => {
      vi.mocked(applyPromoCode).mockResolvedValue({
        success: false,
        error: 'Invalid promo code',
      });

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter promo code');
      const applyButton = screen.getByText('Apply');

      // Trigger error
      fireEvent.change(input, { target: { value: 'INVALID' } });
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid promo code')).toBeInTheDocument();
      });

      // Start typing new code
      fireEvent.change(input, { target: { value: 'NEW' } });

      await waitFor(() => {
        expect(screen.queryByText('Invalid promo code')).not.toBeInTheDocument();
      });
    });
  });

  describe('Applied Promo Code Display', () => {
    it('should show applied promo code with discount', () => {
      render(
        <PromoCodeInput
          {...defaultProps}
          currentPromoCode="SAVE20"
          currentDiscount={20}
        />
      );

      expect(screen.getByText('Promo Code: SAVE20')).toBeInTheDocument();
      expect(screen.getByText('You saved $20.00')).toBeInTheDocument();
      expect(screen.getByText('Remove')).toBeInTheDocument();
    });

    it('should call onRemove when remove button clicked', async () => {
      vi.mocked(removePromoCode).mockResolvedValue({
        success: true,
        data: { message: 'Promo code removed' },
      });

      render(
        <PromoCodeInput
          {...defaultProps}
          currentPromoCode="SAVE20"
          currentDiscount={20}
        />
      );

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(removePromoCode).toHaveBeenCalled();
        expect(mockOnRemove).toHaveBeenCalled();
      });
    });

    it('should display success icon when code is applied', () => {
      render(
        <PromoCodeInput
          {...defaultProps}
          currentPromoCode="SAVE20"
          currentDiscount={20}
        />
      );

      const svg = screen.getByText('Promo Code: SAVE20').closest('div')?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should hide input form when code is applied', () => {
      render(
        <PromoCodeInput
          {...defaultProps}
          currentPromoCode="SAVE20"
          currentDiscount={20}
        />
      );

      expect(screen.queryByPlaceholderText('Enter promo code')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit on Enter key press', async () => {
      vi.mocked(applyPromoCode).mockResolvedValue({
        success: true,
        data: {
          code: 'SAVE20',
          discount: 20,
          discountType: 'PERCENTAGE',
          discountValue: 20,
          promoCode: {
            id: 'promo1',
            code: 'SAVE20',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            maxDiscount: null,
          },
        },
      });

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter promo code');
      fireEvent.change(input, { target: { value: 'SAVE20' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(applyPromoCode).toHaveBeenCalledWith('SAVE20', 100);
      });
    });

    it('should prevent duplicate submissions while loading', async () => {
      vi.mocked(applyPromoCode).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: {} }), 200))
      );

      render(<PromoCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter promo code');
      const applyButton = screen.getByText('Apply');

      fireEvent.change(input, { target: { value: 'SAVE20' } });
      fireEvent.click(applyButton);
      fireEvent.click(applyButton); // Try to submit again

      await waitFor(() => {
        expect(applyPromoCode).toHaveBeenCalledTimes(1);
      });
    });
  });
});
