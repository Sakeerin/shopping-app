import { prisma } from '@/lib/db';

// ============================================================================
// ANALYTICS SERVICES (Phase 7 - User Story 6)
// ============================================================================

// ============================================================================
// T142: GET DASHBOARD METRICS
// ============================================================================

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  activeProducts: number;
  revenueGrowth: number; // Percentage change from previous period
  ordersGrowth: number;
  averageOrderValue: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Get current period stats (last 30 days)
  const [
    currentRevenue,
    currentOrders,
    totalCustomers,
    activeProducts,
    previousRevenue,
    previousOrders,
  ] = await Promise.all([
    // Current period revenue
    prisma.order.aggregate({
      where: {
        status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { total: true },
    }),

    // Current period orders count
    prisma.order.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    }),

    // Total customers
    prisma.user.count({
      where: { role: 'CUSTOMER' },
    }),

    // Active products
    prisma.product.count({
      where: { isActive: true },
    }),

    // Previous period revenue (30-60 days ago)
    prisma.order.aggregate({
      where: {
        status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
      _sum: { total: true },
    }),

    // Previous period orders
    prisma.order.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    }),
  ]);

  const totalRevenue = Number(currentRevenue._sum.total || 0);
  const prevRevenue = Number(previousRevenue._sum.total || 0);
  const totalOrders = currentOrders;

  // Calculate growth percentages
  const revenueGrowth = prevRevenue > 0
    ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
    : 0;

  const ordersGrowth = previousOrders > 0
    ? ((totalOrders - previousOrders) / previousOrders) * 100
    : 0;

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get top selling products (last 30 days)
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: {
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
      },
    },
    _sum: {
      quantity: true,
      priceSnapshot: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: 5,
  });

  // Fetch product details for top sellers
  const topSellingProducts = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true },
      });

      return {
        id: item.productId,
        name: product?.name || 'Unknown Product',
        totalSold: item._sum.quantity || 0,
        revenue: Number(item._sum.priceSnapshot || 0) * (item._sum.quantity || 0),
      };
    })
  );

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    activeProducts,
    revenueGrowth,
    ordersGrowth,
    averageOrderValue,
    topSellingProducts,
  };
}

// ============================================================================
// T143: GET ALL ORDERS (Admin View)
// ============================================================================

export interface OrderFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: Date;
  itemCount: number;
}

export interface OrderListResponse {
  orders: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getAllOrders(filters: OrderFilters = {}): Promise<OrderListResponse> {
  const {
    status,
    startDate,
    endDate,
    searchQuery,
    page = 1,
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  if (searchQuery) {
    where.OR = [
      { orderNumber: { contains: searchQuery, mode: 'insensitive' } },
      { user: { email: { contains: searchQuery, mode: 'insensitive' } } },
      { user: { name: { contains: searchQuery, mode: 'insensitive' } } },
    ];
  }

  // Fetch orders and total count
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  // Transform to OrderListItem
  const orderList: OrderListItem[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.user.name || 'Guest',
    customerEmail: order.user.email,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }));

  return {
    orders: orderList,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============================================================================
// T144: GET CUSTOMERS
// ============================================================================

export interface CustomerData {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: Date | null;
}

export interface CustomerListResponse {
  customers: CustomerData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getCustomers(
  page: number = 1,
  limit: number = 20
): Promise<CustomerListResponse> {
  const skip = (page - 1) * limit;

  // Fetch customers
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        orders: {
          select: {
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
  ]);

  // Transform to CustomerData
  const customers: CustomerData[] = users.map((user) => {
    const orderCount = user.orders.length;
    const totalSpent = user.orders.reduce((sum, order) => sum + Number(order.total), 0);
    const lastOrderDate = user.orders.length > 0 ? user.orders[0].createdAt : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      orderCount,
      totalSpent,
      lastOrderDate,
    };
  });

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ============================================================================
// T145: GET SALES REPORT
// ============================================================================

export interface SalesReportData {
  dateRange: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    slug: string;
    quantitySold: number;
    revenue: number;
  }>;
  topCategories: Array<{
    id: string;
    name: string;
    orderCount: number;
    revenue: number;
  }>;
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export async function getSalesReport(
  startDate: Date,
  endDate: Date
): Promise<SalesReportData> {
  // Fetch orders within date range
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate top products
  const productSales = new Map<string, { name: string; slug: string; quantity: number; revenue: number }>();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = item.productId;
      const existing = productSales.get(key);
      const itemRevenue = Number(item.priceSnapshot) * item.quantity;

      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += itemRevenue;
      } else {
        productSales.set(key, {
          name: item.product.name,
          slug: item.product.slug,
          quantity: item.quantity,
          revenue: itemRevenue,
        });
      }
    });
  });

  const topProducts = Array.from(productSales.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      slug: data.slug,
      quantitySold: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Calculate top categories
  const categorySales = new Map<string, { name: string; orders: number; revenue: number }>();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.product.category) {
        const key = item.product.category.id;
        const existing = categorySales.get(key);
        const itemRevenue = Number(item.priceSnapshot) * item.quantity;

        if (existing) {
          existing.orders += 1;
          existing.revenue += itemRevenue;
        } else {
          categorySales.set(key, {
            name: item.product.category.name,
            orders: 1,
            revenue: itemRevenue,
          });
        }
      }
    });
  });

  const topCategories = Array.from(categorySales.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      orderCount: data.orders,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Calculate daily sales
  const dailySalesMap = new Map<string, { revenue: number; orders: number }>();

  orders.forEach((order) => {
    const dateKey = order.createdAt.toISOString().split('T')[0];
    const existing = dailySalesMap.get(dateKey);

    if (existing) {
      existing.revenue += Number(order.total);
      existing.orders += 1;
    } else {
      dailySalesMap.set(dateKey, {
        revenue: Number(order.total),
        orders: 1,
      });
    }
  });

  const dailySales = Array.from(dailySalesMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    dateRange: {
      start: startDate,
      end: endDate,
    },
    totalRevenue,
    totalOrders,
    averageOrderValue,
    topProducts,
    topCategories,
    dailySales,
  };
}
