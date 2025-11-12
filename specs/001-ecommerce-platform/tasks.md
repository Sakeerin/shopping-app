# Tasks: E-Commerce Platform

**Input**: Design documents from `/specs/001-ecommerce-platform/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: This project follows TDD (Test-Driven Development) as mandated by the constitution. Tests MUST be written FIRST, verified to FAIL, before implementing features.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js 15 App Router structure:
- **App routes**: `app/(auth)/`, `app/(shop)/`, `app/(dashboard)/`
- **Components**: `components/ui/`, `components/products/`, `components/cart/`
- **Services**: `services/products.ts`, `services/cart.ts`, `services/orders.ts`
- **Server Actions**: `actions/auth.ts`, `actions/cart.ts`, `actions/checkout.ts`
- **Database**: `prisma/schema.prisma`, `prisma/migrations/`
- **Tests**: `tests/unit/`, `tests/component/`, `tests/integration/`, `tests/e2e/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js 15 project with required dependencies and configuration.

- [ ] T001 Initialize Next.js 15 project with TypeScript and App Router using `npx create-next-app@latest`
- [ ] T002 [P] Install core dependencies: `prisma`, `@prisma/client`, `next-auth`, `@auth/prisma-adapter`
- [ ] T003 [P] Install UI dependencies: `tailwindcss`, `@radix-ui/react-*`, `class-variance-authority`, `clsx`, `tailwind-merge`
- [ ] T004 [P] Install form dependencies: `react-hook-form`, `@hookform/resolvers`, `zod`
- [ ] T005 [P] Install state management: `zustand`
- [ ] T006 [P] Install Stripe: `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`
- [ ] T007 [P] Install email service: `resend` or `@sendgrid/mail`
- [ ] T008 [P] Install testing dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@playwright/test`
- [ ] T009 [P] Install dev dependencies: `eslint`, `prettier`, `typescript`, `@types/node`, `@types/react`
- [ ] T010 Configure TypeScript strict mode in `tsconfig.json`
- [ ] T011 [P] Configure ESLint in `.eslintrc.json` with Next.js and TypeScript rules
- [ ] T012 [P] Configure Prettier in `.prettierrc` with consistent formatting rules
- [ ] T013 [P] Configure Tailwind CSS in `tailwind.config.ts` with shadcn/ui theme
- [ ] T014 Create environment variable template `.env.local.example` with all required keys
- [ ] T015 [P] Configure Next.js in `next.config.js` (images, security headers, experimental features)
- [ ] T016 [P] Configure Vitest in `vitest.config.ts` with coverage thresholds (80% business logic)
- [ ] T017 [P] Configure Playwright in `playwright.config.ts` for E2E tests
- [ ] T018 Create project directory structure per plan.md (app, components, lib, services, actions)
- [ ] T019 [P] Setup Prisma with `prisma init` and configure PostgreSQL connection
- [ ] T020 [P] Create `.gitignore` with Next.js, Node, and environment files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Database Schema & Migrations

- [X] T021 Define complete Prisma schema in `prisma/schema.prisma` (User, Product, Category, Cart, Order, Review, PromoCode, etc.)
- [X] T022 Create initial database migration with `prisma migrate dev --name init` (Requires DB connection - user must run manually)
- [X] T023 Generate Prisma client with `prisma generate`
- [X] T024 Create database seed script in `prisma/seed.ts` (admin user, sample categories, products)
- [X] T025 [P] Create Prisma client singleton in `lib/db.ts` with connection pooling

### Authentication Foundation

- [X] T026 Configure NextAuth.js in `app/api/auth/[...nextauth]/route.ts` with credentials and OAuth providers
- [X] T027 [P] Create auth configuration in `lib/auth.ts` (session strategy, callbacks, providers)
- [X] T028 [P] Create authentication middleware in `middleware.ts` for protected routes
- [X] T029 [P] Define auth-related Zod schemas in `lib/validations.ts` (login, register, reset password)

### Core Utilities & Configuration

- [X] T030 [P] Create utility functions in `lib/utils.ts` (cn, formatters, validators)
- [X] T031 [P] Create environment variable validation in `lib/env.ts` using Zod
- [X] T032 [P] Create constants file in `lib/constants.ts` (shipping rates, tax rates, etc.)
- [X] T033 [P] Initialize shadcn/ui with `npx shadcn-ui@latest init`
- [X] T034 [P] Add shadcn/ui base components: button, input, card, dialog, toast, dropdown-menu, select, label, checkbox

### Payment & External Services

- [X] T035 [P] Create Stripe client in `lib/stripe.ts` with server-side key configuration
- [X] T036 [P] Create email service client in `lib/email.ts` (Resend or SendGrid)
- [X] T037 [P] Create Cloudinary configuration in `lib/cloudinary.ts` for image uploads
- [X] T038 [P] Create Stripe webhook handler in `app/api/webhooks/stripe/route.ts` with signature verification

### Testing Infrastructure

- [X] T039 [P] Create test setup file in `__tests__/setup.ts` with global mocks and utilities
- [X] T040 [P] Create test fixtures factory in `__tests__/fixtures/users.ts` for user test data
- [X] T041 [P] Create test fixtures factory in `__tests__/fixtures/products.ts` for product test data
- [X] T042 [P] Create test fixtures factory in `__tests__/fixtures/orders.ts` for order test data

### Global Layout & Error Handling

- [X] T043 Create root layout in `app/layout.tsx` with providers (NextAuth, Toaster, font optimization)
- [X] T044 [P] Create global error boundary in `app/error.tsx`
- [X] T045 [P] Create global loading state in `app/loading.tsx`
- [X] T046 [P] Create 404 page in `app/not-found.tsx`
- [X] T047 [P] Create global styles in `app/globals.css` with Tailwind directives

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse and Purchase Products (Priority: P1) 🎯 MVP

**Goal**: Enable customers to browse products, add to cart, and complete checkout with payment.

**Independent Test**: Load product catalog → Select product → Add to cart → Complete checkout → Verify order confirmation.

### Tests for User Story 1 (TDD - Write FIRST)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T048 [P] [US1] Unit test for getProducts service in `tests/unit/services/products.test.ts`
- [X] T049 [P] [US1] Unit test for getProductBySlug service in `tests/unit/services/products.test.ts`
- [X] T050 [P] [US1] Unit test for addToCart service in `tests/unit/services/cart.test.ts`
- [X] T051 [P] [US1] Unit test for checkout service in `tests/unit/services/orders.test.ts`
- [X] T052 [P] [US1] Component test for ProductCard in `tests/component/products/product-card.test.tsx`
- [X] T053 [P] [US1] Component test for AddToCartButton in `tests/component/cart/add-to-cart-button.test.tsx`
- [X] T054 [P] [US1] Integration test for complete checkout flow in `tests/integration/checkout-flow.test.ts`
- [X] T055 [P] [US1] E2E test for purchase journey in `tests/e2e/purchase-flow.spec.ts`

### Data Layer for User Story 1

- [X] T056 [P] [US1] Create Product type definitions in `types/product.ts`
- [X] T057 [P] [US1] Create Cart type definitions in `types/cart.ts`
- [X] T058 [P] [US1] Create Order type definitions in `types/order.ts`

### Services for User Story 1

- [X] T059 [P] [US1] Implement getProducts service in `services/products.ts` (fetch paginated product list)
- [X] T060 [P] [US1] Implement getProductBySlug service in `services/products.ts` (fetch product details)
- [X] T061 [P] [US1] Implement getCategories service in `services/products.ts` (fetch category tree)
- [X] T062 [US1] Implement cart service in `services/cart.ts` (getCart, addToCart, updateCartItem, removeFromCart)
- [X] T063 [US1] Implement checkout service in `services/orders.ts` (createOrder, validateStock, calculateTotals)

### Server Actions for User Story 1

- [X] T064 [P] [US1] Create addToCart Server Action in `actions/cart.ts` with stock validation
- [X] T065 [P] [US1] Create updateCartItem Server Action in `actions/cart.ts` with quantity validation
- [X] T066 [P] [US1] Create removeFromCart Server Action in `actions/cart.ts`
- [X] T067 [US1] Create createOrder Server Action in `actions/checkout.ts` with Stripe Payment Intent

### UI Components for User Story 1

- [X] T068 [P] [US1] Create ProductCard component in `components/products/product-card.tsx` (Server Component)
- [X] T069 [P] [US1] Create ProductGrid component in `components/products/product-grid.tsx` (Server Component)
- [X] T070 [P] [US1] Create ProductGallery component in `components/products/product-gallery.tsx` (Client Component with image carousel)
- [X] T071 [P] [US1] Create AddToCartButton component in `components/products/add-to-cart-button.tsx` (Client Component)
- [X] T072 [P] [US1] Create CartItem component in `components/cart/cart-item.tsx` (Client Component with quantity controls)
- [X] T073 [P] [US1] Create CartSummary component in `components/cart/cart-summary.tsx` (displays totals)
- [X] T074 [P] [US1] Create CheckoutForm component in `components/cart/checkout-form.tsx` (Client Component with Stripe Elements)

### Pages for User Story 1

- [X] T075 [US1] Create homepage in `app/(shop)/page.tsx` (Server Component, fetch featured products)
- [X] T076 [US1] Create product listing page in `app/(shop)/products/page.tsx` (Server Component, ISR with revalidate: 60)
- [X] T077 [US1] Create product detail page in `app/(shop)/products/[slug]/page.tsx` (Server Component, ISR, dynamic metadata)
- [X] T078 [US1] Create cart page in `app/(shop)/cart/page.tsx` (Server Component, fetch cart data)
- [X] T079 [US1] Create checkout page in `app/(shop)/checkout/page.tsx` (Server Component with Stripe integration)
- [X] T080 [US1] Create order confirmation page in `app/(shop)/orders/[id]/page.tsx` (Server Component, display order details)

### State Management for User Story 1

- [X] T081 [US1] Create cart Zustand store in `store/cart-store.ts` with localStorage persistence

### Email Templates for User Story 1

- [X] T082 [P] [US1] Create order confirmation email template in `emails/order-confirmation.tsx` using React Email
- [X] T083 [P] [US1] Implement sendOrderConfirmation function in `lib/email.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Customers can browse products and complete purchases.

