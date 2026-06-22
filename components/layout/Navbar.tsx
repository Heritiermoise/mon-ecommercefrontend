'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, User, Menu, X, Heart, 
  LogOut, LayoutDashboard, Package, Bell, Shield,
  Moon, Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/components/providers/ThemeProvider';
import CurrencySwitcher from './CurrencySwitcher';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, initializeAuth } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleLogout = async () => {
    await logout();
    router.push('/connexion');
  };

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/produits', label: 'Boutique' },
    { href: '/categories', label: 'Categories' },
  ];

  return (
    <nav className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ShopPro
            </span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                  pathname === link.href 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Toggle Theme */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            <CurrencySwitcher />

            {isAuthenticated && user ? (
              <>
                <Link href="/panier">
                  <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300">
                    <ShoppingBag className="w-5 h-5" />
                  </Button>
                </Link>

                <div className="relative group">
                  <Button variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.nom.split(' ')[0]}</span>
                  </Button>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.nom}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                        <LayoutDashboard className="w-4 h-4" />
                        Mon espace
                      </Link>
                      <Link href="/commandes" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                        <Package className="w-4 h-4" />
                        Mes commandes
                      </Link>
                      {(user.role === 'administrateur' || user.role === 'super_administrateur') && (
                        <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg">
                          <Shield className="w-4 h-4" />
                          Administration
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        Deconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/connexion">
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    Connexion
                  </Button>
                </Link>
                <Link href="/inscription">
                  <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Actions Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            <CurrencySwitcher />

            {isAuthenticated && (
              <Link href="/panier">
                <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300">
                  <ShoppingBag className="w-5 h-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium ${
                    pathname === link.href
                      ? 'bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      Mon espace
                    </Link>
                    <Link href="/commandes" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      Mes commandes
                    </Link>
                    {(user.role === 'administrateur' || user.role === 'super_administrateur') && (
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                        Administration
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700"
                    >
                      Deconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/connexion" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-center">
                      Connexion
                    </Link>
                    <Link href="/inscription" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center font-medium">
                      Inscription
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}