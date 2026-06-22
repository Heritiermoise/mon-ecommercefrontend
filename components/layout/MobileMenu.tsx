// components/layout/MobileMenu.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Home, ShoppingBag, Tag, User, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const itemCount = useCartStore((state) => state.getItemCount());

  const menuItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/produits', label: 'Boutique', icon: ShoppingBag },
    { href: '/categories', label: 'Catégories', icon: Tag },
    { href: '/panier', label: 'Panier', icon: ShoppingCart, badge: itemCount },
    { href: '/connexion', label: 'Connexion', icon: User },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ShopPro
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-4">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 transition-all group"
                    >
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                      <span className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto px-2 py-1 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-gray-50">
              <p className="text-sm text-gray-500 text-center">
                © 2024 ShopPro. Tous droits réservés.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}