---

## Phase 4: User Story 2 - User Account Management (Priority: P2)

**Goal**: Enable user registration, login, profile management, and order history.

**Independent Test**: Register account → Login → Update profile → Add address → View order history.

### Tests for User Story 2 (TDD - Write FIRST)

- [ ] T084 [P] [US2] Unit test for registerUser action in `tests/unit/actions/auth.test.ts`
- [ ] T085 [P] [US2] Unit test for updateProfile action in `tests/unit/actions/profile.test.ts`
- [ ] T086 [P] [US2] Component test for LoginForm in `tests/component/auth/login-form.test.tsx`
- [ ] T087 [P] [US2] Component test for RegisterForm in `tests/component/auth/register-form.test.tsx`
- [ ] T088 [P] [US2] E2E test for user registration flow in `tests/e2e/user-registration.spec.ts`

### Server Actions for User Story 2

- [ ] T089 [P] [US2] Create registerUser Server Action in `actions/auth.ts` (hash password with bcrypt, create user)
- [ ] T090 [P] [US2] Create requestPasswordReset Server Action in `actions/auth.ts` (generate token, send email)
- [ ] T091 [P] [US2] Create resetPassword Server Action in `actions/auth.ts` (validate token, update password)
- [ ] T092 [P] [US2] Create updateProfile Server Action in `actions/profile.ts` (update name, email, password)
- [ ] T093 [P] [US2] Create addAddress Server Action in `actions/profile.ts` (save shipping address)
- [ ] T094 [P] [US2] Create updateAddress Server Action in `actions/profile.ts`
- [ ] T095 [P] [US2] Create deleteAddress Server Action in `actions/profile.ts`
- [ ] T096 [P] [US2] Create setDefaultAddress Server Action in `actions/profile.ts`

