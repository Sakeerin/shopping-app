'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ThumbsUp, ShieldCheck, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { RatingStars } from './rating-stars';
import { markReviewHelpful, deleteReview } from '@/actions/reviews';
import { useRouter } from 'next/navigation';

// ============================================================================
// T180: REVIEW CARD COMPONENT (Phase 8 - User Story 5)
// ============================================================================

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  isAdmin?: boolean;
  onEdit?: (reviewId: string) => void;
}

export function ReviewCard({ review, currentUserId, isAdmin, onEdit }: ReviewCardProps) {
  const router = useRouter();
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUserId === review.user.id;
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  const handleMarkHelpful = async () => {
    if (hasMarkedHelpful) return;

    const result = await markReviewHelpful(review.id);
    if (result.success) {
      setHelpfulCount((prev) => prev + 1);
      setHasMarkedHelpful(true);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteReview(review.id);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete review');
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="border-b pb-6 last:border-b-0" data-testid="review-card">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          {review.user.image ? (
            <Image
              src={review.user.image}
              alt={review.user.name || 'User'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {(review.user.name || 'U')[0].toUpperCase()}
            </div>
          )}

          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{review.user.name || 'Anonymous'}</p>
              {review.isVerifiedPurchase && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Purchase</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>

        {/* Actions Menu */}
        {(canEdit || canDelete) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded p-1 hover:bg-muted"
              aria-label="Review actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 z-10 mt-2 w-32 rounded-md border bg-background shadow-lg">
                {canEdit && onEdit && (
                  <button
                    onClick={() => {
                      onEdit(review.id);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mt-3">
        <RatingStars rating={review.rating} readonly size="sm" />
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="mt-2 font-semibold">{review.title}</h4>
      )}

      {/* Comment */}
      <p className="mt-2 text-sm text-foreground">{review.comment}</p>

      {/* Helpful Button */}
      <div className="mt-4">
        <button
          onClick={handleMarkHelpful}
          disabled={hasMarkedHelpful}
          className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
          aria-label="Mark review as helpful"
        >
          <ThumbsUp className={`h-3 w-3 ${hasMarkedHelpful ? 'fill-current' : ''}`} />
          <span>
            {hasMarkedHelpful ? 'Marked helpful' : 'Helpful'}
            {helpfulCount > 0 && ` (${helpfulCount})`}
          </span>
        </button>
      </div>
    </div>
  );
}
