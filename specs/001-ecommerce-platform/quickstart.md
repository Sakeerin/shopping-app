# Quickstart Guide: E-Commerce Platform

**Date**: 2025-11-09
**Feature**: E-Commerce Platform
**Branch**: 001-ecommerce-platform

## Overview

This guide provides step-by-step instructions for setting up and developing the e-commerce platform. Follow these instructions to get the application running locally and understand the development workflow.

## Prerequisites

### Required Software
- **Node.js**: v18.17.0 or later (v20.x recommended)
- **pnpm**: v8.x or later (or npm/yarn)
- **Git**: Latest version
- **PostgreSQL**: v15+ (or use Supabase/Neon cloud)
- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense

### Required Accounts
- **GitHub**: For repository hosting
- **Vercel**: For deployment (free tier)
- **Supabase** or **Neon**: For PostgreSQL database (free tier)
- **Stripe**: For payment processing (test mode)
- **Cloudinary**: For image storage (free tier)
- **Resend** or **SendGrid**: For transactional emails (free tier)

---

## Initial Setup

### 1. Clone Repository and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd shopping-app

# Checkout the feature branch
git checkout 001-ecommerce-platform

# Install dependencies
pnpm install
```

---

### 2. Environment Configuration

Create `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/shopping_app"
DIRECT_URL="postgresql://user:password@host:5432/shopping_app" # For migrations

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# OAuth Providers (optional for MVP)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourapp.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

### 3. Database Setup

#### Using Supabase (Recommended)

1. Create account at https://supabase.com
2. Create new project
3. Copy connection string from Project Settings → Database
4. Add to `DATABASE_URL` in `.env.local`

#### Using Local PostgreSQL

```bash
# Create database
createdb shopping_app

# Connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/shopping_app"
```

#### Run Migrations

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# Seed database (optional)
pnpm prisma db seed
```

---

### 4. Stripe Setup

1. Create account at https://stripe.com
2. Get API keys from Dashboard → Developers → API keys
3. Use **Test mode** keys (pk_test_... and sk_test_...)
4. Setup webhook:
   - Go to Developers → Webhooks
   - Add endpoint: `http://localhost:3000/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

#### Test Webhook Locally (Stripe CLI)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

### 5. Cloudinary Setup

1. Create account at https://cloudinary.com
2. Get credentials from Dashboard
3. Add to `.env.local`

---

### 6. Email Setup (Resend)

1. Create account at https://resend.com
2. Create API key
3. Verify domain (or use resend.dev for testing)
4. Add to `.env.local`

---

## Development Workflow

### Start Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

---

### Project Structure Navigation

```
app/
├── (auth)/           # Login, register, password reset
├── (shop)/           # Product catalog, cart, checkout
└── (dashboard)/      # Admin dashboard

components/           # React components
├── ui/              # shadcn/ui components
├── products/        # Product-related components
├── cart/            # Cart components
└── ...

lib/                 # Utilities
├── db.ts           # Prisma client
├── auth.ts         # NextAuth config
├── stripe.ts       # Stripe client
└── validations.ts  # Zod schemas

services/            # Business logic
├── products.ts     # Product operations
├── cart.ts         # Cart management
└── orders.ts       # Order processing

actions/             # Server Actions
├── auth.ts         # Authentication actions
├── cart.ts         # Cart actions
└── checkout.ts     # Checkout actions

prisma/
└── schema.prisma   # Database schema
```

---

## Development Tasks

### Install shadcn/ui Components

```bash
# Initialize shadcn/ui (if not already done)
pnpm dlx shadcn-ui@latest init

# Add components as needed
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add dialog
# ... etc
```

---

### Database Management

#### View Data (Prisma Studio)

```bash
pnpm prisma studio
```

Visit http://localhost:5555

#### Create Migration

```bash
# After schema changes
pnpm prisma migrate dev --name describe-change
```

#### Reset Database

```bash
pnpm prisma migrate reset
```

---

### Testing

#### Run All Tests

