import { Cart, CartItem, Product, ProductVariant } from '@prisma/client';

// ============================================================================
// CART TYPES
// ============================================================================

export type CartItemWithProduct = CartItem & {
  product: Product;
  variant: ProductVariant | null;
};

export type CartWithItems = Cart & {
  items: CartItemWithProduct[];
};

export type CartItemData = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId: string | null;
  variantDetails: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
  stock: number;
};

export type CartData = {
  id: string;
  items: CartItemData[];
  subtotal: number;
  itemCount: number;
};

export type AddToCartInput = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type UpdateCartItemInput = {
  cartItemId: string;
  quantity: number;
};

export type CartSummary = {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
};
