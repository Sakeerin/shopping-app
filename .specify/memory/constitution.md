<!--
=============================================================================
SYNC IMPACT REPORT
=============================================================================
Version Change: 1.0.0 → 2.0.0

Amendment Summary:
- Major update to incorporate Next.js 15 full-stack architecture requirements
- Added new Principle VI: Server-First Architecture
- Expanded Technical Standards with concrete tech stack requirements
- Enhanced Performance & Scalability principle with Next.js-specific guidance
- Updated observability standards to include Sentry and Vercel Analytics

Modified Principles:
- IV. Performance & Scalability - Enhanced with Next.js 15 optimization patterns
  (ISR, RSC, Image optimization, Core Web Vitals targets)

Added Principles:
- VI. Server-First Architecture - New principle for React Server Components,
  Server Actions, and progressive enhancement with Next.js 15 App Router

Added Sections:
- Technology Stack Constraints - Mandated tech stack for consistency
- Frontend Standards - Next.js 15, TypeScript, Tailwind CSS guidelines
- Backend Standards - Prisma, NextAuth.js, Stripe integration requirements
- Deployment Standards - Vercel deployment and CI/CD requirements

Templates Requiring Updates:
✅ plan-template.md - Technical Context section aligns with new tech stack
✅ spec-template.md - Requirements remain compatible with new principles
✅ tasks-template.md - Task organization supports server-first development

Version Bump Rationale:
MAJOR (2.0.0) - Addition of mandatory Server-First Architecture principle
fundamentally changes development approach and invalidates prior patterns that
used client-side-first approaches. Existing features may need refactoring to
comply with RSC-first pattern.

Follow-up TODOs:
- None - all requirements from user input have been incorporated

Date: 2025-11-09
=============================================================================
-->

# Shopping App Constitution

## Core Principles

### I. User-Centric Design

Every feature MUST prioritize the end-user experience. This means:
- Clear, intuitive interfaces with minimal friction in user journeys
- Accessibility compliance (WCAG 2.1 AA minimum) for all customer-facing features
- Mobile-first responsive design - mobile traffic is primary
- Performance budgets: <3s initial page load, <1s for interactions
- Lighthouse score > 90 for all production pages
- User feedback mechanisms integrated into all major flows
- Progressive Web App (PWA) capabilities for mobile experience

**Rationale**: Shopping applications succeed or fail based on customer satisfaction. A
confusing checkout process or slow product search directly impacts revenue. Users will
abandon carts and switch to competitors if the experience is suboptimal. Modern users
expect app-like experiences on the web.

### II. Security & Privacy First (NON-NEGOTIABLE)

All features MUST implement security and privacy by design:
- PCI DSS compliance for all payment processing (enforced via Stripe)
- Encryption at rest and in transit for all sensitive data (PII, payment info)
- OWASP Top 10 vulnerability prevention mandatory
- Input validation using Zod schemas on all user inputs
- Authentication and authorization checks on all protected resources
- NextAuth.js session security with secure cookies
- Environment variables NEVER exposed to client bundle
- Regular security audits and automated dependency scanning
- GDPR/CCPA compliance for data collection and user rights
- Rate limiting on all API routes to prevent abuse
- CSRF protection (built into Next.js Server Actions)
- Security headers configured (CSP, HSTS, X-Frame-Options)

**Rationale**: Security breaches destroy customer trust and can result in legal liability,
fines, and business closure. Privacy violations carry severe regulatory penalties. Payment
processing requires PCI compliance. This principle is non-negotiable.

### III. Test-Driven Development (NON-NEGOTIABLE)

Testing discipline MUST be followed for all features:
- Write tests FIRST → Get approval → Tests FAIL → Then implement
- Red-Green-Refactor cycle strictly enforced
- Minimum test coverage: 80% for business logic, 100% for payment/security features
- Test types required:
  - Unit tests (Vitest) for business logic and utilities
  - Component tests (React Testing Library) for UI components
  - Integration tests for workflows (cart, checkout, order processing)
  - E2E tests (Playwright) for critical user journeys
  - Accessibility tests in component tests
