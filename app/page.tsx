'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, ArrowRight, Star, Sparkles, Truck, Shield, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { productsAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import Loader from '@/components/ui/Loader';

interface Product {
  id: number;
  nom: string;
  slug: string;
  prix: number | string;
  prix_remise?: number | string | null;
  image_principale?: string;
  note_moyenne?: number | string;
  nombre_avis?: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    productsAPI.getAll({ page: 1 })
      .then((response: any) => {
        if (response.success) {
          const data = response.data?.data || response.data || [];
          setProducts(Array.isArray(data) ? data : []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20">
      {/* HERO SECTION */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Nouvelle collection disponible</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Bienvenue sur
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-white bg-clip-text text-transparent">
                ShopPro
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              DÃ©couvrez notre sÃ©lection de produits premium. Paiement sÃ©curisÃ© en USD et CDF.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/produits">
                <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-gray-100 shadow-xl text-base sm:text-lg px-8 py-6 font-bold">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Voir la boutique
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 text-base sm:text-lg px-8 py-6 font-bold">
                  Explorer
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: Truck, title: 'Livraison rapide', desc: 'Gratuite des 100$', color: 'from-blue-500 to-cyan-500' },
          { icon: Shield, title: 'Paiement securise', desc: '100% protege', color: 'from-green-500 to-emerald-500' },
          { icon: Headphones, title: 'Support 24/7', desc: 'A votre ecoute', color: 'from-purple-500 to-pink-500' },
          { icon: Star, title: 'Qualite premium', desc: 'Produits selectionnes', color: 'from-amber-500 to-orange-500' },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* PRODUITS */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Produits en vedette
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            Nos meilleures offres du moment
          </p>
        </div>

        {loading ? (
          <Loader size="lg" text="Chargement des produits..." />
        ) : products.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">Aucun produit disponible</p>
            <Link href="/admin/produits">
              <Button>Ajouter des produits</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.slice(0, 8).map((product, index) => {
              const prix = toNumber(product.prix);
              const prixRemise = product.prix_remise ? toNumber(product.prix_remise) : null;
              const hasRemise = prixRemise !== null && prixRemise > 0 && prixRemise < prix;
              const pourcentageReduction = hasRemise ? Math.round(((prix - prixRemise) / prix) * 100) : 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/produits/${product.slug}`}>
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:-translate-y-2 h-full flex flex-col group">
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                        {product.image_principale ? (
                          <img
                            src={product.image_principale}
                            alt={product.nom}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                        {hasRemise && (
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold shadow-lg">
                            -{pourcentageReduction}%
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm sm:text-base">
                          {product.nom}
                        </h3>
                        <div className="flex items-center gap-2 mt-auto">
                          {hasRemise ? (
                            <>
                              <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                {formatPrice(prixRemise)}
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(prix)}
                              </span>
                            </>
                          ) : (
                            <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                              {formatPrice(prix)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {products.length > 8 && (
          <div className="text-center mt-10">
            <Link href="/produits">
              <Button size="lg" variant="outline" className="border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group text-base sm:text-lg px-8 py-6">
                Voir tous les produits
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
