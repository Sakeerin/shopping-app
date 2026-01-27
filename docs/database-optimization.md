# Database Optimization Guide

## T193: Database Query Optimizations (Phase 9 - Performance Optimization)

This document outlines database optimization strategies implemented in the e-commerce platform.

## Implemented Indexes

The Prisma schema already includes comprehensive indexes for performance:

### User Domain
- `@@index([email])` - Fast user lookup by email
- `@@index([provider, providerAccountId])` - OAuth provider lookups
- `@@index([userId])` on Address - User's addresses
- `@@index([userId, isDefault])` on Address - Default address lookup

### Product Domain
- `@@index([slug])` on Category - Category page routing
- `@@index([parentId])` on Category - Hierarchical categories
- `@@index([slug])` on Product - Product page routing
- `@@index([categoryId])` on Product - Products by category
- `@@index([isFeatured])` on Product - Featured products
- `@@index([categoryId, isFeatured])` on Product - Composite index

### Cart Domain
- `@@index([userId])` on Cart - User cart lookup
- `@@index([sessionId])` on Cart - Guest cart lookup
- `@@index([cartId])` on CartItem - Cart items

### Order Domain
- `@@index([userId])` on Order - User orders
- `@@index([orderNumber])` on Order - Order lookup
- `@@index([status])` on Order - Orders by status
- `@@index([userId, status])` on Order - Composite index
- `@@index([orderId])` on OrderItem - Order items

### Review Domain
- `@@unique([productId, userId])` on Review - One review per user per product
- `@@index([productId])` on Review - Product reviews
- `@@index([userId])` on Review - User reviews
- `@@index([productId, rating])` on Review - Reviews by rating

### Promo Code Domain
- `@@unique([code])` on PromoCode - Code lookup
- `@@index([isActive])` on PromoCode - Active promos
- `@@index([expiresAt])` on PromoCode - Expiration checks

## Query Optimization Strategies

### 1. Use `select` for Specific Fields

Instead of fetching all fields, select only what you need:

```typescript
// ❌ Bad: Fetches all fields
const user = await prisma.user.findUnique({
  where: { id: userId },
});

// ✅ Good: Fetch only needed fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

### 2. Use Pagination with `skip` and `take`

Always paginate large result sets:

```typescript
// ✅ Good: Paginated results
const products = await prisma.product.findMany({
  where: { isActive: true },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

### 3. Avoid N+1 Queries with `include`

Use `include` to fetch related data in a single query:

```typescript
// ❌ Bad: N+1 queries
const orders = await prisma.order.findMany();
for (const order of orders) {
  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  });
}

// ✅ Good: Single query with include
const orders = await prisma.order.findMany({
  include: {
    items: {
      include: {
        product: true,
      },
    },
  },
});
```

### 4. Use Composite Indexes for Common Queries

The schema includes composite indexes for frequently combined filters:

```typescript
// Optimized by @@index([userId, status])
const userOrders = await prisma.order.findMany({
  where: {
    userId: 'user-123',
    status: 'DELIVERED',
  },
});

// Optimized by @@index([categoryId, isFeatured])
const featuredProducts = await prisma.product.findMany({
  where: {
    categoryId: 'cat-123',
    isFeatured: true,
  },
});
```

### 5. Batch Operations

Use `createMany`, `updateMany`, and `deleteMany` for bulk operations:

```typescript
// ✅ Good: Batch insert
await prisma.cartItem.createMany({
  data: items.map(item => ({
    cartId: cart.id,
    productId: item.productId,
    quantity: item.quantity,
  })),
  skipDuplicates: true,
});
```

### 6. Use Transactions for Consistency

Wrap related operations in transactions:

```typescript
await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });
  await tx.orderItem.createMany({ data: items });
  await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
});
```

## Performance Monitoring

### Enable Query Logging

In development, enable query logging to identify slow queries:

```typescript
// prisma/client.ts
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 100) {
    console.log('Slow query detected:', {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });
  });
});
```

### Use Query Analysis

Run `EXPLAIN ANALYZE` on slow queries:

```sql
EXPLAIN ANALYZE
SELECT * FROM products
WHERE category_id = 'cat-123'
AND is_featured = true
ORDER BY created_at DESC
LIMIT 20;
```

## Connection Pooling

Prisma automatically handles connection pooling. Configure limits:

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?connection_limit=10&pool_timeout=20"
```

## Caching Strategies

### ISR (Incremental Static Regeneration)

Used in product pages:

```typescript
export const revalidate = 60; // Revalidate every 60 seconds
```

### React Server Components

Server Components fetch data directly without client-side overhead:

```typescript
// Server Component - no client bundle
export async function ProductList() {
  const products = await prisma.product.findMany();
  return <div>{/* render products */}</div>;
}
```

## Additional Recommendations

1. **Database Backups**: Set up automated daily backups with point-in-time recovery
2. **Read Replicas**: For high-traffic sites, use read replicas for queries
3. **Query Caching**: Implement Redis for frequently accessed data
4. **Database Monitoring**: Use tools like pganalyze or Datadog
5. **Index Maintenance**: Regularly analyze and optimize indexes

## Migration Best Practices

When adding new indexes:

```bash
# 1. Create migration
npx prisma migrate dev --name add_performance_indexes

# 2. Review migration SQL
# 3. Test on staging
# 4. Deploy to production during low-traffic period
```

## Resources

- [Prisma Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [PostgreSQL Index Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [Database Indexing Strategy](https://use-the-index-luke.com/)
