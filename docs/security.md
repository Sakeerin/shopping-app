# Security Guide

## T198-T201: Security Hardening (Phase 9 - Security Hardening)

This document outlines the security measures implemented in the e-commerce platform to protect against common web vulnerabilities and attacks.

## Security Headers (T198)

**Location:** [next.config.ts](../next.config.ts)

### Implemented Headers

#### 1. Strict-Transport-Security (HSTS)
```
max-age=63072000; includeSubDomains; preload
```
- Enforces HTTPS connections for 2 years
- Applies to all subdomains
- Eligible for browser preload lists

#### 2. X-Frame-Options
```
SAMEORIGIN
```
- Prevents clickjacking attacks
- Only allows embedding from same origin
- Protects against UI redress attacks

#### 3. X-Content-Type-Options
```
nosniff
```
- Prevents MIME type sniffing
- Forces browsers to respect declared content types
- Mitigates drive-by download attacks

#### 4. X-XSS-Protection
```
1; mode=block
```
- Enables browser XSS filtering
- Blocks page rendering if XSS attack detected
- Legacy header maintained for older browsers

#### 5. Referrer-Policy
```
strict-origin-when-cross-origin
```
- Controls referrer information sent with requests
- Full URL for same-origin requests
- Origin only for cross-origin HTTPS requests
- No referrer for HTTPS→HTTP downgrades

#### 6. Permissions-Policy
```
camera=(), microphone=(), geolocation=()
```
- Disables access to sensitive browser features
- Prevents unauthorized access to device capabilities
- Reduces attack surface

#### 7. Content-Security-Policy (CSP)

Comprehensive CSP protecting against XSS and injection attacks:

**Default Source:**
- `default-src 'self'` - Only allow resources from same origin by default

**Scripts:**
- `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://vercel.live`
- Allows scripts from app, Stripe payment processing, and Vercel Live (dev)
- `unsafe-eval` required for Next.js development
- `unsafe-inline` for inline event handlers (consider removing in production)

**Styles:**
- `style-src 'self' 'unsafe-inline'`
- Allows inline styles for Tailwind CSS and styled-components
- Consider using nonces in production for better security

**Images:**
- `img-src 'self' data: blob: https://res.cloudinary.com https://*.stripe.com`
- Allows images from app, Cloudinary (product images), and Stripe

**Fonts:**
- `font-src 'self' data:`
- Allows fonts from app and data URIs

**Connect:**
- `connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://vercel.live`
- API requests to Stripe and Vercel Live allowed

**Frames:**
- `frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://vercel.live`
- Stripe checkout iframe and Vercel Live allowed

**Objects:**
- `object-src 'none'`
- Blocks Flash, Java, and other plugins

**Other Directives:**
- `base-uri 'self'` - Prevents base tag injection
- `form-action 'self'` - Forms can only submit to same origin
- `frame-ancestors 'self'` - Controls embedding in iframes
- `upgrade-insecure-requests` - Auto-upgrades HTTP to HTTPS

### Testing Security Headers

```bash
# Test with curl
curl -I https://your-domain.com

# Or use online tools
https://securityheaders.com
https://observatory.mozilla.org
```

## Rate Limiting (T199)

**Location:** [lib/rate-limit.ts](../lib/rate-limit.ts)

### Implementation

Using **Upstash Redis** for distributed rate limiting:

```bash
npm install @upstash/ratelimit @upstash/redis
```

### Configuration

Set environment variables:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Development Mode:** Rate limiting is disabled if environment variables are not set.

### Rate Limit Policies

#### 1. Authentication Endpoints
- **Limit:** 10 requests per 10 minutes per IP
- **Applied to:** Registration, login attempts
- **Purpose:** Prevent brute force attacks

```typescript
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 m'),
  analytics: true,
  prefix: '@ratelimit/auth',
});
```

#### 2. Password Reset Endpoints
- **Limit:** 3 requests per hour per IP
- **Applied to:** Password reset requests
- **Purpose:** Prevent password reset abuse and email enumeration

```typescript
export const passwordResetRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: '@ratelimit/password-reset',
});
```

#### 3. API Endpoints
- **Limit:** 100 requests per minute per IP
- **Applied to:** General API routes
- **Purpose:** Prevent API abuse

```typescript
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: '@ratelimit/api',
});
```

#### 4. Server Actions
- **Limit:** 60 requests per minute per IP
- **Applied to:** Form submissions and mutations
- **Purpose:** Prevent form spam and abuse

```typescript
export const actionRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: true,
  prefix: '@ratelimit/action',
});
```

### Usage in Server Actions

**Example: Registration with Rate Limiting**

```typescript
// actions/auth.ts
import { authRateLimit, getClientIdentifier, checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function registerUser(formData: FormData) {
  // Get client IP address
  const headersList = await headers();
  const identifier = getClientIdentifier(headersList);

  // Check rate limit
  const rateLimitResult = await checkRateLimit(authRateLimit, identifier);

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: `Too many attempts. Try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 60000)} minutes.`,
    };
  }

  // Proceed with registration...
}
```

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1699564800000
Retry-After: 600
```

## Input Sanitization (T200)

**Status:** ✅ Verified - All Server Actions use Zod validation

### Validation Strategy

All user inputs are validated using **Zod** schemas before processing:

#### Authentication
```typescript
// lib/validations.ts
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

