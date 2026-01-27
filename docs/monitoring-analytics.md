# Monitoring & Analytics Guide

## T202-T204: Monitoring & Analytics (Phase 9)

This document outlines the monitoring and analytics implementation for tracking errors, performance, and business metrics.

## Sentry Error Tracking (T202)

**Status:** ✅ Implemented

### Overview

Sentry provides real-time error tracking and performance monitoring for both client and server-side code.

### Installation

```bash
npm install @sentry/nextjs
```

### Configuration Files

#### 1. Client Configuration
**Location:** [sentry.client.config.ts](../sentry.client.config.ts)

**Features:**
- Session replay (10% of sessions, 100% of error sessions)
- Error filtering and data sanitization
- Breadcrumb tracking
- Development mode protection
- Sensitive data filtering (passwords, credit cards, API keys)

**Sample Rate:**
- Production: 10% of transactions
- Development: 100% of transactions

#### 2. Server Configuration
**Location:** [sentry.server.config.ts](../sentry.server.config.ts)

**Features:**
- Server-side error tracking
- Request data filtering
- Environment context
- Sensitive data sanitization
- Database connection string filtering

#### 3. Edge Configuration
**Location:** [sentry.edge.config.ts](../sentry.edge.config.ts)

**Features:**
- Edge runtime error tracking
- Minimal configuration for edge functions

#### 4. Instrumentation
**Location:** [instrumentation.ts](../instrumentation.ts)

Automatically loads appropriate Sentry configuration based on runtime:
- Node.js runtime → `sentry.server.config.ts`
- Edge runtime → `sentry.edge.config.ts`

### Global Error Boundary

**Location:** [app/global-error.tsx](../app/global-error.tsx)

Catches unhandled errors and:
- Logs to Sentry
- Displays user-friendly error page
- Provides retry and home page navigation options
- Shows error digest for debugging

### Environment Variables

```env
# Sentry DSN from https://sentry.io
SENTRY_DSN=your-sentry-dsn-here
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here

# Optional: Enable Sentry in development
# SENTRY_DEBUG=true
```

### Usage Examples

#### Capture Exception
```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

#### Add Context
```typescript
Sentry.setContext('order', {
  orderId: '12345',
  userId: 'user-id',
  total: 99.99,
});
```

#### Set User
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

#### Add Breadcrumb
```typescript
Sentry.addBreadcrumb({
  category: 'checkout',
  message: 'User started checkout',
  level: 'info',
  data: {
    cartValue: 150.00,
    itemCount: 3,
  },
});
```

### Data Privacy

Sentry configuration automatically filters:
- ✅ Passwords and password confirmation fields
- ✅ Credit card numbers and CVV codes
- ✅ API keys and tokens
- ✅ Authorization headers
- ✅ Cookie values
- ✅ Database connection strings

### Features

**Session Replay:**
- Records 10% of all user sessions
- Records 100% of sessions with errors
- Masked text and blocked media for privacy

**Performance Monitoring:**
- 10% transaction sampling in production
- 100% sampling in development
- Automatic performance tracking

**Error Filtering:**
- Ignores browser extension errors
- Filters network errors
- Excludes aborted requests
- Blocks errors from browser extensions

## Vercel Analytics (T203)

**Status:** ✅ Implemented

### Overview

Vercel Analytics provides insights into page views, user engagement, and web vitals.

### Installation

```bash
npm install @vercel/analytics @vercel/speed-insights
```

### Configuration

**Location:** [app/layout.tsx](../app/layout.tsx)

```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Features

**Analytics:**
- ✅ Automatic page view tracking
- ✅ User session tracking
- ✅ Geographic data
- ✅ Device and browser information
- ✅ Referrer tracking

**Speed Insights:**
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ Real user monitoring
- ✅ Performance scores
- ✅ Route-level performance data

### No Configuration Required

Vercel Analytics is automatically enabled when deployed to Vercel. No environment variables needed!

### Viewing Data

1. Deploy to Vercel
2. Navigate to your project dashboard
3. Click "Analytics" tab
4. View real-time and historical data

## Custom Event Tracking (T204)

