'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// T181: RATING STARS COMPONENT (Phase 8 - User Story 5)
// ============================================================================

interface RatingStarsProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function RatingStars({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = 'md',
  showCount = false,
  count,
  className,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [focusRating, setFocusRating] = useState(0);

  const displayRating = readonly ? rating : (hoverRating || focusRating || rating);
  const isInteractive = !readonly && onRatingChange;

  const handleClick = (value: number) => {
    if (isInteractive) {
      onRatingChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: number) => {
    if (!isInteractive) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRatingChange(value);
    } else if (e.key === 'ArrowRight' && value < 5) {
      e.preventDefault();
      setFocusRating(value + 1);
    } else if (e.key === 'ArrowLeft' && value > 1) {
      e.preventDefault();
      setFocusRating(value - 1);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Stars */}
      <div
        className="flex items-center gap-0.5"
        role={isInteractive ? 'group' : undefined}
        aria-label={isInteractive ? 'Rating' : undefined}
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= displayRating;
          const isPartial = !Number.isInteger(displayRating) &&
                           Math.floor(displayRating) === value - 1 &&
                           readonly;

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              onMouseEnter={() => isInteractive && setHoverRating(value)}
              onMouseLeave={() => isInteractive && setHoverRating(0)}
              onFocus={() => isInteractive && setFocusRating(value)}
              onBlur={() => isInteractive && setFocusRating(0)}
              onKeyDown={(e) => handleKeyDown(e, value)}
              disabled={!isInteractive}
              className={cn(
                'transition-colors',
                isInteractive && 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded',
                !isInteractive && 'cursor-default'
              )}
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
              aria-pressed={isInteractive ? (value <= rating) : undefined}
              data-hover={isInteractive && value <= hoverRating ? 'true' : 'false'}
              tabIndex={isInteractive ? 0 : -1}
            >
              {isPartial ? (
                <div className="relative">
                  <Star
                    className={cn(sizeClasses[size], 'text-gray-300')}
                    fill="currentColor"
                  />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${(displayRating % 1) * 100}%` }}
                  >
                    <Star
                      className={cn(sizeClasses[size], 'text-yellow-400')}
                      fill="currentColor"
                    />
                  </div>
                </div>
              ) : (
                <Star
                  className={cn(
                    sizeClasses[size],
                    isFilled ? 'text-yellow-400' : 'text-gray-300',
                    isInteractive && 'transition-transform'
                  )}
                  fill="currentColor"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Rating Display */}
      {readonly && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {rating.toFixed(1)}
          </span>
          {showCount && count !== undefined && (
            <span>({count} {count === 1 ? 'review' : 'reviews'})</span>
          )}
        </div>
      )}
    </div>
  );
}