- All tests MUST pass before merging to main branch
- Test data factories using Prisma for consistent test setup

**Rationale**: Shopping applications handle financial transactions and customer data. Bugs
in checkout, inventory, or pricing can result in financial loss, compliance issues, and
customer trust erosion. TDD ensures features work correctly before deployment. The modern
stack (Next.js 15, RSC) requires careful testing of server/client boundaries.

### IV. Performance & Scalability

Architecture and implementation MUST support growth and maintain performance:
- Database queries optimized with Prisma indexes
- Caching strategy:
  - Next.js 15 fetch caching for product catalogs
  - ISR (Incremental Static Regeneration) for product pages
  - CDN caching via Vercel Edge Network
  - Database connection pooling (via Prisma)
- Image optimization:
  - Next.js Image component mandatory for all images
  - Blur placeholders for product images
  - WebP/AVIF format support
  - Cloudinary/S3 for storage with CDN delivery
- Core Web Vitals targets:
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
- React Server Components (RSC) for data fetching to reduce client bundle
- Code splitting and lazy loading for non-critical features
- Load testing required for checkout and high-traffic features
- Horizontal scaling via serverless functions (Vercel)
- API rate limiting and request throttling
- Monitoring with Vercel Analytics and Sentry for performance degradation

**Rationale**: Shopping applications experience variable traffic (sales events, holidays).
Poor performance during peak times results in lost revenue. Next.js 15 and Vercel provide
built-in performance optimizations that MUST be leveraged. Scalability ensures the
platform can grow with business success.

### V. Modular Architecture

System design MUST maintain clear separation of concerns:
- Domain-driven design with clear modules:
  - User Management (authentication, profiles, addresses)
  - Product Catalog (products, categories, search, filtering)
  - Shopping Cart (cart state, persistence, calculations)
  - Order Management (order creation, tracking, fulfillment)
  - Payment Processing (Stripe integration, webhooks)
  - Inventory Management (stock tracking, availability)
- Next.js App Router structure:
  - Route groups for logical organization: (auth), (shop), (dashboard)
  - Colocation of components with routes
  - Server Components by default, Client Components only when needed
- Each module has clear boundaries and interfaces
- Shared utilities in `/lib` directory (db, auth, stripe, utils)
- Services layer for business logic separation
- No circular dependencies between modules
- Feature toggles for gradual rollout and A/B testing (Vercel Edge Config)

**Rationale**: Shopping applications grow in complexity over time. Modular architecture
enables independent development, testing, and deployment of features. Next.js 15 App Router
provides natural organization patterns that MUST be followed. Clean separation reduces
coupling and makes the system easier to maintain and extend.

### VI. Server-First Architecture (NON-NEGOTIABLE)

All features MUST follow server-first development patterns:
- React Server Components (RSC) by default
- Mark components with "use client" ONLY when absolutely necessary:
  - Components using React hooks (useState, useEffect, etc.)
  - Components handling browser events (onClick, onChange, etc.)
  - Components using browser-only APIs
  - Third-party libraries requiring client-side execution
- Data fetching in Server Components for optimal performance
- Server Actions for form submissions and mutations
- Progressive enhancement: forms work without JavaScript
- Client-side enhancements (validation, optimistic updates) as additions
- No sensitive operations in Client Components
- Minimize client bundle size by keeping logic on server
- Use Suspense boundaries for streaming and loading states

**Rationale**: Next.js 15 App Router fundamentally changes React architecture with Server
Components. Server-first development reduces bundle size, improves performance, and
enhances security by keeping sensitive operations on the server. Progressive enhancement
ensures accessibility and resilience. This principle is non-negotiable for consistency
and to leverage the full power of the modern stack.

