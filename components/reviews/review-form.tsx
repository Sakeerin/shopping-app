'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RatingStars } from './rating-stars';
import { submitReview } from '@/actions/reviews';

// ============================================================================
// T178: REVIEW FORM COMPONENT (Phase 8 - User Story 5)
// ============================================================================

interface ReviewFormProps {
  productId: string;
  hasPurchased: boolean;
  className?: string;
}

export function ReviewForm({ productId, hasPurchased, className = '' }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const characterCount = comment.length;
  const maxCharacters = 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    if (comment.length > maxCharacters) {
      setError(`Review must be at most ${maxCharacters} characters`);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReview({
        productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      });

      if (result.success) {
        setSuccess(true);
        // Reset form
        setRating(0);
        setTitle('');
        setComment('');
        router.refresh();

        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Write a Review</h3>
          {hasPurchased && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Purchase</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Review submitted successfully!</span>
            </div>
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-foreground" aria-label="Rating">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="mt-2">
            <RatingStars
              rating={rating}
              onRatingChange={setRating}
              size="lg"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-medium text-foreground">
            Title <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your review in a few words"
            maxLength={100}
            disabled={isSubmitting}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            aria-label="Review title"
          />
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-foreground">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={6}
            maxLength={maxCharacters}
            disabled={isSubmitting}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            aria-label="Your review"
            aria-describedby="character-count"
          />
          <div
            id="character-count"
            className={`mt-1 text-right text-xs ${
              characterCount > maxCharacters ? 'text-red-600' : 'text-muted-foreground'
            }`}
          >
            {characterCount} / {maxCharacters} characters
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </button>
      </div>
    </form>
  );
}
