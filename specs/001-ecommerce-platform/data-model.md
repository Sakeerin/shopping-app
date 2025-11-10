# Data Model: E-Commerce Platform

**Date**: 2025-11-09
**Feature**: E-Commerce Platform
**Branch**: 001-ecommerce-platform

## Overview

This document defines the database schema for the e-commerce platform using Prisma ORM with PostgreSQL. The schema is organized into logical domains: User Management, Product Catalog, Shopping Cart, Orders, Reviews, and Administration.

## Schema Principles

- **Primary Keys**: Use `cuid()` for better indexing performance vs UUID
- **Timestamps**: All entities have `createdAt` and `updatedAt` timestamps
- **Soft Deletes**: Critical entities (User, Order) support soft deletion via `deletedAt`
- **Indexing**: Foreign keys and frequently queried fields are indexed
- **Type Safety**: Leverage Prisma's type generation for compile-time safety
- **Audit Trail**: Orders and payments store snapshots to preserve historical data

## Prisma Schema

```prisma
// This is the complete Prisma schema for the e-commerce platform
// File location: prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USER MANAGEMENT DOMAIN
// ============================================================================

model User {
  id                String    @id @default(cuid())
  name              String?
  email             String    @unique
  emailVerified     DateTime?
  image             String?   // Profile image URL
  password          String?   // Hashed password (null for OAuth users)
  provider          String?   // OAuth provider: "credentials", "google", "github"
  providerAccountId String?   // OAuth provider account ID
  role              UserRole  @default(CUSTOMER)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime? // Soft delete for GDPR compliance

  // Relations
  addresses         Address[]
  orders            Order[]
  reviews           Review[]
  cart              Cart?

  @@index([email])
  @@index([provider, providerAccountId])
  @@map("users")
}

enum UserRole {
  CUSTOMER
  ADMIN
}

model Address {
  id          String   @id @default(cuid())
  userId      String
  label       String   // e.g., "Home", "Work", "Billing"
  fullName    String   // Recipient name
  street      String   // Street address line 1
  street2     String?  // Street address line 2 (optional)
  city        String
  state       String   // State/Province
  postalCode  String
  country     String   @default("US")
  phone       String
  isDefault   Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, isDefault])
  @@map("addresses")
}

// ============================================================================
// PRODUCT CATALOG DOMAIN
// ============================================================================

model Category {
  id          String      @id @default(cuid())
  name        String      @unique
  slug        String      @unique
  description String?
  image       String?     // Category image URL
  parentId    String?     // For hierarchical categories
  displayOrder Int        @default(0)

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  parent      Category?   @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children    Category[]  @relation("CategoryHierarchy")
  products    Product[]

  @@index([slug])
  @@index([parentId])
  @@map("categories")
}

model Product {
  id          String           @id @default(cuid())
  name        String
  slug        String           @unique
  description String
  price       Decimal          @db.Decimal(10, 2) // Max 99,999,999.99
  images      String[]         // Array of image URLs
  categoryId  String
  stock       Int              @default(0)
  isActive    Boolean          @default(true)
  isFeatured  Boolean          @default(false)

  // SEO fields
  metaTitle       String?
  metaDescription String?

  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  // Relations
  category    Category         @relation(fields: [categoryId], references: [id])
  variants    ProductVariant[]
  reviews     Review[]
  cartItems   CartItem[]
  orderItems  OrderItem[]

  @@index([slug])
  @@index([categoryId])
  @@index([isActive, isFeatured])
  @@index([categoryId, isActive])
  @@fulltext([name, description]) // Full-text search support
  @@map("products")
}

model ProductVariant {
  id          String   @id @default(cuid())
  productId   String
  variantType String   // e.g., "size", "color"
  variantValue String  // e.g., "Large", "Red"
  priceAdjustment Decimal @db.Decimal(10, 2) @default(0) // +/- price modifier
  stock       Int      @default(0)
  sku         String?  @unique // Stock Keeping Unit

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  cartItems   CartItem[]
  orderItems  OrderItem[]

  @@unique([productId, variantType, variantValue])
  @@index([productId])
  @@index([sku])
  @@map("product_variants")
}

// ============================================================================
// SHOPPING CART DOMAIN
// ============================================================================

model Cart {
  id        String     @id @default(cuid())
  userId    String?    @unique // Null for guest carts
  sessionId String?    // For guest cart identification

  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  // Relations
  user      User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]

  @@index([userId])
  @@index([sessionId])
  @@map("carts")
}

model CartItem {
  id         String          @id @default(cuid())
  cartId     String
  productId  String
  variantId  String?
  quantity   Int             @default(1)
  priceSnapshot Decimal      @db.Decimal(10, 2) // Price at time of adding to cart

  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt

  // Relations
  cart       Cart            @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product    Product         @relation(fields: [productId], references: [id])
  variant    ProductVariant? @relation(fields: [variantId], references: [id])

  @@unique([cartId, productId, variantId])
  @@index([cartId])
  @@index([productId])
  @@map("cart_items")
}

// ============================================================================
// ORDER MANAGEMENT DOMAIN
// ============================================================================

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique // Human-readable order number
  userId          String?     // Null for guest checkout
  userEmail       String      // Preserved even if user deleted
  status          OrderStatus @default(PENDING)

  // Pricing
  subtotal        Decimal     @db.Decimal(10, 2)
  taxAmount       Decimal     @db.Decimal(10, 2)
  shippingCost    Decimal     @db.Decimal(10, 2)
  discountAmount  Decimal     @db.Decimal(10, 2) @default(0)
  totalAmount     Decimal     @db.Decimal(10, 2)

  // Addresses (stored as JSON for historical preservation)
  shippingAddress Json        // { fullName, street, city, state, postalCode, country, phone }
  billingAddress  Json?       // Optional, defaults to shipping address

  // Payment
  paymentStatus   PaymentStatus @default(PENDING)
  paymentIntentId String?     // Stripe Payment Intent ID

  // Shipping
  trackingNumber  String?
  shippedAt       DateTime?
  deliveredAt     DateTime?

  // Promotional
  promoCode       String?

  // Metadata
  notes           String?     // Customer order notes
  adminNotes      String?     // Internal admin notes

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deletedAt       DateTime?   // Soft delete (for compliance, keep order history)

  // Relations
  user            User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  items           OrderItem[]

  @@index([userId])
  @@index([orderNumber])
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
  @@index([userEmail])
  @@map("orders")
}

enum OrderStatus {
  PENDING       // Order created, awaiting payment
  PROCESSING    // Payment successful, preparing order
  SHIPPED       // Order shipped to customer
  DELIVERED     // Order delivered
  CANCELLED     // Order cancelled
  REFUNDED      // Order refunded
}

enum PaymentStatus {
  PENDING       // Awaiting payment
  PROCESSING    // Payment processing
  SUCCEEDED     // Payment successful
  FAILED        // Payment failed
  REFUNDED      // Payment refunded
}

model OrderItem {
  id              String          @id @default(cuid())
  orderId         String
  productId       String
  variantId       String?

  // Snapshots (preserve data even if product/variant deleted)
  productName     String
  productSlug     String
  productImage    String          // Primary image URL
  variantDetails  String?         // e.g., "Size: Large, Color: Red"
  priceSnapshot   Decimal         @db.Decimal(10, 2)

  quantity        Int
  lineTotal       Decimal         @db.Decimal(10, 2) // quantity * priceSnapshot

  createdAt       DateTime        @default(now())

  // Relations
  order           Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product         Product         @relation(fields: [productId], references: [id])
  variant         ProductVariant? @relation(fields: [variantId], references: [id])

  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}

// ============================================================================
// REVIEWS DOMAIN
// ============================================================================

model Review {
  id              String   @id @default(cuid())
  productId       String
  userId          String
  rating          Int      // 1-5 stars
  title           String?  // Optional review title
  comment         String   // Review text
  helpfulCount    Int      @default(0)
  isVerifiedPurchase Boolean @default(false) // Did user actually purchase this product?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([productId, userId]) // One review per user per product
  @@index([productId])
  @@index([userId])
  @@index([productId, rating])
  @@map("reviews")
}

// ============================================================================
// PROMOTIONAL DOMAIN
// ============================================================================

model PromoCode {
  id              String         @id @default(cuid())
  code            String         @unique
  discountType    DiscountType
  discountValue   Decimal        @db.Decimal(10, 2) // Percentage or fixed amount
  minPurchase     Decimal?       @db.Decimal(10, 2) // Minimum purchase amount required
  maxDiscount     Decimal?       @db.Decimal(10, 2) // Max discount for percentage codes
  usageLimit      Int?           // Max total uses (null = unlimited)
  usageCount      Int            @default(0)
  perUserLimit    Int?           // Max uses per user (null = unlimited)
  startDate       DateTime       @default(now())
  endDate         DateTime?      // Null = no expiration
  isActive        Boolean        @default(true)

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([code])
  @@index([isActive, startDate, endDate])
  @@map("promo_codes")
}

enum DiscountType {
  PERCENTAGE // e.g., 20% off
  FIXED      // e.g., $10 off
}

// ============================================================================
// AUDIT & ANALYTICS DOMAIN
// ============================================================================

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?  // Null for system actions
  userEmail   String?
  action      String   // e.g., "USER_LOGIN", "ORDER_CREATED", "PRODUCT_UPDATED"
  entityType  String?  // e.g., "USER", "ORDER", "PRODUCT"
  entityId    String?
  metadata    Json?    // Additional context
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@index([entityType, entityId])
  @@map("audit_logs")
}
```

