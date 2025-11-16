import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartData } from '@/types/cart';

// ============================================================================
// CART ZUSTAND STORE (Client-Side State Management with localStorage)
// ============================================================================

interface PromoCodeData {
  code: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscount: number | null;
}

interface CartStore {
  cart: CartData | null;
  isLoading: boolean;
  error: string | null;
  promoCode: PromoCodeData | null;

  // Actions
  setCart: (cart: CartData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCart: () => void;

  // Promo code actions
  setPromoCode: (promoCode: PromoCodeData) => void;
  removePromoCode: () => void;

  // Computed values
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  hasItems: () => boolean;
  hasPromoCode: () => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      error: null,
      promoCode: null,

      // Actions
      setCart: (cart) => set({ cart, error: null }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearCart: () => set({ cart: null, error: null, promoCode: null }),

      // Promo code actions
      setPromoCode: (promoCode) => set({ promoCode, error: null }),

      removePromoCode: () => set({ promoCode: null }),

      // Computed values
      getItemCount: () => {
        const { cart } = get();
        return cart?.itemCount || 0;
      },

      getSubtotal: () => {
        const { cart } = get();
        return cart?.subtotal || 0;
      },

      getDiscount: () => {
        const { promoCode } = get();
        return promoCode?.discount || 0;
      },

      getTotal: () => {
        const { cart, promoCode } = get();
        const subtotal = cart?.subtotal || 0;
        const discount = promoCode?.discount || 0;
        return Math.max(0, subtotal - discount);
      },

      hasItems: () => {
        const { cart } = get();
        return cart !== null && cart.items.length > 0;
      },

      hasPromoCode: () => {
        const { promoCode } = get();
        return promoCode !== null;
      },
    }),
    {
      name: 'shopping-cart-storage', // localStorage key
      partialize: (state) => ({
        // Only persist cart data and promo code, not loading/error states
        cart: state.cart,
        promoCode: state.promoCode,
      }),
    }
  )
);

// ============================================================================
// HELPER HOOKS
// ============================================================================

// Hook to get cart item count
export const useCartItemCount = () => {
  return useCartStore((state) => state.getItemCount());
};

// Hook to get cart subtotal
export const useCartSubtotal = () => {
  return useCartStore((state) => state.getSubtotal());
};

// Hook to check if cart has items
export const useHasCartItems = () => {
  return useCartStore((state) => state.hasItems());
};

// Hook to get cart discount
export const useCartDiscount = () => {
  return useCartStore((state) => state.getDiscount());
};

// Hook to get cart total (subtotal - discount)
export const useCartTotal = () => {
  return useCartStore((state) => state.getTotal());
};

// Hook to check if promo code is applied
export const useHasPromoCode = () => {
  return useCartStore((state) => state.hasPromoCode());
};
