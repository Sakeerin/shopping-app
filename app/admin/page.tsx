import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { getDashboardMetrics } from '@/services/analytics';
import { StatsCard } from '@/components/admin/stats-card';

// ============================================================================
// T159: ADMIN DASHBOARD HOME PAGE (Phase 7 - User Story 6)
// ============================================================================

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Overview of your store's performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={{
            value: metrics.revenueGrowth,
            label: 'vs last 30 days',
          }}
        />
        <StatsCard
          title="Total Orders"
          value={metrics.totalOrders}
          icon={ShoppingCart}
          trend={{
            value: metrics.ordersGrowth,
            label: 'vs last 30 days',
          }}
        />
        <StatsCard
          title="Total Customers"
          value={metrics.totalCustomers}
          icon={Users}
          description="Registered users"
        />
        <StatsCard
          title="Active Products"
          value={metrics.activeProducts}
          icon={Package}
          description="Available for purchase"
        />
      </div>

      {/* Top Products */}
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Top Selling Products</h2>
          <Link
            href="/admin/analytics"
            className="text-sm text-primary hover:underline"
          >
            View All Analytics
          </Link>
        </div>
        <div className="space-y-4">
          {metrics.topProducts.length > 0 ? (
            metrics.topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center space-x-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sold} units sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${product.revenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              No sales data available yet
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/products/new"
          className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <Package className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-semibold">Add Product</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new product listing
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <ShoppingCart className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-semibold">Manage Orders</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            View and update order status
          </p>
        </Link>

        <Link
          href="/admin/promotions"
          className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <TrendingUp className="mb-2 h-8 w-8 text-primary" />
          <h3 className="text-lg font-semibold">Create Promotion</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add new promo codes
          </p>
        </Link>
      </div>

      {/* Recent Activity Summary */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Performance Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Average Order Value</p>
            <p className="mt-2 text-2xl font-bold">
              ${metrics.avgOrderValue.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Pending Orders</p>
            <p className="mt-2 text-2xl font-bold">{metrics.pendingOrders}</p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Low Stock Products</p>
            <p className="mt-2 text-2xl font-bold">
              {metrics.lowStockProducts}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