### Services for User Story 2

- [ ] T097 [P] [US2] Implement getOrdersByUser service in `services/orders.ts` (fetch user order history)
- [ ] T098 [P] [US2] Implement getUserAddresses service in `services/users.ts`

### UI Components for User Story 2

- [ ] T099 [P] [US2] Create LoginForm component in `components/auth/login-form.tsx` (Client Component with React Hook Form + Zod)
- [ ] T100 [P] [US2] Create RegisterForm component in `components/auth/register-form.tsx` (Client Component)
- [ ] T101 [P] [US2] Create OAuthButtons component in `components/auth/oauth-buttons.tsx` (Google, GitHub sign-in)
- [ ] T102 [P] [US2] Create PasswordResetForm component in `components/auth/password-reset-form.tsx`
- [ ] T103 [P] [US2] Create ProfileForm component in `components/profile/profile-form.tsx` (Client Component)
- [ ] T104 [P] [US2] Create AddressForm component in `components/profile/address-form.tsx` (Client Component)
- [ ] T105 [P] [US2] Create OrderCard component in `components/orders/order-card.tsx` (display order summary)

### Pages for User Story 2

- [ ] T106 [US2] Create auth layout in `app/(auth)/layout.tsx` (minimal layout without nav)
- [ ] T107 [US2] Create login page in `app/(auth)/login/page.tsx` (Server Component)
- [ ] T108 [US2] Create register page in `app/(auth)/register/page.tsx` (Server Component)
- [ ] T109 [US2] Create password reset request page in `app/(auth)/reset-password/page.tsx`
- [ ] T110 [US2] Create profile page in `app/(shop)/profile/page.tsx` (Server Component, protected route)
- [ ] T111 [US2] Create addresses page in `app/(shop)/profile/addresses/page.tsx` (Server Component, protected route)
- [ ] T112 [US2] Create order history page in `app/(shop)/orders/page.tsx` (Server Component, protected route)