## Entity Relationships

### User Domain
- **User** (1) → (many) **Address**: Users can have multiple shipping addresses
- **User** (1) → (1) **Cart**: Each user has one active cart
- **User** (1) → (many) **Order**: Users can place multiple orders
- **User** (1) → (many) **Review**: Users can review multiple products

### Product Domain
- **Category** (1) → (many) **Product**: Products belong to one category
- **Category** (1) → (many) **Category**: Hierarchical category structure
- **Product** (1) → (many) **ProductVariant**: Products can have multiple variants (size, color)
- **Product** (1) → (many) **Review**: Products can have multiple reviews

### Cart Domain
- **Cart** (1) → (many) **CartItem**: Carts contain multiple items
- **CartItem** (many) → (1) **Product**: Each cart item references a product
- **CartItem** (many) → (1) **ProductVariant**: Optional variant reference

### Order Domain
- **Order** (1) → (many) **OrderItem**: Orders contain multiple line items
- **OrderItem** (many) → (1) **Product**: References product (with snapshot data)
- **OrderItem** (many) → (1) **ProductVariant**: Optional variant reference

## Field Validations

### User
- `email`: Must be unique, valid email format
- `password`: Minimum 8 characters (hashed with bcrypt)
- `role`: CUSTOMER or ADMIN enum