```bash
pnpm test
```

#### Run Unit Tests

```bash
pnpm test:unit
```

#### Run Component Tests

```bash
pnpm test:component
```

#### Run E2E Tests

```bash
pnpm test:e2e
```

#### Run with Coverage

```bash
pnpm test:coverage
```

---

### Code Quality

#### Lint Code

```bash
pnpm lint
```

#### Format Code

```bash
pnpm format
```

#### Type Check

```bash
pnpm type-check
```

---

## Common Development Scenarios

### Adding a New Product (Admin)

1. Start dev server: `pnpm dev`
2. Navigate to http://localhost:3000/admin
3. Login as admin (seed data includes admin@example.com)
4. Go to Products → Add New Product
5. Fill form and upload images
6. Click Save

### Testing Checkout Flow

1. Browse products: http://localhost:3000/products
2. Add items to cart
3. Go to cart: http://localhost:3000/cart
4. Click Checkout
5. Fill shipping address
6. Use Stripe test card: `4242 4242 4242 4242`
7. Expiry: Any future date (e.g., 12/34)
8. CVC: Any 3 digits (e.g., 123)
9. Complete payment
10. View order confirmation

### Creating a New Server Action

1. Create file in `actions/` directory
2. Add `'use server'` directive at top
3. Define async function
4. Add Zod validation
5. Implement business logic
6. Return result object
7. Export function

Example:
```typescript
// actions/example.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'

const schema = z.object({
  name: z.string().min(1)
})

export async function exampleAction(data: unknown) {
  const parsed = schema.parse(data)

  // Business logic
  const result = await prisma.example.create({
    data: parsed
  })

  return { success: true, data: result }
}
```

---

## Testing with Mock Data

### Seed Database with Sample Data

```bash
pnpm prisma db seed
```

Creates:
- Admin user: admin@example.com / password123
- Customer user: customer@example.com / password123
- 50 sample products across categories
- 5 categories
- Sample reviews

### Test Cards (Stripe)

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires authentication |

---

## Troubleshooting

### Database Connection Errors

```bash
# Test connection
pnpm prisma db push

# Check DATABASE_URL is correct
echo $DATABASE_URL

# Reset and retry
pnpm prisma migrate reset
```

### Build Errors

```bash
# Clear cache
rm -rf .next
rm -rf node_modules
pnpm install

# Regenerate Prisma client
pnpm prisma generate
```

### Type Errors

```bash
# Update types
pnpm type-check

# Regenerate Prisma types
pnpm prisma generate
```

### Stripe Webhook Issues

```bash
# Ensure Stripe CLI is running
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check webhook secret matches .env.local
# Verify webhook events are being received in Stripe dashboard
```

---

## Next Steps

### Immediate Tasks (MVP)

1. Setup development environment (this guide)
2. Implement authentication pages (login, register)
3. Build product listing page
4. Create product detail page
5. Implement cart functionality
6. Build checkout flow
7. Setup Stripe payment
8. Create admin dashboard

### Phase 2 (Post-MVP)

1. Add product search
2. Implement reviews
3. Advanced filtering
4. Order tracking
5. Email notifications
6. Analytics dashboard

---

## Resources

### Documentation
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Stripe**: https://stripe.com/docs
- **NextAuth.js**: https://next-auth.js.org

### Community
- **Next.js Discord**: https://discord.gg/nextjs
- **Prisma Discord**: https://discord.gg/prisma

### Learning
- **Next.js Learn**: https://nextjs.org/learn
- **Stripe Testing**: https://stripe.com/docs/testing

---

## Getting Help

1. Check documentation links above
2. Search existing GitHub issues
3. Ask in Discord communities
4. Create GitHub issue with reproduction steps

---

## Production Deployment

See separate deployment guide for production setup:
- Environment variables configuration
- Database migrations
- Stripe webhook setup
- Domain configuration
- SSL certificates
- Performance monitoring

**Note**: Do not deploy to production until all tests pass and security review is complete.
