// store/useOrderStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order } from '@/types';

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: number, status: Order['statut']) => void;
  getOrderByNumber: (numero: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      
      addOrder: (order) => {
        set({ orders: [order, ...get().orders] });
      },
      
      updateOrderStatus: (id, status) => {
        set({
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, statut: status } : o
          ),
        });
      },
      
      getOrderByNumber: (numero) => {
        return get().orders.find((o) => o.numero_commande === numero);
      },
    }),
    { name: 'ecommerce-orders-storage' }
  )
);