import {
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductVariant,
} from '@prisma/client';

// ============================================================================
// ORDER TYPES
// ============================================================================

export type OrderItemWithProduct = OrderItem & {
  product: Product;
  variant: ProductVariant | null;
};

export type OrderWithItems = Order & {
  items: OrderItemWithProduct[];
};

export type OrderData = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  items: OrderItemData[];
  shippingAddress: ShippingAddress;
  createdAt: Date;
  estimatedDelivery?: Date;
};

export type OrderItemData = {
  id: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantDetails: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type ShippingAddress = {
  fullName: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

export type CheckoutInput = {
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  useSameAddress: boolean;
  promoCode?: string;
  notes?: string;
};

export type CreateOrderInput = {
  cartId: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  promoCode?: string;
  notes?: string;
};

export type OrderSummary = {
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: Date;
};

export type CartSummary = {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
};
