import { MessageSquare } from 'lucide-react';
import { ReviewCard } from './review-card';
import { getProductReviews } from '@/services/reviews';
import { getServerSession } from 'next-auth';

// ============================================================================
// T179: REVIEW LIST COMPONENT (Phase 8 - User Story 5)
// ============================================================================

interface ReviewListProps {
  productId: string;
  initialSort?: 'recent' | 'helpful' | 'rating-high' | 'rating-low';
  initialPage?: number;
  limit?: number;
}

export async function ReviewList({
  productId,
  initialSort = 'recent',
  initialPage = 1,
  limit = 10,
}: ReviewListProps) {
  const session = await getServerSession();
  const currentUserId = session?.user?.id;
  const isAdmin = session?.user?.role === 'ADMIN';

  const { reviews, pagination, stats } = await getProductReviews({
    productId,
    page: initialPage,
    limit,
    sortBy: initialSort,
  });

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No reviews yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Be the first to review this product!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {initialPage > 1 && (
            <a
              href={`?page=${initialPage - 1}&sort=${initialSort}#reviews`}
              className="rounded-md border bg-background px-3 py-1 text-sm hover:bg-muted"
            >
              Previous
            </a>
          )}
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          {initialPage < pagination.totalPages && (
            <a
              href={`?page=${initialPage + 1}&sort=${initialSort}#reviews`}
              className="rounded-md border bg-background px-3 py-1 text-sm hover:bg-muted"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