### Email Templates for User Story 2

- [ ] T113 [P] [US2] Create password reset email template in `emails/password-reset.tsx`
- [ ] T114 [P] [US2] Create welcome email template in `emails/welcome.tsx`

**Checkpoint**: User Story 1 AND 2 should both work independently. Users can register, login, and manage accounts.

---

## Phase 5: User Story 4 - Shopping Cart Management (Priority: P2)

**Goal**: Enhanced cart functionality with persistence, promo codes, and quantity management.

**Independent Test**: Add multiple products → Update quantities → Apply promo code → Verify cart persistence.

### Tests for User Story 4 (TDD - Write FIRST)

- [ ] T115 [P] [US4] Unit test for applyPromoCode action in `tests/unit/actions/cart.test.ts`
- [ ] T116 [P] [US4] Unit test for cart persistence in `tests/integration/cart-persistence.test.ts`
- [ ] T117 [P] [US4] Component test for PromoCodeInput in `tests/component/cart/promo-code-input.test.tsx`

### Data Layer for User Story 4

- [ ] T118 [US4] Add PromoCode validation to Prisma schema (ensure all fields exist from data-model.md)

### Services for User Story 4

- [ ] T119 [P] [US4] Implement validatePromoCode service in `services/cart.ts` (check expiry, usage limits)
- [ ] T120 [P] [US4] Implement calculateDiscount service in `services/cart.ts` (percentage vs fixed calculation)
- [ ] T121 [US4] Implement mergeGuestCart service in `services/cart.ts` (merge on login)

