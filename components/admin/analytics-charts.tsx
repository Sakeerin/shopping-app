'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ============================================================================
// T156: ANALYTICS CHARTS COMPONENT (Phase 7 - User Story 6)
// ============================================================================

interface DailySale {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  id: string;
  name: string;
  sold: number;
  revenue: number;
}

interface CategorySale {
  categoryId: string;
  categoryName: string;
  sold: number;
  revenue: number;
}

interface AnalyticsChartsProps {
  dailySales: DailySale[];
  topProducts: TopProduct[];
  categorySales: CategorySale[];
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF6B9D',
];

export function AnalyticsCharts({
  dailySales,
  topProducts,
  categorySales,
}: AnalyticsChartsProps) {
  // Format daily sales data for charts
  const formattedDailySales = useMemo(() => {
    return dailySales.map((sale) => ({
      date: new Date(sale.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      revenue: sale.revenue,
      orders: sale.orders,
    }));
  }, [dailySales]);

  // Format top products data
  const formattedTopProducts = useMemo(() => {
    return topProducts.slice(0, 10).map((product) => ({
      name: product.name.length > 20 ? product.name.slice(0, 20) + '...' : product.name,
      revenue: product.revenue,
      sold: product.sold,
    }));
  }, [topProducts]);

  // Format category sales data
  const formattedCategorySales = useMemo(() => {
    return categorySales.map((category) => ({
      name: category.categoryName,
      value: category.revenue,
      sold: category.sold,
    }));
  }, [categorySales]);

  return (
    <div className="space-y-8">
      {/* Revenue Over Time */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={300} data-testid="revenue-chart">
          <LineChart data={formattedDailySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0088FE"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Over Time */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Orders Over Time</h3>
        <ResponsiveContainer width="100%" height={300} data-testid="sales-chart">
          <BarChart data={formattedDailySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [value, 'Orders']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Legend />
            <Bar
              dataKey="orders"
              fill="#00C49F"
              name="Orders"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Top Products by Revenue</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={formattedTopProducts}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={120}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                  return [value, 'Units Sold'];
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Bar dataKey="revenue" fill="#8884D8" name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Sales */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={formattedCategorySales}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {formattedCategorySales.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Category Legend */}
          <div className="mt-4 space-y-2">
            {formattedCategorySales.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div
                    className="mr-2 h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{category.name}</span>
                </div>
                <span className="text-muted-foreground">
                  ${category.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
