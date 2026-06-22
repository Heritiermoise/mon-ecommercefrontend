// components/admin/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Tag, 
  Building2,
  Star,
  Bell,
  Settings,
  LogOut,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/produits', label: 'Produits', icon: Package },
    { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    { href: '/admin/commandes', label: 'Commandes', icon: ShoppingCart },
    { href: '/admin/categories', label: 'Catégories', icon: Tag },
    { href: '/admin/marques', label: 'Marques', icon: Building2 },
    { href: '/admin/avis', label: 'Avis', icon: Star },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/statistiques', label: 'Statistiques', icon: TrendingUp },
    { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/connexion');
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ShopPro</h1>
            <p className="text-xs text-slate-400">Administration</p>
          </div>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profil utilisateur */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-semibold">
            {user?.nom?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.nom}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </motion.aside>
  );
}