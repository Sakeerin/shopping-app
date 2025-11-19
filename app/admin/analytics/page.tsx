import { getSalesReport } from '@/services/analytics';
import { AnalyticsCharts } from '@/components/admin/analytics-charts';

// ============================================================================
// T166: ANALYTICS PAGE (Phase 7 - User Story 6)
// ============================================================================

export const dynamic = 'force-dynamic';

interface SearchParams {
  startDate?: string;
  endDate?: string;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Default to last 30 days
  const now = new Date();
  const defaultStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const startDate = searchParams.startDate
    ? new Date(searchParams.startDate)
    : defaultStartDate;
  const endDate = searchParams.endDate ? new Date(searchParams.endDate) : now;

  const report = await getSalesReport(startDate, endDate);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Sales performance and insights
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Date Range</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-foreground"
            >
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              defaultValue={startDate.toISOString().split('T')[0]}
              max={endDate.toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set('startDate', e.target.value);
                window.location.href = url.toString();
              }}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-foreground"
            >
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              defaultValue={endDate.toISOString().split('T')[0]}
              min={startDate.toISOString().split('T')[0]}
              max={now.toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              onChange={(e) => {
                const url = new URL(window.location.href);
                url.searchParams.set('endDate', e.target.value);
                window.location.href = url.toString();
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/admin/analytics';
            }}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted"
          >
            Reset to Last 30 Days
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold">
            ${report.totalRevenue.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="mt-2 text-3xl font-bold">{report.totalOrders}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Average Order Value</p>
          <p className="mt-2 text-3xl font-bold">
            ${report.avgOrderValue.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Units Sold</p>
          <p className="mt-2 text-3xl font-bold">{report.totalUnitsSold}</p>
        </div>
      </div>

      {/* Charts */}
      <AnalyticsCharts
        dailySales={report.dailySales}
        topProducts={report.topProducts}
        categorySales={report.categorySales}
      />

      {/* Top Products Table */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Top 20 Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Units Sold
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {report.topProducts.slice(0, 20).map((product, index) => (
                <tr key={product.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">{product.sold}</td>
                  <td className="px-4 py-3 font-medium">
                    ${product.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Performance */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Category Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Units Sold
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Revenue
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {report.categorySales.map((category) => (
                <tr key={category.categoryId} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">
                    {category.categoryName}
                  </td>
                  <td className="px-4 py-3">{category.sold}</td>
                  <td className="px-4 py-3 font-medium">
                    ${category.revenue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="mr-2 h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${
                              (category.revenue / report.totalRevenue) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm">
                        {((category.revenue / report.totalRevenue) * 100).toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