### Server Actions for User Story 4

- [ ] T122 [P] [US4] Create applyPromoCode Server Action in `actions/cart.ts` with validation
- [ ] T123 [P] [US4] Create removePromoCode Server Action in `actions/cart.ts`

### UI Components for User Story 4

- [ ] T124 [P] [US4] Create PromoCodeInput component in `components/cart/promo-code-input.tsx` (Client Component with form handling)
- [ ] T125 [P] [US4] Enhance CartSummary component to display discount breakdown

### Integration

- [ ] T126 [US4] Add cart persistence logic to cart store (sync with database for logged-in users)
- [ ] T127 [US4] Implement cart merge logic on user login (merge guest cart with user cart)

**Checkpoint**: Advanced cart management working. Promo codes functional, cart persists across sessions.

---

## Phase 6: User Story 3 - Product Search and Filtering (Priority: P3)

**Goal**: Enable product search with autocomplete and filtering by category/price.

**Independent Test**: Search for products → Apply filters → Sort results → Verify accuracy.

### Tests for User Story 3 (TDD - Write FIRST)

- [ ] T128 [P] [US3] Unit test for searchProducts service in `tests/unit/services/products.test.ts`
- [ ] T129 [P] [US3] Component test for ProductSearch in `tests/component/products/product-search.test.tsx`
- [ ] T130 [P] [US3] Component test for ProductFilters in `tests/component/products/product-filters.test.tsx`

### Services for User Story 3

- [ ] T131 [P] [US3] Implement searchProducts service in `services/products.ts` (PostgreSQL full-text search)
- [ ] T132 [P] [US3] Implement filterProducts service in `services/products.ts` (category, price range filtering)

### API Routes for User Story 3

- [ ] T133 [US3] Create search autocomplete API in `app/api/search/autocomplete/route.ts` (returns products + categories)

### UI Components for User Story 3

- [ ] T134 [P] [US3] Create ProductSearch component in `components/products/product-search.tsx` (Client Component with debounced input)
- [ ] T135 [P] [US3] Create ProductFilters component in `components/products/product-filters.tsx` (Client Component with checkboxes)
- [ ] T136 [P] [US3] Create SearchResults component in `components/products/search-results.tsx` (Server Component)

### Pages for User Story 3

- [ ] T137 [US3] Create search results page in `app/(shop)/search/page.tsx` (Server Component with searchParams)
- [ ] T138 [US3] Create category page in `app/(shop)/products/category/[slug]/page.tsx` (Server Component, ISR)

**Checkpoint**: Search and filtering working. Users can find products efficiently.

---

## Phase 7: User Story 6 - Admin Dashboard (Priority: P3)

**Goal**: Enable admins to manage products, orders, customers, and view analytics.

**Independent Test**: Login as admin → Add product → Update inventory → Process order → View analytics.

### Tests for User Story 6 (TDD - Write FIRST)

- [ ] T139 [P] [US6] Unit test for createProduct action in `tests/unit/actions/products.test.ts`
- [ ] T140 [P] [US6] Unit test for updateOrderStatus action in `tests/unit/actions/orders.test.ts`
- [ ] T141 [P] [US6] E2E test for admin operations in `tests/e2e/admin-operations.spec.ts`

### Services for User Story 6

- [ ] T142 [P] [US6] Implement getDashboardMetrics service in `services/analytics.ts` (revenue, orders, customers)
- [ ] T143 [P] [US6] Implement getAllOrders service in `services/orders.ts` (admin view with filters)
- [ ] T144 [P] [US6] Implement getCustomers service in `services/analytics.ts`
- [ ] T145 [P] [US6] Implement getSalesReport service in `services/analytics.ts` (date range, top products)

### Server Actions for User Story 6

