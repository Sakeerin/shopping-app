import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartData } from '@/types/cart';

// ============================================================================
// CART ZUSTAND STORE (Client-Side State Management with localStorage)
// ============================================================================

interface CartStore {
  cart: CartData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCart: (cart: CartData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCart: () => void;

  // Computed values
  getItemCount: () => number;
  getSubtotal: () => number;
  hasItems: () => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      error: null,

      // Actions
      setCart: (cart) => set({ cart, error: null }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearCart: () => set({ cart: null, error: null }),

      // Computed values
      getItemCount: () => {
        const { cart } = get();
        return cart?.itemCount || 0;
      },

      getSubtotal: () => {
        const { cart } = get();
        return cart?.subtotal || 0;
      },

      hasItems: () => {
        const { cart } = get();
        return cart !== null && cart.items.length > 0;
      },
    }),
    {
      name: 'shopping-cart-storage', // localStorage key
      partialize: (state) => ({
        // Only persist cart data, not loading/error states
        cart: state.cart,
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
