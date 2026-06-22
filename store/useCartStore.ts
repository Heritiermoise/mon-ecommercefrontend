// store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isInCart: (id: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.id === item.id);
        
        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantite: i.quantite + item.quantite } : i
            ),
          });
        } else {
          set({ items: [...currentItems, item] });
        }
      },
      
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
        } else {
          set({
            items: get().items.map((i) => (i.id === id ? { ...i, quantite: quantity } : i)),
          });
        }
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.prix * item.quantite, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantite, 0);
      },

      isInCart: (id) => {
        return get().items.some((i) => i.id === id);
      },
    }),
    { name: 'ecommerce-cart-storage' }
  )
);