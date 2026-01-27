# Server Actions API Documentation

## T207: API Documentation (Phase 9 - Documentation)

This document provides comprehensive documentation for all Server Actions in the e-commerce platform.

## Table of Contents

- [Authentication Actions](#authentication-actions)
- [Cart Actions](#cart-actions)
- [Checkout Actions](#checkout-actions)
- [Product Actions](#product-actions)
- [Profile Actions](#profile-actions)
- [Review Actions](#review-actions)
- [Order Actions](#order-actions)
- [Admin Actions](#admin-actions)

---

## Authentication Actions

**Location:** [actions/auth.ts](../actions/auth.ts)

### registerUser

Register a new user account.

**Parameters:**
```typescript
FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: {
    user: {
      id: string
      name: string
      email: string
      role: 'CUSTOMER' | 'ADMIN'
    }
  }
  error?: string
}
```

**Rate Limit:** 10 requests / 10 minutes per IP

**Example:**
```typescript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('password', 'SecurePass123');
formData.append('confirmPassword', 'SecurePass123');

const result = await registerUser(formData);
```

**Validation:**
- Name: minimum 2 characters
- Email: valid email format
- Password: minimum 8 characters
- Passwords must match

**Side Effects:**
- Creates user in database
- Hashes password with bcrypt
- Sends welcome email
- Revalidates root path

---

### requestPasswordReset

Request a password reset email.

**Parameters:**
```typescript
FormData {
  email: string
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: {
    message: string
  }
  error?: string
}
```

**Rate Limit:** 3 requests / hour per IP

**Security:**
- Always returns success to prevent email enumeration
- Token expires in 1 hour
- Token is SHA-256 hashed

**Example:**
```typescript
const formData = new FormData();
formData.append('email', 'john@example.com');

const result = await requestPasswordReset(formData);
```

---

### resetPassword

Reset password using reset token.

**Parameters:**
```typescript
token: string
FormData {
  password: string
  confirmPassword: string
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: {
    message: string
  }
  error?: string
}
```

**Example:**
```typescript
const formData = new FormData();
formData.append('password', 'NewSecurePass123');
formData.append('confirmPassword', 'NewSecurePass123');

const result = await resetPassword('reset-token-here', formData);
```

---

## Cart Actions

**Location:** [actions/cart.ts](../actions/cart.ts)

### addToCart

Add a product to the shopping cart.

**Parameters:**
```typescript
FormData {
  productId: string
  quantity: number
  variantId?: string
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: Cart
  error?: string
}
```

**Example:**
```typescript
const formData = new FormData();
formData.append('productId', 'product-123');
formData.append('quantity', '2');

const result = await addToCart(formData);
```

**Validation:**
- ProductId: required
- Quantity: 1-99
- VariantId: optional

**Side Effects:**
- Creates cart if doesn't exist
- Merges guest cart on login
- Revalidates /cart and /checkout paths

---

### updateCartItem

Update quantity of cart item.

**Parameters:**
```typescript
FormData {
  cartItemId: string
  quantity: number
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: CartItem
  error?: string
}
```

**Example:**
```typescript
const formData = new FormData();
formData.append('cartItemId', 'item-123');
formData.append('quantity', '5');

const result = await updateCartItem(formData);
```

---

### removeFromCart

Remove item from cart.

**Parameters:**
```typescript
FormData {
  cartItemId: string
}
```

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

**Example:**
```typescript
const formData = new FormData();
formData.append('cartItemId', 'item-123');

const result = await removeFromCart(formData);
```

---

### applyPromoCode

Apply promo code to cart.

**Parameters:**
```typescript
FormData {
  code: string
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: {
    discount: number
    code: string
  }
  error?: string
}
```

**Example:**
```typescript
const formData = new FormData();
formData.append('code', 'SUMMER10');

const result = await applyPromoCode(formData);
```

---

## Checkout Actions

**Location:** [actions/checkout.ts](../actions/checkout.ts)

### createOrderAction

Create order from cart.

**Parameters:**
```typescript
FormData {
  fullName: string
  street: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  useSameAddress: boolean
  promoCode?: string
  notes?: string
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: {
    orderId: string
    clientSecret: string
  }
  error?: string
}
```

**Example:**
```typescript
const formData = new FormData();
formData.append('fullName', 'John Doe');
formData.append('street', '123 Main St');
formData.append('city', 'New York');
formData.append('state', 'NY');
formData.append('postalCode', '10001');
formData.append('country', 'US');
formData.append('phone', '+1234567890');
formData.append('useSameAddress', 'true');

const result = await createOrderAction(formData);
```

**Validation:**
- All address fields validated
- Phone number format checked
- Postal code validated by country

**Side Effects:**
- Creates order in PENDING status
- Creates Stripe PaymentIntent
- Saves shipping address
- Revalidates /orders path

---

## Product Actions

**Location:** [actions/products.ts](../actions/products.ts)

### createProduct (Admin)

Create a new product.

**Parameters:**
```typescript
FormData {
  name: string
  description: string
  price: number
  categoryId: string
  images: string[]
  stock: number
  isFeatured: boolean
  isActive: boolean
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: Product
  error?: string
}
```

**Authorization:** Admin only

**Example:**
```typescript
const formData = new FormData();
formData.append('name', 'Blue T-Shirt');
formData.append('description', 'Comfortable cotton t-shirt');
formData.append('price', '29.99');
formData.append('categoryId', 'category-123');
formData.append('images', JSON.stringify(['image1.jpg', 'image2.jpg']));
formData.append('stock', '100');

const result = await createProduct(formData);
```

---

### updateProduct (Admin)

Update existing product.

**Parameters:**
```typescript
productId: string
FormData {
  name?: string
  description?: string
  price?: number
  stock?: number
  isFeatured?: boolean
  isActive?: boolean
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: Product
  error?: string
}
```

**Authorization:** Admin only

---

## Profile Actions

**Location:** [actions/profile.ts](../actions/profile.ts)

### updateProfile

Update user profile information.

**Parameters:**
```typescript
FormData {
  name?: string
  email?: string
  phone?: string
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: User
  error?: string
}
```

**Authorization:** Authenticated users only

**Example:**
```typescript
const formData = new FormData();
formData.append('name', 'John Smith');
formData.append('phone', '+1234567890');

const result = await updateProfile(formData);
```

---

### addAddress

Add new shipping/billing address.

**Parameters:**
```typescript
FormData {
  type: 'SHIPPING' | 'BILLING'
  fullName: string
  street: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: Address
  error?: string
}
```

**Authorization:** Authenticated users only

**Example:**
```typescript
const formData = new FormData();
formData.append('type', 'SHIPPING');
formData.append('fullName', 'John Doe');
formData.append('street', '123 Main St');
formData.append('city', 'New York');
formData.append('state', 'NY');
formData.append('postalCode', '10001');
formData.append('country', 'US');
formData.append('phone', '+1234567890');
formData.append('isDefault', 'true');

const result = await addAddress(formData);
```

---

### updateAddress

Update existing address.

**Parameters:**
```typescript
addressId: string
FormData {
  fullName?: string
  street?: string
  city?: string
  // ... other address fields
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: Address
  error?: string
}
```

**Authorization:** Address owner only

---

### deleteAddress

Delete an address.

**Parameters:**
```typescript
addressId: string
```

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

**Authorization:** Address owner only

---

## Review Actions

**Location:** [actions/reviews.ts](../actions/reviews.ts)

### submitReview

Submit a product review.

**Parameters:**
```typescript
{
  productId: string
  rating: number      // 1-5
  title?: string
  comment: string
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: Review
  error?: string
}
```

**Authorization:** Authenticated users only

**Validation:**
- Rating: 1-5 (integer)
- Comment: 10-1000 characters
- One review per product per user

**Example:**
```typescript
const data = {
  productId: 'product-123',
  rating: 5,
  title: 'Great product!',
  comment: 'This product exceeded my expectations. Highly recommend!'
};

const result = await submitReview(data);
```

**Features:**
- Automatically verifies if user purchased product
- Sets `isVerifiedPurchase` flag
- Prevents duplicate reviews

---

### updateReview

Update existing review.

**Parameters:**
```typescript
reviewId: string
{
  rating?: number
  title?: string
  comment?: string
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: Review
  error?: string
}
```

**Authorization:** Review owner only

---

### deleteReview

Delete a review.

**Parameters:**
```typescript
reviewId: string
```

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

**Authorization:** Review owner or admin

---

### markReviewHelpful

Mark review as helpful.

**Parameters:**
```typescript
reviewId: string
```

**Returns:**
```typescript
{
  success: boolean
  data?: {
    helpfulCount: number
  }
  error?: string
}
```

**Authorization:** Authenticated users only

**Example:**
```typescript
const result = await markReviewHelpful('review-123');
```

---

## Order Actions

**Location:** [actions/orders.ts](../actions/orders.ts)

### getOrderDetails

Get order details by ID.

**Parameters:**
```typescript
orderId: string
```

**Returns:**
```typescript
{
  success: boolean
  data?: Order
  error?: string
}
```

**Authorization:** Order owner or admin

---

### cancelOrder

Cancel an order.

**Parameters:**
```typescript
orderId: string
```

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

**Authorization:** Order owner (only if status is PENDING or PROCESSING)

**Example:**
```typescript
const result = await cancelOrder('order-123');
```

**Business Rules:**
- Can only cancel orders in PENDING or PROCESSING status
- Cannot cancel SHIPPED or DELIVERED orders
- Refund initiated if payment was captured

---

## Admin Actions

**Location:** [actions/admin.ts](../actions/admin.ts)

### updateOrderStatus (Admin)

Update order status.

**Parameters:**
```typescript
FormData {
  orderId: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  trackingNumber?: string
}
```

**Returns:**
```typescript
{
  success: boolean
  data?: Order
  error?: string
}
```

**Authorization:** Admin only

**Example:**
```typescript
const formData = new FormData();
formData.append('orderId', 'order-123');
formData.append('status', 'SHIPPED');
formData.append('trackingNumber', 'TRACK123456');

const result = await updateOrderStatus(formData);
```

**Side Effects:**
- Sends email notification to customer
- Updates order history

---

### deleteProduct (Admin)

Delete a product (soft delete).

**Parameters:**
```typescript
productId: string
```

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

**Authorization:** Admin only

**Note:** Sets `isActive: false` instead of hard delete

---

## Common Response Types

### ActionResult

```typescript
type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
}
```

### Error Handling

All Server Actions follow this error handling pattern:

```typescript
try {
  // Validation
  const validated = schema.parse(data);

  // Business logic
  const result = await service.operation(validated);

  return {
    success: true,
    data: result
  };
} catch (error) {
  if (error instanceof ZodError) {
    return {
      success: false,
      error: error.errors[0].message
    };
  }

  return {
    success: false,
    error: 'An error occurred'
  };
}
```

## Rate Limiting

**Authentication Actions:**
- Register, Login: 10 requests / 10 minutes
- Password Reset: 3 requests / hour

**Other Actions:**
- General: 60 requests / minute

See [lib/rate-limit.ts](../lib/rate-limit.ts) for implementation.

## Security

All Server Actions implement:

✅ **Input Validation** - Zod schemas
✅ **Authentication** - NextAuth session checks
✅ **Authorization** - Role-based access control
✅ **Rate Limiting** - IP-based limits
✅ **CSRF Protection** - Built-in Next.js protection
✅ **SQL Injection Protection** - Prisma parameterized queries

## Usage in Client Components

### Basic Usage

```typescript
'use client';

import { addToCart } from '@/actions/cart';
import { useState } from 'react';

export function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('quantity', '1');

    const result = await addToCart(formData);

    if (result.success) {
      console.log('Added to cart!');
    } else {
      console.error(result.error);
    }

    setLoading(false);
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

### With Form

```typescript
'use client';

import { registerUser } from '@/actions/auth';

export function RegisterForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (result.success) {
      // Redirect to login
    } else {
      // Show error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <input name="confirmPassword" type="password" required />
      <button type="submit">Register</button>
    </form>
  );
}
```

### With useTransition

```typescript
'use client';

import { addToCart } from '@/actions/cart';
import { useTransition } from 'react';

export function AddToCartButton({ productId }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('quantity', '1');

      await addToCart(formData);
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

## Testing

See [e2e/](../e2e/) for E2E tests covering all Server Actions.

**Example Test:**
```typescript
test('should add product to cart', async ({ page }) => {
  await page.goto('/products/product-slug');
  await page.click('button:has-text("Add to Cart")');

  await expect(page.locator('.cart-count')).toHaveText('1');
});
```

## Future Enhancements

- [ ] GraphQL API layer
- [ ] REST API endpoints
- [ ] WebSocket for real-time updates
- [ ] API versioning
- [ ] API rate limiting per user
- [ ] API key authentication for third-party integrations

---

**Last Updated:** 2025-11-21
**API Version:** 1.0.0
**Stability:** Stable
