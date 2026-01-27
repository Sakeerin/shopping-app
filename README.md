# Shopping App - Modern E-Commerce Platform

A production-ready, full-stack e-commerce platform built with Next.js 15, TypeScript, PostgreSQL, and modern web technologies.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

### Customer Features
- 🛍️ **Product Catalog** - Browse products with advanced filtering, sorting, and search
- 🛒 **Shopping Cart** - Real-time cart management with guest and authenticated sessions
- 💳 **Secure Checkout** - Stripe integration for payment processing
- 👤 **User Accounts** - Registration, login, profile management, and order history
- ⭐ **Reviews & Ratings** - Product reviews with verified purchase badges
- 📦 **Order Tracking** - Real-time order status updates and history

### Admin Features
- 📊 **Admin Dashboard** - Comprehensive analytics and business metrics
- 📦 **Product Management** - CRUD operations for products, categories, and variants
- 🛍️ **Order Management** - View, update, and process customer orders
- 👥 **Customer Management** - View customer accounts and order history
- 🎯 **Promotions** - Create and manage promo codes and discounts

### Technical Features
- ⚡ **Performance** - Optimized images (AVIF/WebP), font loading, and React Server Components
- 🔒 **Security** - HTTPS, CSP headers, rate limiting, input sanitization, and CSRF protection
- ♿ **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation and ARIA labels
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- 📈 **Monitoring** - Sentry error tracking and Vercel Analytics
- 🧪 **Testing** - Unit, component, and E2E tests with Playwright

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17.0+ (v20.x recommended)
- **Package Manager**: npm, pnpm, or yarn
- **Database**: PostgreSQL 15+
- **Accounts** (for production):
  - [Stripe](https://stripe.com) for payments
  - [Cloudinary](https://cloudinary.com) for image uploads
  - [Resend](https://resend.com) for transactional emails
  - [Upstash](https://upstash.com) for rate limiting (optional)
  - [Sentry](https://sentry.io) for error tracking (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd shopping-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shopping_app"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe (get from https://stripe.com)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (get from https://resend.com)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# Cloudinary (get from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data (optional)
npx prisma db seed
```

5. **Start development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 📚 Tech Stack

### Core Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Type-safe development
- **[React 19](https://react.dev/)** - UI library with Server Components

### Database & ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Prisma 5.x](https://www.prisma.io/)** - Type-safe ORM

### Authentication & Authorization
- **[NextAuth.js v5](https://next-auth.js.org/)** - Authentication
- **OAuth Providers** - Google, GitHub integration

### Payments
- **[Stripe](https://stripe.com/)** - Payment processing and webhooks

### Styling & UI
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Reusable component library
- **[Framer Motion](https://www.framer.com/motion/)** - Animations

### Forms & Validation
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://zod.dev/)** - Schema validation

### State Management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Client state
- **[TanStack Query](https://tanstack.com/query)** - Server state

### Testing
- **[Vitest](https://vitest.dev/)** - Unit tests
- **[React Testing Library](https://testing-library.com/react)** - Component tests
- **[Playwright](https://playwright.dev/)** - E2E tests

### Monitoring & Analytics
- **[Sentry](https://sentry.io/)** - Error tracking
- **[Vercel Analytics](https://vercel.com/analytics)** - Web analytics
- **Custom Events** - Business metrics tracking

### Infrastructure
- **[Cloudinary](https://cloudinary.com/)** - Image storage and optimization
- **[Resend](https://resend.com/)** - Transactional emails
- **[Upstash Redis](https://upstash.com/)** - Rate limiting
- **[Vercel](https://vercel.com/)** - Deployment platform

## 📁 Project Structure

```
shopping-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, register)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   └── layout.tsx
│   ├── (shop)/                   # Shop routes (public)
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── profile/
│   │   └── layout.tsx            # Header + Footer
│   ├── admin/                    # Admin dashboard
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   └── analytics/
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth
│   │   ├── webhooks/             # Stripe webhooks
│   │   └── search/               # Search autocomplete
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── global-error.tsx          # Error boundary
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives
│   ├── layout/                   # Header, Footer
│   ├── products/                 # Product components
│   ├── cart/                     # Cart components
│   ├── auth/                     # Auth forms
│   ├── profile/                  # Profile components
│   ├── orders/                   # Order components
│   ├── admin/                    # Admin components
│   ├── reviews/                  # Review components
│   └── shared/                   # Shared components
│
├── lib/                          # Utilities
│   ├── db.ts                     # Prisma client
│   ├── auth.ts                   # NextAuth config
│   ├── validations.ts            # Zod schemas
│   ├── email.ts                  # Email service
│   ├── rate-limit.ts             # Rate limiting
│   ├── analytics.ts              # Event tracking
│   └── utils.ts                  # Helpers
│
├── services/                     # Business logic (Server-side)
│   ├── products.ts               # Product operations
│   ├── cart.ts                   # Cart operations
│   ├── orders.ts                 # Order operations
│   ├── users.ts                  # User operations
│   ├── reviews.ts                # Review operations
│   └── admin.ts                  # Admin operations
│
├── actions/                      # Server Actions
│   ├── auth.ts                   # Auth actions
│   ├── cart.ts                   # Cart actions
│   ├── checkout.ts               # Checkout actions
│   ├── products.ts               # Product actions
│   ├── profile.ts                # Profile actions
│   ├── reviews.ts                # Review actions
│   ├── orders.ts                 # Order actions
│   └── admin.ts                  # Admin actions
│
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Seed script
│
├── types/                        # TypeScript types
│   ├── product.ts
│   ├── cart.ts
│   ├── order.ts
│   └── user.ts
│
├── e2e/                          # E2E tests
│   ├── purchase-journey.spec.ts
│   ├── user-registration.spec.ts
│   ├── admin-operations.spec.ts
│   └── accessibility.spec.ts
│
├── docs/                         # Documentation
│   ├── accessibility.md
│   ├── security.md
│   ├── monitoring-analytics.md
│   └── database-optimization.md
│
├── sentry.client.config.ts       # Sentry client config
├── sentry.server.config.ts       # Sentry server config
├── sentry.edge.config.ts         # Sentry edge config
├── instrumentation.ts            # Sentry instrumentation
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── playwright.config.ts          # Playwright config
└── package.json
```

## 🎯 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Database
```bash
npx prisma generate       # Generate Prisma client
npx prisma migrate dev    # Run migrations
npx prisma db push        # Push schema changes
npx prisma db seed        # Seed database
npx prisma studio         # Open Prisma Studio
```

### Testing
```bash
npm test                  # Run all tests
npm run test:e2e         # Run E2E tests
npx playwright test      # Run Playwright tests
npx playwright test --ui # Run with UI mode
```

## 🗄️ Database Schema

### Core Entities

**Users** → Customers and admins with authentication
**Products** → Product catalog with categories and variants
**Cart** → Shopping cart with line items
**Orders** → Customer orders with status tracking
**Reviews** → Product reviews with ratings
**Addresses** → Customer shipping/billing addresses

See [prisma/schema.prisma](prisma/schema.prisma) for complete schema.

## 🔐 Security Features

### Implemented Security Measures

✅ **Security Headers**
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)

✅ **Rate Limiting**
- 10 requests / 10 min for auth endpoints
- 3 requests / hour for password reset
- Upstash Redis-based distributed rate limiting

✅ **Input Sanitization**
- Zod validation on all Server Actions
- SQL injection protection via Prisma
- XSS protection via React escaping

✅ **Authentication & Authorization**
- NextAuth.js with secure session management
- bcrypt password hashing
- Role-based access control (RBAC)

✅ **CSRF Protection**
- SameSite cookies
- Next.js built-in CSRF protection

See [docs/security.md](docs/security.md) for detailed security documentation.

## ♿ Accessibility

WCAG 2.1 AA compliant with:

- ✅ Keyboard navigation for all interactive elements
- ✅ ARIA labels and landmarks
- ✅ Skip links to main content
- ✅ Focus indicators on all interactive elements
- ✅ Screen reader compatible
- ✅ Color contrast compliance

See [docs/accessibility.md](docs/accessibility.md) for testing guide.

## 📊 Monitoring & Analytics

### Error Tracking (Sentry)
- Real-time error tracking
- Performance monitoring
- Session replay
- Custom event tracking

### Analytics (Vercel)
- Page views and user sessions
- Core Web Vitals
- Geographic data
- Device and browser stats

### Custom Business Metrics
- Conversion funnel tracking
- Product performance
- Cart abandonment rate
- Average order value

See [docs/monitoring-analytics.md](docs/monitoring-analytics.md) for setup guide.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Visit [vercel.com/new](https://vercel.com/new)
- Import your repository
- Configure environment variables
- Deploy

3. **Configure Environment Variables**

Add all variables from `.env.local.example` in Vercel project settings.

4. **Set up Stripe Webhooks**
```bash
# Get webhook signing secret from Stripe dashboard
# Add to STRIPE_WEBHOOK_SECRET in Vercel
```

5. **Run Database Migrations**
```bash
# From your local machine with production DATABASE_URL
npx prisma migrate deploy
```

### Deploy to Other Platforms

See [Next.js Deployment Documentation](https://nextjs.org/docs/deployment) for other platforms.

## 📖 Documentation

### Project Documentation
- [Feature Specification](specs/001-ecommerce-platform/spec.md) - Complete feature requirements
- [Implementation Plan](specs/001-ecommerce-platform/plan.md) - Technical architecture
- [Data Model](specs/001-ecommerce-platform/data-model.md) - Database entities
- [API Contracts](specs/001-ecommerce-platform/contracts/) - API specifications
- [Task List](specs/001-ecommerce-platform/tasks.md) - Implementation tasks

### Technical Documentation
- [Accessibility Guide](docs/accessibility.md) - WCAG compliance
- [Security Guide](docs/security.md) - Security measures
- [Monitoring & Analytics](docs/monitoring-analytics.md) - Tracking setup
- [Database Optimization](docs/database-optimization.md) - Performance tips

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# E2E tests
npm run test:e2e

# With UI
npx playwright test --ui

# Specific test file
npx playwright test e2e/accessibility.spec.ts
```

### Test Coverage

- **Unit Tests**: Business logic and utilities
- **Component Tests**: React component behavior
- **E2E Tests**: User journeys and workflows
- **Accessibility Tests**: WCAG compliance

## 🛠️ Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Follow TypeScript strict mode
- Write tests for new features
- Update documentation

### 3. Run Checks
```bash
npm run lint
npm run type-check
npm test
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add your feature"
```

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

## 📝 Environment Variables

See [.env.local.example](.env.local.example) for all required environment variables.

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Optional Variables

- `UPSTASH_REDIS_REST_URL` - Rate limiting (production)
- `SENTRY_DSN` - Error tracking (production)
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GITHUB_CLIENT_ID` - GitHub OAuth

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [shadcn](https://twitter.com/shadcn) for the UI components
- [Vercel](https://vercel.com/) for hosting and analytics
- All open-source contributors

## 📞 Support

- 📧 Email: support@shoppingapp.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/shopping-app/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/shopping-app/discussions)

---

**Built with ❤️ using Next.js 15 and TypeScript**
