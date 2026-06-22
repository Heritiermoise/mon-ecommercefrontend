// components/admin/TopProducts.tsx
import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';

const topProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max',
    sales: 234,
    revenue: '€301,197',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100',
  },
  {
    id: 2,
    name: 'MacBook Pro 14"',
    sales: 189,
    revenue: '€377,998',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100',
  },
  {
    id: 3,
    name: 'AirPods Pro 2',
    sales: 456,
    revenue: '€113,995',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=100',
  },
  {
    id: 4,
    name: 'Samsung Galaxy S24',
    sales: 167,
    revenue: '€217,098',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100',
  },
];

export default function TopProducts() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Produits populaires</h3>
        </div>
        <button className="text-sm text-primary hover:underline">
          Voir tout
        </button>
      </div>

      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-gray-600">{product.rating}</span>
                </div>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600">{product.sales} ventes</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{product.revenue}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}