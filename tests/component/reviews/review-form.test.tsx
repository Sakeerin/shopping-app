import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewForm } from '@/components/reviews/review-form';
import { submitReview } from '@/actions/reviews';

// ============================================================================
// T171: COMPONENT TESTS FOR REVIEW FORM (Phase 8 - User Story 5)
// ============================================================================

vi.mock('@/actions/reviews', () => ({
  submitReview: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe('ReviewForm', () => {
  const defaultProps = {
    productId: 'product-1',
    hasPurchased: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render review form with all fields', () => {
    render(<ReviewForm {...defaultProps} />);

    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/review/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument();
  });

  it('should display star rating selector', () => {
    render(<ReviewForm {...defaultProps} />);

    const stars = screen.getAllByRole('button', { name: /star/i });
    expect(stars).toHaveLength(5);
  });

  it('should update rating when star is clicked', async () => {
    const user = userEvent.setup();
    render(<ReviewForm {...defaultProps} />);

    const fourthStar = screen.getByRole('button', { name: /4 star/i });
    await user.click(fourthStar);

    // Check that 4 stars are filled
    const filledStars = screen.getAllByRole('button', { name: /star/i }).filter(
      (star) => star.getAttribute('aria-pressed') === 'true'
    );
    expect(filledStars).toHaveLength(4);
  });

  it('should show hover preview on stars', async () => {
    const user = userEvent.setup();
    render(<ReviewForm {...defaultProps} />);

    const thirdStar = screen.getByRole('button', { name: /3 star/i });
    await user.hover(thirdStar);

    // Check aria attributes indicate hover state
    expect(thirdStar).toHaveAttribute('data-hover', 'true');
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<ReviewForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/rating is required/i)).toBeInTheDocument();
      expect(screen.getByText(/review is required/i)).toBeInTheDocument();
    });

    expect(submitReview).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    vi.mocked(submitReview).mockResolvedValue({ success: true, data: {} });

    render(<ReviewForm {...defaultProps} />);

    // Set rating
    await user.click(screen.getByRole('button', { name: /5 star/i }));

    // Fill title
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Amazing Product!');

    // Fill review
    const reviewTextarea = screen.getByLabelText(/review/i);
    await user.type(reviewTextarea, 'This product exceeded my expectations. Highly recommended!');

    // Submit
    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitReview).toHaveBeenCalledWith({
        productId: 'product-1',
        rating: 5,
        title: 'Amazing Product!',
        comment: 'This product exceeded my expectations. Highly recommended!',
      });
    });
  });

  it('should display verified purchase badge when user has purchased', () => {
    render(<ReviewForm {...defaultProps} hasPurchased={true} />);

    expect(screen.getByText(/verified purchase/i)).toBeInTheDocument();
  });

  it('should display loading state during submission', async () => {
    const user = userEvent.setup();
    vi.mocked(submitReview).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000))
    );

    render(<ReviewForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /5 star/i }));
    await user.type(screen.getByLabelText(/review/i), 'Great product!');

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  it('should display success message after submission', async () => {
    const user = userEvent.setup();
    vi.mocked(submitReview).mockResolvedValue({ success: true, data: {} });

    render(<ReviewForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /5 star/i }));
    await user.type(screen.getByLabelText(/review/i), 'Great product!');
    await user.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(screen.getByText(/review submitted successfully/i)).toBeInTheDocument();
    });
  });

  it('should display error message on submission failure', async () => {
    const user = userEvent.setup();
    vi.mocked(submitReview).mockResolvedValue({
      success: false,
      error: 'You have already reviewed this product',
    });

    render(<ReviewForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /5 star/i }));
    await user.type(screen.getByLabelText(/review/i), 'Great product!');
    await user.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(screen.getByText(/you have already reviewed this product/i)).toBeInTheDocument();
    });
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    vi.mocked(submitReview).mockResolvedValue({ success: true, data: {} });

    render(<ReviewForm {...defaultProps} />);

    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    const reviewTextarea = screen.getByLabelText(/review/i) as HTMLTextAreaElement;

    await user.click(screen.getByRole('button', { name: /5 star/i }));
    await user.type(titleInput, 'Great!');
    await user.type(reviewTextarea, 'Amazing product');
    await user.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(titleInput.value).toBe('');
      expect(reviewTextarea.value).toBe('');
    });
  });

  it('should enforce minimum review length', async () => {
    const user = userEvent.setup();
    render(<ReviewForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /5 star/i }));
    await user.type(screen.getByLabelText(/review/i), 'Too short');
    await user.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(screen.getByText(/review must be at least/i)).toBeInTheDocument();
    });
  });

  it('should enforce maximum review length', async () => {
    const user = userEvent.setup();
    render(<ReviewForm {...defaultProps} />);

    const longReview = 'a'.repeat(1001);
    const reviewTextarea = screen.getByLabelText(/review/i);

    await user.click(screen.getByRole('button', { name: /5 star/i }));
    await user.type(reviewTextarea, longReview);

    // Check character count indicator
    expect(screen.getByText(/1001.*1000/i)).toBeInTheDocument();
  });

  it('should show character count for review', async () => {
    const user = userEvent.setup();
    render(<ReviewForm {...defaultProps} />);

    const reviewTextarea = screen.getByLabelText(/review/i);
    await user.type(reviewTextarea, 'This is a test review');

    expect(screen.getByText(/21.*1000/i)).toBeInTheDocument();
  });

  it('should be accessible with keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<ReviewForm {...defaultProps} />);

    // Tab through stars
    await user.tab();
    expect(screen.getByRole('button', { name: /1 star/i })).toHaveFocus();

    // Use arrow keys to select rating
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    const fourthStar = screen.getByRole('button', { name: /4 star/i });
    expect(fourthStar).toHaveFocus();

    // Select with Enter/Space
    await user.keyboard('{Enter}');
    expect(fourthStar).toHaveAttribute('aria-pressed', 'true');
  });

  it('should have proper ARIA labels', () => {
    render(<ReviewForm {...defaultProps} />);

    expect(screen.getByRole('group', { name: /rating/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveAttribute('aria-label');
    expect(screen.getByLabelText(/review/i)).toHaveAttribute('aria-label');
  });

  it('should display optional indicator for title field', () => {
    render(<ReviewForm {...defaultProps} />);

    const titleLabel = screen.getByText(/title/i);
    expect(titleLabel.parentElement).toHaveTextContent(/optional/i);
  });

  it('should allow submission without title', async () => {
    const user = userEvent.setup();
    vi.mocked(submitReview).mockResolvedValue({ success: true, data: {} });

    render(<ReviewForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /5 star/i }));
    await user.type(screen.getByLabelText(/review/i), 'Great product, no title needed!');
    await user.click(screen.getByRole('button', { name: /submit review/i }));

    await waitFor(() => {
      expect(submitReview).toHaveBeenCalledWith({
        productId: 'product-1',
        rating: 5,
        title: '',
        comment: 'Great product, no title needed!',
      });
    });
  });
});
