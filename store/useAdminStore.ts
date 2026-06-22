// store/useAdminStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, User, Order, Category, Brand } from '@/types';

interface AdminState {
  // Produits
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  
  // Utilisateurs
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: number, user: Partial<User>) => void;
  deleteUser: (id: number) => void;
  
  // Commandes
  orders: Order[];
  updateOrderStatus: (id: number, status: Order['statut']) => void;
  deleteOrder: (id: number) => void;
  
  // Catégories
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: number, category: Partial<Category>) => void;
  deleteCategory: (id: number) => void;
  
  // Marques
  brands: Brand[];
  addBrand: (brand: Brand) => void;
  updateBrand: (id: number, brand: Partial<Brand>) => void;
  deleteBrand: (id: number) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      // Produits
      products: [],
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),
      
      // Utilisateurs
      users: [],
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map((u) => u.id === id ? { ...u, ...updates } : u)
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter((u) => u.id !== id)
      })),
      
      // Commandes
      orders: [],
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map((o) => o.id === id ? { ...o, statut: status } : o)
      })),
      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter((o) => o.id !== id)
      })),
      
      // Catégories
      categories: [],
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map((c) => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter((c) => c.id !== id)
      })),
      
      // Marques
      brands: [],
      addBrand: (brand) => set((state) => ({ brands: [...state.brands, brand] })),
      updateBrand: (id, updates) => set((state) => ({
        brands: state.brands.map((b) => b.id === id ? { ...b, ...updates } : b)
      })),
      deleteBrand: (id) => set((state) => ({
        brands: state.brands.filter((b) => b.id !== id)
      })),
    }),
    { name: 'ecommerce-admin-storage' }
  )
);