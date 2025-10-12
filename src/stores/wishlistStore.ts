import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  lastFetched: number | null;
  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (wishlistId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistItemId: (productId: string) => string | null;
  setLoading: (loading: boolean) => void;
  setLastFetched: () => void;
  shouldRefetch: () => boolean;
  clearWishlist: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      lastFetched: null,

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => {
          // Prevent duplicates
          if (state.items.some((i) => i.productId === item.productId)) {
            return state;
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (wishlistId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== wishlistId),
        })),

      isInWishlist: (productId) => {
        const state = get();
        return state.items.some((item) => item.productId === productId);
      },

      getWishlistItemId: (productId) => {
        const state = get();
        const item = state.items.find((item) => item.productId === productId);
        return item?.id || null;
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setLastFetched: () => set({ lastFetched: Date.now() }),

      shouldRefetch: () => {
        const state = get();
        if (!state.lastFetched) return true;
        return Date.now() - state.lastFetched > CACHE_DURATION;
      },

      clearWishlist: () => set({ items: [], lastFetched: null }),
    }),
    {
      name: 'wishlist-storage',
      // Only persist items, not loading states
      partialize: (state) => ({
        items: state.items,
        lastFetched: state.lastFetched
      }),
    }
  )
);
