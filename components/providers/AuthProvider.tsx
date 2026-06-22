'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

// Routes protégées pour les clients
const protectedClientRoutes = ['/dashboard', '/commandes', '/panier', '/wishlist', '/profil'];

// Routes protégées pour les admins
const protectedAdminRoutes = ['/admin'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialiser l'auth au montage
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Vérifier les routes protégées
    const isClientRoute = protectedClientRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = protectedAdminRoutes.some(route => pathname.startsWith(route));

    if (isClientRoute || isAdminRoute) {
      if (!isAuthenticated) {
        // Rediriger vers la connexion
        router.push('/connexion?redirect=' + encodeURIComponent(pathname));
      } else if (isAdminRoute && user) {
        // Vérifier le rôle admin
        if (user.role !== 'administrateur' && user.role !== 'super_administrateur') {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, pathname, router]);

  return <>{children}</>;
}