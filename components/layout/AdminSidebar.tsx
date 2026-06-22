'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  TrendingUp, Settings, Shield, DollarSign, Menu, X,
  Tag, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, shortLabel: 'Home' },
  { href: '/admin/produits', label: 'Produits', icon: Package, shortLabel: 'Prod' },
  { href: '/admin/categories', label: 'Categories', icon: Tag, shortLabel: 'Cats' },
  { href: '/admin/marques', label: 'Marques', icon: Award, shortLabel: 'Marks' },
  { href: '/admin/commandes', label: 'Commandes', icon: ShoppingCart, shortLabel: 'Cmds' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users, shortLabel: 'Users' },
  { href: '/admin/statistiques', label: 'Statistiques', icon: TrendingUp, shortLabel: 'Stats' },
  { href: '/admin/parametres', label: 'Parametres', icon: Settings, shortLabel: 'Set' },
  { href: '/admin/taux-change', label: 'Taux Change', icon: DollarSign, shortLabel: 'FX' },
  { href: '/admin/securite', label: 'Securite', icon: Shield, shortLabel: 'Sec' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ShopPro Admin
          </h2>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}