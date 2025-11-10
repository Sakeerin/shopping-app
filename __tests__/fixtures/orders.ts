import { Order, OrderItem, OrderStatus, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export const mockShippingAddress = {
  fullName: 'John Doe',
  street: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94102',
  country: 'US',
  phone: '555-1234',
};

export const mockOrder: Order = {
  id: 'order-1',
  orderNumber: 'ORD-20240101-001',
  userId: 'user-1',
  userEmail: 'john@example.com',
  status: OrderStatus.PENDING,
  subtotal: new Decimal('149.99'),
  taxAmount: new Decimal('12.00'),
  shippingCost: new Decimal('5.99'),
  discountAmount: new Decimal('0'),
  totalAmount: new Decimal('167.98'),
  shippingAddress: mockShippingAddress,
  billingAddress: null,
  paymentStatus: PaymentStatus.PENDING,
  paymentIntentId: null,
  trackingNumber: null,
  shippedAt: null,
  deliveredAt: null,
  promoCode: null,
  notes: null,
  adminNotes: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

export const mockOrderItem: OrderItem = {
  id: 'item-1',
  orderId: 'order-1',
  productId: 'prod-1',
  variantId: null,
  productName: 'Wireless Headphones',
  productSlug: 'wireless-headphones',
  productImage: 'https://example.com/headphones.jpg',
  variantDetails: null,
  priceSnapshot: new Decimal('149.99'),
  quantity: 1,
  lineTotal: new Decimal('149.99'),
  createdAt: new Date('2024-01-01'),
};

export const mockOrders: Order[] = [
  mockOrder,
  {
    ...mockOrder,
    id: 'order-2',
    orderNumber: 'ORD-20240102-002',
    status: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.SUCCEEDED,
    paymentIntentId: 'pi_mock123',
  },
  {
    ...mockOrder,
    id: 'order-3',
    orderNumber: 'ORD-20240103-003',
    status: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.SUCCEEDED,
    paymentIntentId: 'pi_mock456',
    trackingNumber: 'TRACK123456',
    shippedAt: new Date('2024-01-02'),
  },
];

export function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    ...mockOrder,
    ...overrides,
    id: overrides.id || `order-${Date.now()}`,
    orderNumber: overrides.orderNumber || `ORD-${Date.now()}`,
    subtotal: overrides.subtotal || mockOrder.subtotal,
    taxAmount: overrides.taxAmount || mockOrder.taxAmount,
    shippingCost: overrides.shippingCost || mockOrder.shippingCost,
    discountAmount: overrides.discountAmount || mockOrder.discountAmount,
    totalAmount: overrides.totalAmount || mockOrder.totalAmount,
  };
}

export function createMockOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    ...mockOrderItem,
    ...overrides,
    id: overrides.id || `item-${Date.now()}`,
    priceSnapshot: overrides.priceSnapshot || mockOrderItem.priceSnapshot,
    lineTotal: overrides.lineTotal || mockOrderItem.lineTotal,
  };
}
