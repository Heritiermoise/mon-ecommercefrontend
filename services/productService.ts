// services/productService.ts
import api from '@/lib/api'; // 🔥 CHANGEMENT ICI : on importe depuis api.ts
import type { Product } from '@/types';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products');
      return response.data.data || response.data; 
    } catch (error) {
      console.error("Erreur API products:", error);
      return []; // 🔥 Sécurité : retourne un tableau vide si le backend est éteint
    }
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/${slug}`);
    return response.data.data || response.data;
  },
};