- [ ] T146 [P] [US6] Create createProduct Server Action in `actions/products.ts` (admin only, with image upload)
- [ ] T147 [P] [US6] Create updateProduct Server Action in `actions/products.ts` (admin only)
- [ ] T148 [P] [US6] Create deleteProduct Server Action in `actions/products.ts` (admin only, soft delete)
- [ ] T149 [P] [US6] Create createCategory Server Action in `actions/products.ts` (admin only)
- [ ] T150 [P] [US6] Create updateOrderStatus Server Action in `actions/orders.ts` (admin only, sends notification)
- [ ] T151 [P] [US6] Create createPromoCode Server Action in `actions/admin.ts` (admin only)

### UI Components for User Story 6

- [ ] T152 [P] [US6] Create AdminSidebar component in `components/layout/sidebar.tsx`
- [ ] T153 [P] [US6] Create StatsCard component in `components/admin/stats-card.tsx` (displays metrics)
- [ ] T154 [P] [US6] Create ProductForm component in `components/admin/product-form.tsx` (Client Component, CRUD)
- [ ] T155 [P] [US6] Create OrderActions component in `components/admin/order-actions.tsx` (Client Component, status updates)
- [ ] T156 [P] [US6] Create AnalyticsCharts component in `components/admin/analytics-charts.tsx` (Client Component with chart library)
- [ ] T157 [P] [US6] Create ImageUpload component in `components/shared/image-upload.tsx` (Client Component, Cloudinary integration)

### Pages for User Story 6

- [ ] T158 [US6] Create admin layout in `app/(dashboard)/layout.tsx` (with sidebar, admin-only middleware)
- [ ] T159 [US6] Create admin dashboard home in `app/(dashboard)/admin/page.tsx` (Server Component, metrics)
- [ ] T160 [US6] Create product management page in `app/(dashboard)/admin/products/page.tsx` (Server Component)
- [ ] T161 [US6] Create add product page in `app/(dashboard)/admin/products/new/page.tsx`
- [ ] T162 [US6] Create edit product page in `app/(dashboard)/admin/products/[id]/edit/page.tsx`
- [ ] T163 [US6] Create order management page in `app/(dashboard)/admin/orders/page.tsx` (Server Component with filters)
- [ ] T164 [US6] Create order details page in `app/(dashboard)/admin/orders/[id]/page.tsx`
- [ ] T165 [US6] Create customer management page in `app/(dashboard)/admin/customers/page.tsx`
- [ ] T166 [US6] Create analytics page in `app/(dashboard)/admin/analytics/page.tsx`
- [ ] T167 [US6] Create promotions page in `app/(dashboard)/admin/promotions/page.tsx`

### Email Templates for User Story 6

- [ ] T168 [P] [US6] Create order shipped email template in `emails/order-shipped.tsx`
- [ ] T169 [P] [US6] Create order delivered email template in `emails/order-delivered.tsx`

**Checkpoint**: Admin dashboard functional. Products, orders, and customers can be managed efficiently.

---

## Phase 8: User Story 5 - Product Reviews and Ratings (Priority: P4)

**Goal**: Enable customers to leave and view product reviews.

**Independent Test**: Leave review on purchased product → View reviews → Sort by helpfulness.

### Tests for User Story 5 (TDD - Write FIRST)

- [ ] T170 [P] [US5] Unit test for submitReview action in `tests/unit/actions/reviews.test.ts`
- [ ] T171 [P] [US5] Component test for ReviewForm in `tests/component/reviews/review-form.test.tsx`

### Services for User Story 5

- [ ] T172 [P] [US5] Implement getProductReviews service in `services/reviews.ts` (with sorting, pagination)
- [ ] T173 [P] [US5] Implement verifyPurchase service in `services/reviews.ts` (check if user purchased product)

### Server Actions for User Story 5

- [ ] T174 [P] [US5] Create submitReview Server Action in `actions/reviews.ts` (verify purchase, validate)
- [ ] T175 [P] [US5] Create updateReview Server Action in `actions/reviews.ts` (owner only)
- [ ] T176 [P] [US5] Create deleteReview Server Action in `actions/reviews.ts` (owner or admin)
- [ ] T177 [P] [US5] Create markReviewHelpful Server Action in `actions/reviews.ts`

