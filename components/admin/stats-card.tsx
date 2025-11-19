import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// T153: STATS CARD COMPONENT (Phase 7 - User Story 6)
// ============================================================================

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  const isPositiveTrend = trend && trend.value >= 0;
  const trendColor = isPositiveTrend ? 'text-green-600' : 'text-red-600';

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 text-card-foreground shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          {/* Value */}
          <p className="mt-2 text-3xl font-bold">{value}</p>

          {/* Description or Trend */}
          {trend ? (
            <div className="mt-2 flex items-center space-x-2">
              <span className={cn('text-sm font-medium', trendColor)}>
                {isPositiveTrend ? '+' : ''}
                {trend.value.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {trend.label}
              </span>
            </div>
          ) : description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {/* Icon */}
        {Icon && (
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