## Technology Stack Constraints

All development MUST use the following approved technologies for consistency and
maintainability:

### Frontend Stack (Mandatory)
- **Framework**: Next.js 15 with App Router (no Pages Router)
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: Zustand for global state, React Context for scoped state
- **Data Fetching**: React Server Components (primary), TanStack Query (client-side)
- **Forms**: React Hook Form with Zod validation schemas
- **Animations**: Framer Motion for complex animations

### Backend Stack (Mandatory)
- **Runtime**: Next.js API Routes or Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Auth.js) with JWT sessions
- **File Storage**: Cloudinary or AWS S3 with CDN
- **Payment Processing**: Stripe (PCI-compliant, no custom implementation)
- **Email**: Resend or SendGrid for transactional emails

### Infrastructure (Mandatory)
- **Deployment**: Vercel (leverages Next.js optimizations)
- **Database Hosting**: Supabase or Neon (PostgreSQL)
- **Monitoring**: Sentry (errors), Vercel Analytics (performance)
- **CI/CD**: GitHub Actions for automated testing and deployment

### Testing Stack (Mandatory)
- **Unit Tests**: Vitest
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright
- **Coverage Tool**: Vitest coverage (c8)

**Rationale**: Standardizing on a single tech stack ensures consistency, reduces context
switching, enables knowledge sharing, and leverages ecosystem integrations. These tools
are production-proven for e-commerce at scale.

## Technical Standards

All development MUST adhere to the following standards:

### Code Quality
- Consistent code style enforced via ESLint and Prettier
- TypeScript strict mode enabled (no `any` types without justification)
- Code reviews required for all pull requests (minimum 1 approval)
- No hardcoded credentials, secrets, or configuration
- Environment variables with .env.local (never committed)
- Meaningful variable and function names following conventions
- JSDoc comments for complex business logic and public APIs
- No console.logs in production code (use proper logging)

### Frontend Standards
- Server Components by default, Client Components marked explicitly
- Async/await for data fetching in Server Components
- Error boundaries for graceful error handling
- Loading states with Suspense and skeleton screens
- Accessibility: ARIA labels, semantic HTML, keyboard navigation
- Responsive design: mobile-first with Tailwind breakpoints
- Image optimization: Next.js Image component with proper sizing
- Font optimization: Next.js font optimization with local fonts
- No layout shifts: proper aspect ratios and placeholders

### API Design
- RESTful principles for API routes when used
- Server Actions preferred for mutations
- Consistent error response formats
- Input validation with Zod schemas on all endpoints
- Rate limiting middleware on public endpoints
- Request/response logging with correlation IDs
- API documentation for external integrations

### Data Management
- Prisma migrations versioned and tracked in Git
- Schema changes require migration files (never manual DB edits)
- Soft deletes for critical business data (orders, users)
- Audit logs for orders, payments, and user account changes
- Timestamps (createdAt, updatedAt) on all entities
- Proper indexes on foreign keys and frequently queried fields
- Data retention policies aligned with GDPR/CCPA requirements
- Regular automated backups with tested recovery procedures
- Connection pooling configured in Prisma

### Payment Integration (Stripe)
- Server-side payment intent creation only
- Webhook signature verification mandatory
- Idempotency keys for payment operations
- Proper error handling for failed payments
- Order status updates via webhooks, not client callbacks
- Test mode for development, production keys secured
- Audit trail for all payment transactions

### Observability
- Structured logging with correlation IDs for request tracing
- Error tracking with Sentry (client and server errors)
- Performance monitoring with Vercel Analytics
- Business metrics: conversion rate, cart abandonment, revenue
- Database query performance monitoring
- Alerting for critical errors and performance degradation
- Custom dashboards for business KPIs

