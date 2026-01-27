# Deployment Guide

## T208-T212: Database & Deployment (Phase 9)

This guide covers database setup, deployment to Vercel, and production configuration.

## Table of Contents

- [Database Setup](#database-setup)
- [Database Seeding](#database-seeding)
- [Database Backups](#database-backups)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Stripe Webhooks](#stripe-webhooks)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

---

## Database Setup

### Production Database Options

#### Option 1: Supabase (Recommended)

**Features:**
- Managed PostgreSQL
- Automatic backups
- Point-in-time recovery
- Connection pooling
- Free tier available

**Setup:**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Project Settings → Database
4. Copy connection string (Session mode for Prisma)
5. Add to `.env.local`:

```env
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Backup Configuration:**
- Automatic daily backups (included)
- Point-in-time recovery available
- Backup retention: 7 days (free tier), 30 days (pro tier)

#### Option 2: Neon

**Features:**
- Serverless PostgreSQL
- Automatic scaling
- Branching for development
- Free tier: 0.5 GB storage

**Setup:**
1. Create account at [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string
4. Add to `.env.local`

#### Option 3: Railway

**Features:**
- Simple PostgreSQL deployment
- Automatic backups
- Easy scaling

**Setup:**
1. Create account at [railway.app](https://railway.app)
2. New Project → Add PostgreSQL
3. Copy connection string from Variables tab
4. Add to `.env.local`

#### Option 4: Vercel Postgres

**Features:**
- Native Vercel integration
- Serverless PostgreSQL
- Edge-ready

**Setup:**
1. In Vercel dashboard, go to Storage tab
2. Create Postgres Database
3. Connection string automatically added to environment

---

## Database Seeding

**Location:** [prisma/seed.ts](../prisma/seed.ts)

### What Gets Seeded

✅ **Admin User**
- Email: `admin@example.com`
- Password: `admin123`
- Role: ADMIN

✅ **Customer User**
- Email: `customer@example.com`
- Password: `customer123`
- Role: CUSTOMER

✅ **Categories** (5)
- Electronics
- Clothing
- Books
- Home & Garden
- Sports

✅ **Sample Products** (5)
- Wireless Headphones ($149.99)
- Smart Watch ($299.99)
- Classic T-Shirt ($24.99)
- Running Shoes ($89.99)
- JavaScript: The Good Parts ($29.99)

✅ **Promo Code**
- Code: `WELCOME10`
- Discount: 10% off
- Min Purchase: $50
- Usage Limit: 100 uses

### Run Seed Script

**Development:**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

**Production:**
```bash
# From local machine with production DATABASE_URL
export DATABASE_URL="your-production-url"

# Run migrations (one-time)
npx prisma migrate deploy

# Seed database (one-time)
npx prisma db seed
```

**Output:**
```
🌱 Seeding database...
✓ Created admin user: admin@example.com
✓ Created customer user: customer@example.com
✓ Created 5 categories
✓ Created 5 products
✓ Created promo code: WELCOME10
🎉 Seeding completed successfully!
```

### Customizing Seed Data

Edit [prisma/seed.ts](../prisma/seed.ts) to:
- Add more products
- Change default passwords
- Add product variants
- Create additional promo codes
- Add sample reviews

---

## Database Backups

### T209: Automated Backups

#### Supabase Backups

**Automatic Daily Backups:**
- Enabled by default
- Retention: 7 days (free), 30 days (pro)
- Location: Project Settings → Database → Backups

**Point-in-Time Recovery (PITR):**
- Pro plan feature
- Restore to any point in last 7 days
- Zero data loss recovery

**Manual Backup:**
```bash
# Using pg_dump
pg_dump "postgresql://postgres:[password]@[host]:5432/postgres" > backup.sql

# Restore
psql "postgresql://postgres:[password]@[host]:5432/postgres" < backup.sql
```

#### Railway Backups

**Automatic Backups:**
- Daily snapshots
- 7-day retention
- One-click restore

**Manual Snapshot:**
1. Railway dashboard → Database service
2. Backups tab → Create Snapshot
3. Download or restore from snapshots list

#### Neon Backups

**Automatic Backups:**
- Continuous backup
- Point-in-time recovery
- Branch-based backups

**Create Backup Branch:**
```bash
# Using Neon CLI
neon branches create --name backup-$(date +%Y%m%d)
```

#### Custom Backup Strategy

**Automated Daily Backups (Recommended):**

1. **Create backup script** - `scripts/backup-db.sh`:
```bash
#!/bin/bash
# Database backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
pg_dump "$DATABASE_URL" > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to S3 (optional)
# aws s3 cp $BACKUP_FILE.gz s3://your-bucket/backups/

# Keep only last 30 backups
ls -t $BACKUP_DIR/*.sql.gz | tail -n +31 | xargs rm -f

echo "Backup completed: $BACKUP_FILE.gz"
```

2. **Schedule with cron**:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-db.sh
```

3. **GitHub Actions** (Alternative):
```yaml
# .github/workflows/backup.yml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: |
          pg_dump "${{ secrets.DATABASE_URL }}" > backup.sql
          gzip backup.sql

      - name: Upload to S3
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - run: aws s3 cp backup.sql.gz s3://your-bucket/backups/
```

---

## Vercel Deployment

### T210: Environment Variables Configuration

#### Initial Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "feat: ready for production deployment"
git push origin main
```

2. **Import to Vercel**
- Visit [vercel.com/new](https://vercel.com/new)
- Import repository
- Configure project settings
- Deploy

3. **Configure Environment Variables**

Go to Vercel Dashboard → Project → Settings → Environment Variables

#### Required Environment Variables

**Database:**
```env
DATABASE_URL=postgresql://...
```

**NextAuth:**
```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-new-secret-for-production
```

**Stripe:**
```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Email (Resend):**
```env
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

**Cloudinary:**
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

**OAuth (Optional):**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Rate Limiting (Production):**
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**Monitoring (Production):**
```env
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

**Application:**
```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

#### Environment Scopes

- **Production**: Used for production deployments
- **Preview**: Used for preview deployments (PRs)
- **Development**: Used locally (not in Vercel)

**Recommended Setup:**
- Production: All variables with production values
- Preview: Same as production BUT with test API keys
- Development: Local `.env.local` only

---

### T211: Stripe Webhooks Setup

#### 1. Create Webhook Endpoint

**Vercel Deployment URL:**
```
https://your-domain.vercel.app/api/webhooks/stripe
```

#### 2. Configure in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → Webhooks
3. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`

**Select Events:**
```
✅ payment_intent.succeeded
✅ payment_intent.payment_failed
✅ checkout.session.completed
✅ customer.created
✅ customer.updated
✅ charge.refunded
```

4. Copy **Signing Secret**
5. Add to Vercel: `STRIPE_WEBHOOK_SECRET`

#### 3. Test Webhook

**Using Stripe CLI:**
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger payment_intent.succeeded
```

**Verify in Stripe Dashboard:**
- Webhooks → Your endpoint
- Check recent deliveries
- Should see 200 responses

#### 4. Webhook Security

**Already Implemented:**
- Signature verification using `stripe.webhooks.constructEvent()`
- Raw body parsing for signature validation
- Event type validation
- Idempotency handling

**Location:** [app/api/webhooks/stripe/route.ts](../app/api/webhooks/stripe/route.ts)

---

### T212: Production Deployment Testing

#### Pre-Deployment Checklist

**Code Quality:**
- [ ] All tests passing: `npm test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No linting errors: `npm run lint`
- [ ] Build succeeds: `npm run build`

**Environment:**
- [ ] All environment variables configured in Vercel
- [ ] Production database created and accessible
- [ ] Stripe live keys configured
- [ ] Webhook endpoint configured

**Security:**
- [ ] `NEXTAUTH_SECRET` is unique and secure
- [ ] No `.env*` files committed to git
- [ ] Security headers configured in `next.config.ts`
- [ ] Rate limiting enabled (Upstash Redis)

**Database:**
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Database seeded (if needed)
- [ ] Backups configured
- [ ] Connection pooling enabled

#### Preview Deployment Test

**Create Preview Deployment:**
```bash
# Create feature branch
git checkout -b test-deployment

# Make small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "test: preview deployment"
git push origin test-deployment
```

**Vercel automatically:**
- Builds the preview
- Deploys to preview URL
- Comments on PR with URL

**Test Preview:**
1. Visit preview URL
2. Test user registration
3. Test product browsing
4. Test cart functionality
5. Test checkout (use Stripe test card: 4242 4242 4242 4242)
6. Test admin dashboard

#### Production Deployment

**Deploy to Production:**
```bash
# Merge to main
git checkout main
git merge test-deployment
git push origin main
```

**Vercel automatically:**
- Builds production bundle
- Deploys to production domain
- Updates environment

**Post-Deployment Verification:**

**1. Health Check:**
```bash
# Check if site is up
curl -I https://your-domain.vercel.app

# Should return 200 OK
```

**2. Test User Journeys:**
- [ ] Homepage loads
- [ ] Product listing works
- [ ] Product detail page loads
- [ ] Add to cart works
- [ ] Checkout flow works
- [ ] Payment processing works
- [ ] Order confirmation received
- [ ] Admin login works
- [ ] Admin dashboard loads

**3. Monitor Errors:**
- Check Sentry dashboard for errors
- Check Vercel logs for issues
- Check Stripe dashboard for webhook deliveries

**4. Performance Check:**
- Run Lighthouse audit
- Check Core Web Vitals
- Verify Vercel Analytics

---

## Production Checklist

### Pre-Launch

**Code:**
- [x] All features implemented
- [x] All tests passing
- [x] No console.log statements in production code
- [x] Error handling implemented
- [x] Loading states for all async operations

**Security:**
- [x] Security headers configured
- [x] Rate limiting enabled
- [x] Input validation on all forms
- [x] CSRF protection enabled
- [x] SQL injection protection (Prisma)
- [x] XSS protection (React escaping)

**Performance:**
- [x] Images optimized (Next.js Image, AVIF/WebP)
- [x] Fonts optimized (next/font)
- [x] Code splitting configured
- [x] Database queries optimized
- [x] Caching strategy implemented

**Monitoring:**
- [x] Sentry error tracking configured
- [x] Vercel Analytics enabled
- [x] Custom events tracked
- [x] Error boundaries implemented

**Database:**
- [x] Production database created
- [x] Migrations run
- [x] Backups configured
- [x] Connection pooling enabled
- [x] Indexes created

**External Services:**
- [x] Stripe live mode enabled
- [x] Webhooks configured
- [x] Email service configured (Resend)
- [x] Image storage configured (Cloudinary)
- [x] OAuth providers configured (optional)

### Post-Launch

**Week 1:**
- [ ] Monitor error rates in Sentry
- [ ] Check conversion funnel in analytics
- [ ] Review webhook delivery success rate
- [ ] Check database performance
- [ ] Gather user feedback

**Ongoing:**
- [ ] Weekly database backups verification
- [ ] Monthly security audits
- [ ] Performance monitoring
- [ ] Dependency updates
- [ ] Feature usage analysis

---

## Troubleshooting

### Common Deployment Issues

#### 1. Database Connection Errors

**Error:** `Can't reach database server`

**Solutions:**
- Verify `DATABASE_URL` in Vercel environment variables
- Check if database is accessible from Vercel IP
- Ensure connection pooling is configured
- Verify database credentials

#### 2. Build Failures

**Error:** `Type error: ...`

**Solutions:**
- Run `npm run type-check` locally
- Fix TypeScript errors
- Ensure all dependencies installed
- Check `next.config.ts` syntax

#### 3. Stripe Webhook Failures

**Error:** `No signatures found matching the expected signature`

**Solutions:**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check webhook endpoint URL is correct
- Ensure raw body parser is enabled
- Test with Stripe CLI locally

#### 4. Image Upload Errors

**Error:** `Cloudinary upload failed`

**Solutions:**
- Verify Cloudinary credentials
- Check API key permissions
- Verify image size limits
- Check upload preset configuration

#### 5. Email Sending Failures

**Error:** `Resend API error`

**Solutions:**
- Verify `RESEND_API_KEY`
- Check email domain verification
- Ensure from address is verified
- Check rate limits

### Performance Issues

**Slow Page Loads:**
- Check Vercel Analytics for slow routes
- Review database query performance
- Optimize images
- Enable caching

**High Error Rates:**
- Check Sentry for error patterns
- Review recent deployments
- Check external service status
- Verify environment variables

---

## Rollback Strategy

### Instant Rollback

**Via Vercel Dashboard:**
1. Go to Deployments tab
2. Find previous working deployment
3. Click "Promote to Production"
4. Instant rollback (< 1 minute)

**Via Vercel CLI:**
```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### Database Rollback

**Restore from Backup:**
```bash
# Supabase: Use dashboard to restore
# Railway: Use snapshots feature
# Manual: Restore from pg_dump

psql "$DATABASE_URL" < backup.sql
```

**Undo Migration:**
```bash
# WARNING: May cause data loss
npx prisma migrate resolve --rolled-back migration_name
```

---

## Monitoring & Maintenance

### Daily Checks
- Error rate in Sentry
- Webhook delivery success
- Database connection health

### Weekly Checks
- Performance metrics
- User activity trends
- Failed payment attempts
- Database backup verification

### Monthly Checks
- Security updates (`npm audit`)
- Dependency updates
- Database optimization
- Cost analysis (Vercel, Supabase, Stripe)

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Supabase Backups](https://supabase.com/docs/guides/platform/backups)

---

**Last Updated:** 2025-11-21
**Deployment Status:** Ready for Production
**Estimated Deployment Time:** 30-45 minutes
