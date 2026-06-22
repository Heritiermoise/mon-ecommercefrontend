// store/useWishlistStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const currentItems = get().items;
        if (!currentItems.find((i) => i.id === product.id)) {
          set({ items: [...currentItems, product] });
        }
      },
      
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      
      isInWishlist: (id) => get().items.some((i) => i.id === id),
      
      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'ecommerce-wishlist-storage' }
  )
);