### Security Standards
- Input sanitization on all user inputs (Zod validation)
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React automatic escaping)
- CSRF protection (Next.js Server Actions built-in)
- Authentication checks on all protected routes and API endpoints
- Role-based access control (RBAC) for admin features
- Session security with HTTP-only cookies
- Content Security Policy (CSP) headers configured
- Dependency scanning with automated alerts (GitHub Dependabot)
- Regular security audits of dependencies

## Development Workflow

### Feature Development Process
1. Feature specification created and reviewed (/speckit.specify)
2. Implementation plan with architecture decisions (/speckit.plan)
3. Task breakdown with dependencies (/speckit.tasks)
4. Tests written FIRST and reviewed (MUST fail initially)
5. Implementation with iterative testing
6. Code review and security review (GitHub PR)
7. Deployment to preview environment (Vercel preview)
8. QA validation and performance testing
9. Production deployment with monitoring

### Pull Request Requirements
- All automated tests passing (unit, component, integration)
- Code coverage requirements met (80% business logic, 100% payments)
- TypeScript compilation successful with no errors
- ESLint and Prettier checks passing
- Security scan passed (no high/critical vulnerabilities)
- Performance regression tests passed
- Lighthouse score > 90 for affected pages
- Documentation updated (if API changes)
- At least one peer review approval
- Branch up to date with main

### Quality Gates
- **Cannot merge** if tests fail
- **Cannot merge** if TypeScript errors exist
- **Cannot merge** if security vulnerabilities detected
- **Cannot merge** if code coverage drops below threshold
- **Cannot deploy to production** without QA approval for customer-facing features
- **Cannot deploy** without load testing for checkout/payment features
- **Cannot deploy** if Lighthouse score < 90

### Branch Strategy
- `main` branch always production-ready
- Feature branches: `feature/###-descriptive-name`
- Bug fixes: `fix/###-description`
- Hotfixes: `hotfix/###-description`
- Automatic preview deployments on Vercel for all PRs
- Automatic production deployment on merge to main

### Deployment Process
- Preview deployment automatic on PR creation
- Production deployment automatic on merge to main
- Database migrations run automatically pre-deployment
- Post-deployment health checks and smoke tests
- Rollback capability via Vercel dashboard
- Monitoring for errors in first 24 hours post-deployment

## Governance

This constitution is the authoritative source for development standards and practices
in the shopping-app project.

### Amendment Process
- Proposals for amendments MUST be documented with rationale
- Amendments require team consensus and technical lead approval
- Breaking changes to principles require migration plan for existing code
- All amendments versioned using semantic versioning
- Constitution changes trigger review of all template files

### Versioning Policy
- **MAJOR version** increment for backward-incompatible changes:
  - Principle removals or fundamental redefinitions
  - Tech stack changes that invalidate existing code
  - Changes requiring significant refactoring
- **MINOR version** increment for additions:
  - New principles or sections
  - Expanded guidance that doesn't break existing patterns
  - New technology additions to approved stack
- **PATCH version** increment for refinements:
  - Clarifications and wording improvements
  - Typo fixes and formatting changes
  - Non-semantic improvements

### Compliance
- All pull requests MUST be verified against this constitution
- Violations of NON-NEGOTIABLE principles MUST be rejected
- Violations of other principles MUST be justified in Complexity Tracking (plan.md)
- Automated checks in CI/CD for code quality and testing standards
- Quarterly constitution review to ensure alignment with project evolution
- Semi-annual security audit of compliance with security principles

### Runtime Guidance
During implementation, refer to:
- Feature specifications: `specs/*/spec.md`
- Implementation plans: `specs/*/plan.md`
- Task lists: `specs/*/tasks.md`
- This constitution for overarching principles and standards

### Exception Handling
Exceptions to principles require:
1. Written justification with technical reasoning
2. Documentation in implementation plan Complexity Tracking section
3. Technical lead approval
4. Mitigation plan if exception introduces risk
5. Sunset date for temporary exceptions

**Version**: 2.0.0 | **Ratified**: 2025-11-09 | **Last Amended**: 2025-11-09