**Status:** ✅ Implemented

### Overview

Custom analytics events track business-critical user actions and conversions.

**Location:** [lib/analytics.ts](../lib/analytics.ts)

### E-Commerce Events

#### Product Events
```typescript
import { trackProductView, trackAddToCart } from '@/lib/analytics';

// Track product view
trackProductView('product-123', 'Blue T-Shirt', 29.99, 'Clothing');

// Track add to cart
trackAddToCart('product-123', 'Blue T-Shirt', 29.99, 2, 'Clothing');
```

#### Checkout Events
```typescript
import {
  trackCheckoutStarted,
  trackPurchaseCompleted
} from '@/lib/analytics';

// Track checkout start
trackCheckoutStarted(150.00, 3);

// Track purchase
trackPurchaseCompleted(
  'order-123',
  150.00,
  3,
  'stripe',
  'SUMMER10',
  15.00
);
```

#### Cart Events
```typescript
import {
  trackRemoveFromCart,
  trackUpdateCartQuantity,
  trackPromoCodeApplied
} from '@/lib/analytics';

// Track cart removal
trackRemoveFromCart('product-123', 'Blue T-Shirt', 29.99, 1);

// Track quantity update
trackUpdateCartQuantity('product-123', 1, 3, 29.99);

// Track promo code
trackPromoCodeApplied('SUMMER10', 15.00, true);
```

### User Engagement Events

#### Search & Filtering
```typescript
import {
  trackSearch,
  trackProductFilter,
  trackProductSort
} from '@/lib/analytics';

// Track search
trackSearch('blue t-shirt', 42);

// Track filter
trackProductFilter('category', 'clothing', 156);

// Track sort
trackProductSort('price_asc');
```

#### Reviews
```typescript
import { trackReviewSubmitted, trackReviewHelpful } from '@/lib/analytics';

// Track review submission
trackReviewSubmitted('product-123', 5, true, true);

// Track helpful vote
trackReviewHelpful('review-456', 'product-123');
```

### Authentication Events

```typescript
import {
  trackUserRegistration,
  trackUserLogin,
  trackPasswordResetRequested
} from '@/lib/analytics';

// Track registration
trackUserRegistration('email'); // or 'google', 'github'

// Track login
trackUserLogin('email');

// Track password reset
trackPasswordResetRequested();
```

### Account Management Events

```typescript
import {
  trackProfileUpdated,
  trackAddressAdded,
  trackAddToWishlist
} from '@/lib/analytics';

// Track profile update
trackProfileUpdated(['name', 'email', 'phone']);

// Track address addition
trackAddressAdded('shipping');

// Track wishlist addition
trackAddToWishlist('product-123', 'Blue T-Shirt', 29.99);
```

### Admin Events

```typescript
import {
  trackProductCreated,
  trackProductUpdated,
  trackOrderStatusUpdated
} from '@/lib/analytics';

// Track product creation
trackProductCreated('product-123', 'Electronics');

// Track product update
trackProductUpdated('product-123', ['price', 'stock']);

// Track order status change
trackOrderStatusUpdated('order-123', 'processing', 'shipped');
```

### Error & Performance Tracking

```typescript
import {
  trackError,
  track404,
  trackSlowPageLoad,
  trackApiPerformance
} from '@/lib/analytics';

// Track error
trackError('payment_failed', 'Stripe timeout', { orderId: '123' });

// Track 404
track404('/products/nonexistent');

// Track slow page load (only if > 3s)
trackSlowPageLoad('/checkout', 4200);

// Track API performance
trackApiPerformance('/api/products', 350, true);
```

### Custom Events

```typescript
import { trackCustomEvent } from '@/lib/analytics';

// Track any custom event
trackCustomEvent('feature_used', {
  feature: 'virtual_try_on',
  product_id: 'product-123',
});
```

## Business Metrics Dashboard

### Key Performance Indicators (KPIs)

**Conversion Funnel:**
1. Product views
2. Add to cart
3. Checkout started
4. Purchase completed

**Revenue Metrics:**
- Total order value
- Average order value
- Conversion rate
- Cart abandonment rate
- Promo code usage

