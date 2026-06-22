'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Package, Loader2, AlertCircle, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { wishlistAPI } from '@/lib/wishlist';
import { useCurrency } from '@/hooks/useCurrency';

export default function WishlistPartageePage() {
  const params = useParams();
  const token = params.token as string;
  const { formatPrice } = useCurrency();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPartage = async () => {
      try {
        const response: any = await wishlistAPI.voirPartage(token);
        if (response.success) {
          setData(response.data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPartage();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Wishlist introuvable
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error || 'Cette wishlist n existe plus ou a expire'}
          </p>
          <Link href="/">
            <Button>Retour a l accueil</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 border-pink-200 dark:border-pink-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-pink-600 dark:text-pink-400 mb-2">
              <Heart className="w-4 h-4 fill-pink-500" />
              Wishlist partagee
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {data.nom}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Une wishlist de <strong>{data.proprietaire}</strong>
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {data.items?.length || 0} produit{(data.items?.length || 0) > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                Partage public
              </span>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Partager
          </Button>
        </div>
      </Card>

      {/* Produits */}
      {data.items?.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Cette wishlist est vide</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.items?.map((item: any, index: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/produits/${item.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:-translate-y-1 group h-full flex flex-col">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.nom}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                    {!item.en_stock && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        Rupture
                      </div>
                    )}
                    {item.en_promo && item.prix_remise && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{Math.round(((item.prix - item.prix_remise) / item.prix) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {item.nom}
                    </h3>
                    {item.categorie && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {item.categorie}
                      </p>
                    )}
                    <div className="mt-auto">
                      {item.en_promo && item.prix_remise ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                            {formatPrice(item.prix_remise)}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(item.prix)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                          {formatPrice(item.prix)}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}