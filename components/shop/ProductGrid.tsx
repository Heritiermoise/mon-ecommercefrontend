// components/shop/ProductGrid.tsx
'use client';

import type { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  // Vérification de sécurité
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className="text-center py-12 col-span-full">
        <p className="text-muted-foreground text-lg">Aucun produit disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        // Vérification que le produit est valide
        if (!product || !product.id) return null;
        
        return (
          <ProductCard key={product.id} product={product} />
        );
      })}
    </div>
  );
}