**User Engagement:**
- Search queries
- Filter usage
- Review submissions
- Helpful votes
- Wishlist additions

**Performance Metrics:**
- Slow page loads
- API response times
- Error rates
- 404 occurrences

## Integration Examples

### Product Page

```typescript
// app/products/[slug]/page.tsx
import { trackProductView } from '@/lib/analytics';

export default function ProductPage({ product }) {
  useEffect(() => {
    trackProductView(
      product.id,
      product.name,
      product.price,
      product.category.name
    );
  }, [product]);

  // ...
}
```

### Add to Cart Button

```typescript
// components/products/add-to-cart-button.tsx
'use client';

import { trackAddToCart } from '@/lib/analytics';

export function AddToCartButton({ product, quantity }) {
  const handleAddToCart = async () => {
    const result = await addToCart(product.id, quantity);

    if (result.success) {
      trackAddToCart(
        product.id,
        product.name,
        product.price,
        quantity,
        product.category.name
      );
    }
  };

  // ...
}
```

### Checkout Flow

```typescript
// app/checkout/page.tsx
import { trackCheckoutStarted, trackPurchaseCompleted } from '@/lib/analytics';

export default function CheckoutPage({ cart }) {
  useEffect(() => {
    trackCheckoutStarted(cart.total, cart.items.length);
  }, []);

  const handleSubmit = async (data) => {
    const order = await createOrder(data);

    if (order.success) {
      trackPurchaseCompleted(
        order.id,
        order.total,
        order.items.length,
        'stripe',
        order.promoCode,
        order.discount
      );
    }
  };

  // ...
}
```

## Data Analysis

### Vercel Analytics Dashboard

Access metrics at: `https://vercel.com/[team]/[project]/analytics`

**Available Data:**
- Page views by route
- User sessions and unique visitors
- Top referring sites
- Geographic distribution
- Device and browser breakdown
- Core Web Vitals scores

### Sentry Dashboard

Access at: `https://sentry.io/organizations/[org]/issues/`

**Available Data:**
- Error frequency and trends
- Affected users
- Stack traces and context
- Performance bottlenecks
- Session replays
- Custom event tracking

## Privacy & Compliance

### Data Collection

**Personal Data:**
- Sentry filters all sensitive user data
- No credit card information logged
- No password fields captured
- Authorization tokens removed

**Analytics:**
- Vercel Analytics is GDPR compliant
- No personal data stored without consent
- Aggregate data only
- IP addresses anonymized

### Opt-Out

Users can opt out of analytics by:
1. Enabling "Do Not Track" in browser
2. Using privacy extensions
3. Contacting support for manual opt-out

## Monitoring Best Practices

### 1. Set Up Alerts

**Sentry Alerts:**
- New error types
- Spike in error rate
- Performance degradation
- Custom threshold alerts

**Vercel Alerts:**
- Performance score drops
- Traffic spikes
- Build failures

### 2. Regular Reviews

- Daily: Check error dashboard
- Weekly: Review performance metrics
- Monthly: Analyze conversion funnel
- Quarterly: Business metrics review

### 3. Action Items

When errors occur:
1. Triage by severity
2. Identify affected users
3. Review session replay
4. Fix and deploy
5. Verify fix in production

## Troubleshooting

### Sentry Not Tracking

**Check:**
1. `SENTRY_DSN` environment variable set
2. `NEXT_PUBLIC_SENTRY_DSN` for client-side tracking
3. Not in development (unless `SENTRY_DEBUG=true`)
4. No ad blockers or privacy extensions

### Vercel Analytics Not Working

**Check:**
1. Deployed to Vercel (doesn't work locally)
2. `<Analytics />` component added to layout
3. Allow 24 hours for data to appear
4. Check project analytics settings

### Custom Events Not Tracked

**Check:**
1. `track()` function imported correctly
2. Event names follow naming conventions
3. Vercel Analytics enabled
4. Running in production or `NEXT_PUBLIC_ANALYTICS_ENABLED=true`

## Resources

- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)

**Last Updated:** 2025-11-21
**Implementation Status:** ✅ Complete
**Next Review:** After first production deployment