#### Cart Operations
```typescript
export const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  variantId: z.string().optional(),
});
```

#### Checkout
```typescript
export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  useSameAddress: z.boolean().default(true),
  promoCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});
```

#### Reviews
```typescript
const submitReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10).max(1000),
});
```

### Sanitization Flow

1. **Client-side validation:** Basic validation in React forms
2. **Schema validation:** Zod validates and transforms input
3. **Database queries:** Prisma uses parameterized queries (SQL injection protection)
4. **Output encoding:** React automatically escapes HTML (XSS protection)

### Protected Actions

All server actions in the following files use Zod validation:

- ✅ [actions/auth.ts](../actions/auth.ts) - Registration, password reset
- ✅ [actions/cart.ts](../actions/cart.ts) - Add, update, remove items
- ✅ [actions/checkout.ts](../actions/checkout.ts) - Order creation
- ✅ [actions/profile.ts](../actions/profile.ts) - Profile updates
- ✅ [actions/reviews.ts](../actions/reviews.ts) - Review submission
- ✅ [actions/admin.ts](../actions/admin.ts) - Admin operations
- ✅ [actions/products.ts](../actions/products.ts) - Product management
- ✅ [actions/orders.ts](../actions/orders.ts) - Order operations

## CORS Configuration (T201)

**Status:** Not required for current implementation

### Current Setup

- **Architecture:** Monolithic Next.js application
- **API Type:** Server Actions (same-origin)
- **Frontend:** React components served from same domain
- **No CORS needed:** All requests are same-origin

### When CORS is Needed

Enable CORS if you add:
1. **Separate API domain** (api.example.com serving app.example.com)
2. **Mobile app** accessing Next.js API routes
3. **Third-party integrations** requiring API access
4. **Subdomain architecture** with cross-origin requests

### Future CORS Configuration

If needed, add to API routes:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}
```

## Additional Security Measures

### 1. Password Security
- **Hashing:** bcryptjs with 10 salt rounds
- **Minimum length:** 8 characters
- **Stored:** Hashed passwords only, never plaintext

### 2. Session Security
- **Provider:** NextAuth.js 5.x
- **Storage:** JWT tokens (encrypted)
- **Cookie settings:**
  ```typescript
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
  ```

### 3. SQL Injection Protection
- **Prisma ORM:** Parameterized queries
- **No raw SQL:** All queries through Prisma client
- **Type safety:** TypeScript ensures correct query structure

### 4. XSS Protection
- **React:** Automatic HTML escaping
- **CSP:** Content Security Policy headers
- **Output encoding:** All user content sanitized

### 5. CSRF Protection
- **SameSite cookies:** `lax` setting prevents CSRF
- **Next.js:** Built-in CSRF protection for forms
- **Server Actions:** Automatic CSRF token validation

### 6. Authentication Best Practices
- **Email verification:** Welcome emails sent on registration
- **Password reset tokens:** Cryptographically secure, time-limited
- **Session management:** Automatic expiration and refresh
- **Role-based access:** ADMIN/CUSTOMER roles enforced

### 7. File Upload Security
- **Image uploads:** Restricted to Cloudinary
- **Size limits:** Server Actions limited to 2MB
- **Type validation:** Image MIME types only

### 8. API Security
- **Rate limiting:** Upstash Redis rate limits
- **Authentication required:** Protected routes check session
- **Authorization:** Role-based access control

## Security Checklist

### Development
- [x] Security headers configured
- [x] Rate limiting implemented
- [x] Input validation with Zod
- [x] HTTPS in production
- [x] Environment variables secured
- [x] Secrets in `.env.local` (not committed)

### Pre-Production
- [ ] Enable Upstash Redis for rate limiting
- [ ] Configure Stripe webhooks with signature verification
- [ ] Set up error tracking (Sentry)
- [ ] Review CSP directives (remove `unsafe-inline` if possible)
- [ ] Enable security monitoring
- [ ] Perform penetration testing

### Production
- [ ] Force HTTPS (HSTS enabled)
- [ ] Monitor rate limit violations
- [ ] Review security logs regularly
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Implement automated security scanning
- [ ] Set up database backups

## Monitoring and Incident Response

### Security Monitoring

```typescript
// Log suspicious activity
if (!rateLimitResult.success) {
  console.warn('Rate limit exceeded:', {
    identifier,
    endpoint: 'auth/register',
    timestamp: new Date().toISOString(),
  });
}
```

### Incident Response

1. **Detection:** Monitor logs for unusual patterns
2. **Containment:** Rate limits automatically block suspicious IPs
3. **Investigation:** Review logs and identify attack vector
4. **Recovery:** Clear rate limit cache if needed, patch vulnerabilities
5. **Prevention:** Update security rules, add monitoring

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
- [Content Security Policy Guide](https://content-security-policy.com/)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)

**Last Updated:** 2025-11-21
**Security Audit Status:** Completed Phase 9 Security Hardening
**Next Review:** Before production deployment
