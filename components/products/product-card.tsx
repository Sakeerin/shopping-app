import Link from 'next/link';
import Image from 'next/image';
import type { ProductCardData } from '@/types/product';
import { RatingStars } from '@/components/reviews/rating-stars';

// ============================================================================
// PRODUCT CARD COMPONENT (Server Component)
// ============================================================================

interface ProductCardProps {
  product: ProductCardData;
}

export function ProductCard({ product }: ProductCardProps) {
  const {
    id,
    name,
    slug,
    price,
    images,
    categoryName,
    isFeatured,
    averageRating,
    reviewCount,
  } = product;

  const primaryImage = images[0] || '/placeholder-product.jpg';
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/products/${slug}`} className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={primaryImage}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        {isFeatured && (
          <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 flex-1 text-sm font-medium text-gray-900">
            <Link href={`/products/${slug}`} className="hover:text-blue-600">
              {name}
            </Link>
          </h3>
        </div>

        <p className="mb-2 text-xs text-gray-500">{categoryName}</p>

        {averageRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
          <div className="mb-2">
            <RatingStars
              rating={averageRating}
              readonly
              size="sm"
              showCount
              count={reviewCount}
            />
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-lg font-bold text-gray-900">{formattedPrice}</p>
          <Link
            href={`/products/${slug}`}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
