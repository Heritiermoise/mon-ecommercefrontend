// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Star, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { productsAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';

interface Product {
  id: number;
  nom: string;
  slug: string;
  prix: number | string;
  prix_remise?: number | string | null;
  image_principale?: string;
  note_moyenne?: number | string;
  nombre_avis?: number;
  categorie?: { nom: string };
  marque?: { nom: string };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    productsAPI.getAll({ page: 1 })
      .then((response: any) => {
        if (response.success) {
          setProducts(response.data || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Tous les produits</h1>
        <p className="text-gray-600 mt-1">{products.length} produit(s) disponible(s)</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun produit disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {products.map((product, index) => {
            const prix = toNumber(product.prix);
            const prixRemise = product.prix_remise ? toNumber(product.prix_remise) : null;
            const hasRemise = prixRemise !== null && prixRemise > 0 && prixRemise < prix;
            const pourcentageReduction = hasRemise ? Math.round(((prix - prixRemise) / prix) * 100) : 0;
            const noteMoyenne = toNumber(product.note_moyenne);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Link href={`/produits/${product.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100 hover:border-indigo-200 h-full flex flex-col">
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                      {product.image_principale ? (
                        <img
                          src={product.image_principale}
                          alt={product.nom}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
                        </div>
                      )}
                      {hasRemise && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                          -{pourcentageReduction}%
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors text-sm sm:text-base">
                        {product.nom}
                      </h3>
                      {product.categorie && (
                        <p className="text-xs text-gray-500 mb-2">{product.categorie.nom}</p>
                      )}
                      <div className="flex items-center gap-2 mb-2 mt-auto">
                        {hasRemise ? (
                          <>
                            <span className="text-base sm:text-lg lg:text-xl font-bold text-indigo-600">
                              {formatPrice(prixRemise)}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                              {formatPrice(prix)}
                            </span>
                          </>
                        ) : (
                          <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                            {formatPrice(prix)}
                          </span>
                        )}
                      </div>
                      {noteMoyenne > 0 && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                          <span>{noteMoyenne.toFixed(1)}</span>
                          <span className="text-gray-400">({product.nombre_avis || 0})</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