### UI Components for User Story 5

- [ ] T178 [P] [US5] Create ReviewForm component in `components/reviews/review-form.tsx` (Client Component with star rating)
- [ ] T179 [P] [US5] Create ReviewList component in `components/reviews/review-list.tsx` (Server Component)
- [ ] T180 [P] [US5] Create ReviewCard component in `components/reviews/review-card.tsx` (displays single review)
- [ ] T181 [P] [US5] Create RatingStars component in `components/reviews/rating-stars.tsx` (Client Component, interactive)

### Integration

- [ ] T182 [US5] Add reviews section to product detail page in `app/(shop)/products/[slug]/page.tsx`
- [ ] T183 [US5] Add average rating display to ProductCard component

**Checkpoint**: All user stories complete and independently functional. Platform feature-complete.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness.

### Shared Layout Components

- [ ] T184 [P] Create Header component in `components/layout/header.tsx` (Server Component, includes nav and cart count)
- [ ] T185 [P] Create Footer component in `components/layout/footer.tsx` (Server Component)
- [ ] T186 [P] Create shop layout in `app/(shop)/layout.tsx` (includes Header and Footer)

### Shared UI Components

- [ ] T187 [P] Create LoadingSpinner component in `components/shared/loading-spinner.tsx`
- [ ] T188 [P] Create Pagination component in `components/shared/pagination.tsx` (Client Component)
- [ ] T189 [P] Create EmptyState component in `components/shared/empty-state.tsx`

### Performance Optimization

- [ ] T190 [P] Configure Next.js Image component blur placeholders for all product images
- [ ] T191 [P] Implement font optimization with `next/font` in `app/layout.tsx`
- [ ] T192 [P] Add loading.tsx files to all major route segments for streaming
- [ ] T193 [P] Optimize database queries (add missing indexes, use select for specific fields)

### Accessibility

- [ ] T194 [P] Run accessibility audit with `@axe-core/playwright` and fix issues
- [ ] T195 [P] Add ARIA labels to interactive components
- [ ] T196 [P] Test keyboard navigation and fix focus management
- [ ] T197 [P] Add skip links to main content in layout

### Security Hardening

- [ ] T198 Configure security headers in `next.config.js` (CSP, HSTS, X-Frame-Options)
- [ ] T199 [P] Implement rate limiting on auth endpoints using Upstash Rate Limit
- [ ] T200 [P] Add input sanitization to all Server Actions (already using Zod, verify implementation)
- [ ] T201 [P] Configure CORS if needed for future API access

### Monitoring & Analytics

- [ ] T202 [P] Setup Sentry error tracking (client and server)
- [ ] T203 [P] Configure Vercel Analytics
- [ ] T204 [P] Add custom event tracking for business metrics (add to cart, checkout started, purchase completed)

### Documentation

- [ ] T205 [P] Create README.md with project overview, setup instructions, and architecture
- [ ] T206 [P] Document environment variables in `.env.local.example`
- [ ] T207 [P] Create API documentation for Server Actions (if sharing with mobile app in future)

### Database & Deployment

- [ ] T208 Run database seed script to populate initial data (categories, admin user, sample products)
- [ ] T209 [P] Setup database backups and point-in-time recovery
- [ ] T210 [P] Configure Vercel environment variables (production and preview)
- [ ] T211 [P] Setup Stripe webhooks for production environment
- [ ] T212 Test production deployment on Vercel preview environment

### Final Testing

- [ ] T213 Run complete E2E test suite with Playwright
- [ ] T214 [P] Run lighthouse audits on all major pages (target > 90 score)
- [ ] T215 [P] Perform security scan with `npm audit` and fix vulnerabilities
- [ ] T216 [P] Test cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] T217 [P] Test mobile responsiveness on real devices
- [ ] T218 Validate WCAG 2.1 AA compliance with automated tools and manual testing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) or sequentially in priority order
  - US1 (P1) → US2 (P2) → US4 (P2) → US3 (P3) → US6 (P3) → US5 (P4)
