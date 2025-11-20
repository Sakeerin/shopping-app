import { prisma } from '@/lib/db';

// ============================================================================
// T172-T173: REVIEW SERVICES (Phase 8 - User Story 5)
// ============================================================================

interface GetProductReviewsOptions {
  productId: string;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'helpful' | 'rating-high' | 'rating-low';
  rating?: number; // Filter by specific rating (1-5)
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ReviewListResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}

// ============================================================================
// T172: GET PRODUCT REVIEWS WITH SORTING AND PAGINATION
// ============================================================================

export async function getProductReviews(
  options: GetProductReviewsOptions
): Promise<ReviewListResponse> {
  const {
    productId,
    page = 1,
    limit = 10,
    sortBy = 'recent',
    rating,
  } = options;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { productId };
  if (rating !== undefined && rating >= 1 && rating <= 5) {
    where.rating = rating;
  }

  // Determine order by clause
  let orderBy: any;
  switch (sortBy) {
    case 'helpful':
      orderBy = [{ helpfulCount: 'desc' }, { createdAt: 'desc' }];
      break;
    case 'rating-high':
      orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }];
      break;
    case 'rating-low':
      orderBy = [{ rating: 'asc' }, { createdAt: 'desc' }];
      break;
    case 'recent':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  // Fetch reviews with pagination
  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  // Calculate statistics for all reviews (not just current page)
  const allReviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  });

  const totalReviews = allReviews.length;
  const averageRating =
    totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  // Calculate rating distribution
  const ratingDistribution = {
    1: allReviews.filter((r) => r.rating === 1).length,
    2: allReviews.filter((r) => r.rating === 2).length,
    3: allReviews.filter((r) => r.rating === 3).length,
    4: allReviews.filter((r) => r.rating === 4).length,
    5: allReviews.filter((r) => r.rating === 5).length,
  };

  const totalPages = Math.ceil(totalCount / limit);

  return {
    reviews: reviews as Review[],
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
    },
    stats: {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      ratingDistribution,
    },
  };
}

// ============================================================================
// T173: VERIFY PURCHASE SERVICE
// ============================================================================

export async function verifyPurchase(
  userId: string,
  productId: string
): Promise<boolean> {
  // Check if user has a completed order containing this product
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: {
          in: ['PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    },
  });

  return orderItem !== null;
}

// ============================================================================
// HELPER: GET REVIEW BY ID
// ============================================================================

export async function getReviewById(reviewId: string): Promise<Review | null> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return review as Review | null;
}

// ============================================================================
// HELPER: CHECK IF USER HAS REVIEWED PRODUCT
// ============================================================================

export async function hasUserReviewed(
  userId: string,
  productId: string
): Promise<boolean> {
  const review = await prisma.review.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
  });

  return review !== null;
}

// ============================================================================
// HELPER: GET PRODUCT RATING SUMMARY
// ============================================================================

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export async function getProductRatingSummary(
  productId: string
): Promise<RatingSummary> {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const ratingDistribution = {
    1: reviews.filter((r) => r.rating === 1).length,
    2: reviews.filter((r) => r.rating === 2).length,
    3: reviews.filter((r) => r.rating === 3).length,
    4: reviews.filter((r) => r.rating === 4).length,
    5: reviews.filter((r) => r.rating === 5).length,
  };

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution,
  };
}