### Product
- `price`: Decimal(10,2), min: 0.01, max: 99,999,999.99
- `stock`: Integer, min: 0
- `slug`: Unique, URL-safe string
- `images`: Array, minimum 1 image required

### Order
- `subtotal`, `taxAmount`, `shippingCost`, `totalAmount`: Decimal(10,2), must be >= 0
- `totalAmount` calculation: `subtotal + taxAmount + shippingCost - discountAmount`
- `orderNumber`: Unique, format: ORD-{timestamp}-{random}

### Review
- `rating`: Integer, min: 1, max: 5
- `comment`: String, min: 10 characters, max: 2000 characters

### PromoCode
- `code`: Unique, uppercase, alphanumeric
- `discountValue`: If PERCENTAGE, must be 0-100; if FIXED, must be > 0
- `endDate`: Must be after `startDate` if provided

## Indexes

### Performance Indexes
- `users.email`: Fast user lookup
- `products.slug`: SEO-friendly URL lookup
- `products.categoryId + isActive`: Filtered category browsing
- `orders.orderNumber`: Order tracking lookup
- `orders.userId`: User order history
- `orders.status`: Admin order filtering

### Full-Text Search
- `products`: Full-text index on `name` and `description` fields for product search

## Data Constraints

### Cascade Deletes
- Deleting a User cascades to: Addresses, Cart, Reviews
- Deleting a Product cascades to: ProductVariants, Reviews, CartItems
- Deleting a Cart cascades to: CartItems
- Deleting an Order cascades to: OrderItems

### Soft Deletes
- Users: `deletedAt` field for GDPR compliance (can restore data)
- Orders: `deletedAt` field for preserving order history

### Set Null on Delete
- Order.userId → null if User is deleted (preserves order data)
- Category.parentId → null if parent Category is deleted

## Migration Strategy

1. **Initial Migration**: Create all tables with indexes
2. **Seed Data**: Populate initial categories and admin user
3. **Data Validation**: Ensure constraints are enforced
4. **Rollback Plan**: Keep migrations reversible

## Database Performance Considerations

### Connection Pooling
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Query Optimization
- Use `select` to fetch only required fields
- Implement pagination for large datasets
- Use `include` judiciously to avoid N+1 queries
- Leverage Prisma's query batching

### Caching Strategy
- Cache product catalog (Redis/Vercel KV)
- Cache category tree
- Invalidate cache on product/category updates

## Data Privacy & Compliance

### GDPR Compliance
- User data export: Fetch all related data (orders, reviews, addresses)
- Right to deletion: Soft delete users, anonymize orders
- Data portability: Export user data as JSON

### PCI Compliance
- **Never store**: Full credit card numbers, CVV codes
- **Store only**: Stripe payment intent IDs
- **Encrypt**: All sensitive data at rest

### Audit Trail
- Log all order creation and updates
- Log payment events
- Log user account changes
- Log admin actions

## Next Steps

With the data model defined, proceed to creating API contracts that will interact with these entities.