- **Polish (Phase 9)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - no dependencies on other stories
- **User Story 2 (P2)**: Independent - can run parallel to US1 after Foundation
- **User Story 3 (P3)**: Depends on US1 (needs product pages to add search to)
- **User Story 4 (P2)**: Partially depends on US1 (enhances basic cart from US1)
- **User Story 5 (P4)**: Depends on US1 and US2 (needs products and user accounts)
- **User Story 6 (P3)**: Independent infrastructure - can run parallel to US1

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models/Types before services
- Services before Server Actions
- Server Actions before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

All tasks marked [P] within a phase can run in parallel (different files, no dependencies).

**Example - Setup Phase**:
```bash
# Launch all [P] tasks in Phase 1 together:
Task: T002 - Install core dependencies
Task: T003 - Install UI dependencies
Task: T004 - Install form dependencies
Task: T005 - Install state management
# ... etc (all [P] tasks in Phase 1)
```

**Example - User Story 1 Tests**:
```bash
# Launch all test tasks for US1 together:
Task: T048 - Unit test getProducts
Task: T049 - Unit test getProductBySlug
Task: T050 - Unit test addToCart
Task: T051 - Unit test checkout
# ... etc
```

**Example - User Story 1 Services**:
```bash
# Launch all [P] service tasks for US1:
Task: T059 - Implement getProducts service
Task: T060 - Implement getProductBySlug service
Task: T061 - Implement getCategories service
# Then sequentially:
Task: T062 - Implement cart service (depends on understanding cart flow)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Browse and Purchase)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy MVP to production if ready

**MVP Deliverable**: Customers can browse products and complete purchases. This is a functional e-commerce platform.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Account Management) → Test independently → Deploy/Demo
4. Add User Story 4 (Enhanced Cart) → Test independently → Deploy/Demo
5. Add User Story 3 (Search) → Test independently → Deploy/Demo
6. Add User Story 6 (Admin Dashboard) → Test independently → Deploy/Demo
7. Add User Story 5 (Reviews) → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1) - Browse and Purchase
   - Developer B: User Story 2 (P2) - Account Management
   - Developer C: User Story 6 (P3) - Admin Dashboard
3. Stories complete and integrate independently
4. After first wave:
   - Developer A: User Story 4 (P2) - Enhanced Cart
   - Developer B: User Story 3 (P3) - Search
   - Developer C: User Story 5 (P4) - Reviews

---

## Task Summary

**Total Tasks**: 218
**Setup Phase**: 20 tasks
**Foundational Phase**: 27 tasks
**User Story 1 (P1)**: 34 tasks (MVP)
**User Story 2 (P2)**: 31 tasks
**User Story 4 (P2)**: 13 tasks
**User Story 3 (P3)**: 11 tasks
**User Story 6 (P3)**: 38 tasks
**User Story 5 (P4)**: 14 tasks
**Polish Phase**: 35 tasks

**Parallel Opportunities**: 142 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- **US1**: Browse catalog → Add to cart → Complete checkout → Verify order
- **US2**: Register → Login → Update profile → View orders
- **US3**: Search products → Apply filters → Verify results
- **US4**: Add items → Update quantities → Apply promo → Verify discount
- **US5**: Submit review → View reviews → Sort by helpful
- **US6**: Admin login → Add product → Update order → View analytics

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = **81 tasks**

---

## Notes

- All tasks include specific file paths for clarity
- [P] tasks can be executed in parallel (different files, no dependencies)
- [Story] labels enable independent user story implementation
- Tests written FIRST per TDD mandate (constitution requirement)
- Each user story is independently deployable
- Commit after completing each task or logical group
- Stop at any user story checkpoint to validate independently
