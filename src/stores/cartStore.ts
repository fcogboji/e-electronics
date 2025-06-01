import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Type for a single cart item
export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

// Store structure definition
type CartStore = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
};

// Create Zustand store with localStorage persistence
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Add item or update quantity if it already exists
      addToCart: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      // Remove item from cart
      removeFromCart: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

     
      // Clear the entire cart and log for debugging
clearCart: () => {
  set({ items: [] });
  console.log('✅ Cart cleared after payment success');
},


      // Increase quantity by 1
      increaseQty: (id) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        });
      },

      // Decrease quantity by 1 (remove if zero)
      decreaseQty: (id) => {
        const updatedItems = get().items
          .map((i) =>
            i.id === id ? { ...i, quantity: i.quantity - 1 } : i
          )
          .filter((i) => i.quantity > 0);
        set({ items: updatedItems });
      },
    }),
    
    {
      name: 'cart-storage', // localStorage key
    }
  )
);
