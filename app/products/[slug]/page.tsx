import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/services/products';
import { ProductGallery } from '@/components/products/product-gallery';
import { AddToCartButton } from '@/components/products/add-to-cart-button';
import { RatingStars } from '@/components/reviews/rating-stars';
import { ReviewForm } from '@/components/reviews/review-form';
import { ReviewList } from '@/components/reviews/review-list';
import { getProductRatingSummary, hasUserReviewed, verifyPurchase } from '@/services/reviews';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';

// ============================================================================
// PRODUCT DETAIL PAGE (ISR with Dynamic Metadata)
// ============================================================================

export const revalidate = 60; // ISR: Revalidate every 60 seconds

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found | Shopping App',
    };
  }

  return {
    title: `${product.name} | Shopping App`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(product.price));

  // Get session and review data
  const session = await getServerSession();
  const userId = session?.user?.id;
  const ratingSummary = await getProductRatingSummary(product.id);
  const hasReviewed = userId ? await hasUserReviewed(userId, product.id) : false;
  const hasPurchased = userId ? await verifyPurchase(userId, product.id) : false;

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-600">
        <a href="/" className="hover:text-blue-600">
          Home
        </a>
        <span>/</span>
        <a href="/products" className="hover:text-blue-600">
          Products
        </a>
        <span>/</span>
        <a href={`/products?categoryId=${product.category.id}`} className="hover:text-blue-600">
          {product.category.name}
        </a>
        <span>/</span>
        <span className="font-medium text-gray-900">{product.name}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Product Gallery */}
        <div>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
            <p className="mt-2 text-sm text-gray-600">{product.category.name}</p>
          </div>

          {/* Rating */}
          {ratingSummary.totalReviews > 0 && (
            <div>
              <RatingStars
                rating={ratingSummary.averageRating}
                readonly
                size="md"
                showCount
                count={ratingSummary.totalReviews}
              />
            </div>
          )}

          {/* Price */}
          <div>
            <p className="text-3xl font-bold text-gray-900">{formattedPrice}</p>
          </div>

          {/* Stock Status */}
          <div>
            {product.stock > 0 ? (
              <p className="text-sm text-green-600">
                {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left in stock`}
              </p>
            ) : (
              <p className="text-sm font-medium text-red-600">Out of Stock</p>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <p className="mt-2 text-gray-600">{product.description}</p>
          </div>

          {/* Add to Cart */}
          <div className="border-t border-gray-200 pt-6">
            <AddToCartButton productId={product.id} disabled={product.stock === 0} />
          </div>

          {/* Additional Info */}
          <div className="space-y-2 border-t border-gray-200 pt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              <span>30-day return policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-200 pt-8" id="reviews">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Rating Summary & Review Form */}
          <div className="space-y-8 lg:col-span-1">
            {/* Rating Summary */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-bold">Customer Reviews</h2>
              {ratingSummary.totalReviews > 0 ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold">
                      {ratingSummary.averageRating.toFixed(1)}
                    </span>
                    <div>
                      <RatingStars rating={ratingSummary.averageRating} readonly size="md" />
                      <p className="mt-1 text-sm text-muted-foreground">
                        {ratingSummary.totalReviews} {ratingSummary.totalReviews === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = ratingSummary.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5];
                      const percentage = ratingSummary.totalReviews > 0
                        ? (count / ratingSummary.totalReviews) * 100
                        : 0;

                      return (
                        <div key={rating} className="flex items-center gap-2 text-sm">
                          <span className="w-8">{rating}★</span>
                          <div className="flex-1">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-yellow-400"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <span className="w-12 text-right text-muted-foreground">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No reviews yet</p>
              )}
            </div>

            {/* Review Form */}
            {userId && !hasReviewed && (
              <div className="rounded-lg border bg-card p-6">
                <ReviewForm productId={product.id} hasPurchased={hasPurchased} />
              </div>
            )}

            {!userId && (
              <div className="rounded-lg border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  <a href="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </a>{' '}
                  to write a review
                </p>
              </div>
            )}

            {hasReviewed && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                <p className="text-sm text-green-800">
                  You have already reviewed this product
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Review List */}
          <div className="lg:col-span-2">
            <ReviewList productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
