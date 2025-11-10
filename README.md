# Shopping App - E-Commerce Platform

A modern, full-stack e-commerce platform built with Next.js 15, TypeScript, and PostgreSQL.

## Project Status

**Phase 1: Setup (Project Initialization)** - ✅ COMPLETED

## Tech Stack

### Core
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Payment**: Stripe
- **Styling**: Tailwind CSS with shadcn/ui

### State Management & Forms
- **Forms**: React Hook Form with Zod validation
- **State**: Zustand + React Query (TanStack Query)

### Testing
- **Unit/Component Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: 80% target for business logic

### Additional Services
- **Image Storage**: Cloudinary
- **Email**: Resend
- **Deployment**: Vercel

## Project Structure

```
shopping-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (shop)/            # Shop routes (products, cart, checkout)
│   ├── (dashboard)/       # Admin dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── products/         # Product components
│   ├── cart/             # Cart components
│   └── ...
├── lib/                  # Utilities and configurations
├── services/             # Business logic
├── actions/              # Server Actions
├── prisma/               # Database schema
├── __tests__/            # Test files
│   ├── unit/
│   ├── component/
│   └── integration/
└── e2e/                  # E2E tests
```

## Getting Started

### Prerequisites

- Node.js 18.17.0+ (v20.x recommended)
- pnpm, npm, or yarn
- PostgreSQL 15+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shopping-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (when database is ready)
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

5. Start development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:component` - Run component tests
- `npm run test:e2e` - Run E2E tests
- `npm run test:coverage` - Run tests with coverage

## Database Setup

### Using Supabase (Recommended)

1. Create account at https://supabase.com
2. Create new project
3. Copy connection string from Project Settings → Database
4. Add to `DATABASE_URL` in `.env.local`

### Using Local PostgreSQL

```bash
createdb shopping_app
# Add connection string to .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/shopping_app"
```

## Development Workflow

See [specs/001-ecommerce-platform/quickstart.md](specs/001-ecommerce-platform/quickstart.md) for detailed development guide.

## Documentation

- [Feature Specification](specs/001-ecommerce-platform/spec.md)
- [Implementation Plan](specs/001-ecommerce-platform/plan.md)
- [Data Model](specs/001-ecommerce-platform/data-model.md)
- [API Contracts](specs/001-ecommerce-platform/contracts/)
- [Quickstart Guide](specs/001-ecommerce-platform/quickstart.md)
- [Task List](specs/001-ecommerce-platform/tasks.md)

## Constitution

This project follows strict development principles defined in [.specify/memory/constitution.md](.specify/memory/constitution.md).

Key principles:
- User-Centric Design
- Security & Privacy First
- Test-Driven Development
- Performance & Scalability
- Modular Architecture
- Server-First Architecture (NON-NEGOTIABLE)

## Next Steps

1. Configure database connection in `.env.local`
2. Run database migrations: `npx prisma migrate dev`
3. Review [tasks.md](specs/001-ecommerce-platform/tasks.md) for implementation roadmap
4. Start with Phase 2: Foundational tasks

## License

[License information]

## Contributing

[Contributing guidelines]
