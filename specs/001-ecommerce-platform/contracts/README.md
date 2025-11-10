# API Contracts: E-Commerce Platform

**Date**: 2025-11-09
**Feature**: E-Commerce Platform
**Branch**: 001-ecommerce-platform

## Overview

This directory contains API contract specifications for the e-commerce platform. Since the platform uses Next.js 15 App Router with Server Components and Server Actions, most mutations are handled via Server Actions rather than traditional REST API endpoints.

## Architecture Pattern

### Server Actions (Primary Pattern)
Most data mutations use Next.js Server Actions:
- Form submissions (login, register, checkout)
- Cart operations (add, update, remove)
- Profile updates
- Admin operations

### API Routes (When Needed)
REST API endpoints are used only when:
- External webhooks (Stripe payment events)
- Real-time search autocomplete
- Third-party integrations
- Mobile app future support

## Contract Files

1. **auth.yaml** - Authentication endpoints (NextAuth.js + Server Actions)
2. **products.yaml** - Product catalog endpoints (mostly Server Components with data fetching)
3. **cart.yaml** - Shopping cart Server Actions
4. **orders.yaml** - Order management Server Actions
5. **users.yaml** - User profile Server Actions
6. **reviews.yaml** - Product review Server Actions
7. **admin.yaml** - Admin dashboard Server Actions

## Server Actions vs API Routes

### Server Actions (Recommended)
```typescript
// actions/cart.ts
'use server'

export async function addToCart(productId: string, quantity: number) {
  const session = await getServerSession()
  const userId = session?.user?.id

  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId, items: { create: { productId, quantity } } },
    update: { items: { create: { productId, quantity } } }
  })

  revalidatePath('/cart')
  return { success: true, cart }
}
```

### API Route (For Webhooks)
```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const event = stripe.webhooks.constructEvent(body, sig, secret)

  if (event.type === 'payment_intent.succeeded') {
    await updateOrderStatus(event.data.object.id, 'PROCESSING')
  }

  return NextResponse.json({ received: true })
}
```

## Authentication

All endpoints/Server Actions require authentication unless marked as public.

**Authentication Mechanisms**:
- Session cookies (NextAuth.js) for web users
- JWT tokens for future mobile app support

**Authorization Levels**:
- `public`: No authentication required
- `authenticated`: Requires valid session
- `admin`: Requires admin role

## Error Handling

All Server Actions and API routes follow consistent error response format:

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }
```

**Standard Error Codes**:
- `UNAUTHENTICATED`: No valid session
- `UNAUTHORIZED`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

Rate limiting applied to:
- Authentication endpoints: 5 attempts per 15 minutes
- API search: 100 requests per minute per IP
- Cart operations: 30 requests per minute per user

## Data Validation

All inputs validated using Zod schemas defined in `/lib/validations.ts`.

Example:
```typescript
export const addToCartSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  quantity: z.number().int().min(1).max(99)
})
```

## Pagination

List endpoints support pagination:

```typescript
{
  page: number    // Default: 1
  limit: number   // Default: 20, Max: 100
}

Response:
{
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

## Versioning

Current version: v1 (implicit, no version in URLs)

Future breaking changes will use:
- URL versioning: `/api/v2/...`
- Or header versioning: `Accept: application/vnd.shop.v2+json`

## Testing

Contract testing with:
- Vitest for Server Action unit tests
- Playwright for E2E flow tests
- MSW (Mock Service Worker) for API mocking in tests

## Next Steps

Refer to individual contract files for detailed endpoint specifications and Server Action signatures.
