// app/categories/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tag, ChevronRight } from 'lucide-react';
import { mockProducts } from '@/lib/mockData';
import { Card } from '@/components/ui/card';

export default function CategoriesPage() {
  const categories = Array.from(
    new Map(
      mockProducts
        .filter((p) => p.categorie)
        .map((p) => [p.categorie!.id, p.categorie!])
    ).values()
  );

  const getProductCount = (categoryId: number) => {
    return mockProducts.filter((p) => p.categorie?.id === categoryId).length;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Nos Catégories
        </h1>
        <p className="text-gray-600">
          Explorez nos produits par catégorie
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/produits?categorie=${category.slug}`}>
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
                    <Tag className="w-6 h-6 text-primary" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {category.nom}
                </h3>
                <p className="text-sm text-gray-600">
                  {getProductCount(category.id)} produit{getProductCount(category.id) > 1 ? 's' : ''}
                </p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}