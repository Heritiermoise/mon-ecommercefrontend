'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Package, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { searchAPI } from '@/lib/search';
import { useCurrency } from '@/hooks/useCurrency';

export default function RecemmentVus() {
  const { formatPrice } = useCurrency();
  const [produits, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecemmentVus();
  }, []);

  const fetchRecemmentVus = async () => {
    try {
      const response: any = await searchAPI.getRecemmentVus();
      if (response.success) {
        setProduits(response.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (produits.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Eye className="w-6 h-6 text-indigo-600" />
          Recemment consultes
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {produits.map((produit) => (
          <Link key={produit.id} href={`/produits/${produit.slug}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:-translate-y-1 group">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 relative">
                {produit.image_principale ? (
                  <img
                    src={produit.image_principale}
                    alt={produit.nom}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
                {produit.en_promo && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{produit.pourcentage_reduction}%
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2 mb-2">
                  {produit.nom}
                </h3>
                <div className="flex items-baseline gap-2">
                  {produit.en_promo && produit.prix_remise ? (
                    <>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(produit.prix_remise)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(produit.prix)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(produit.prix)}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}