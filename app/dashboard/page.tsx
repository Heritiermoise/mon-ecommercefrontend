'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, ShoppingBag, DollarSign, Gift, Package, 
  Loader2, AlertCircle 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';

interface UserProfile {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: string;
  statut: string;
  points_fidelite: number;
  total_depense: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { formatPrice } = useCurrency();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/connexion');
      return;
    }

    authAPI.profile()
      .then((response: any) => {
        if (response.success) {
          setProfile(response.user);
        }
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Mon espace</h1>
        <p className="text-gray-600 mt-1">Bienvenue, {profile.nom} !</p>
      </div>

      {/* Cartes d'informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -4 }}>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Profil</p>
                <p className="text-lg font-bold text-gray-900">{profile.nom}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total dépensé</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(profile.total_depense)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Points fidélité</p>
                <p className="text-lg font-bold text-gray-900">{profile.points_fidelite}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{profile.statut}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Actions rapides */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button variant="outline" className="justify-start gap-2">
            <Package className="w-4 h-4" />
            Mes commandes
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <ShoppingBag className="w-4 h-4" />
            Mon panier
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <Gift className="w-4 h-4" />
            Mes récompenses
          </Button>
          <Button variant="outline" className="justify-start gap-2">
            <User className="w-4 h-4" />
            Modifier profil
          </Button>
        </div>
      </Card>

      {/* Informations du compte */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informations du compte</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{profile.email}</span>
          </div>
          {profile.telephone && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Téléphone</span>
              <span className="font-medium">{profile.telephone}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Rôle</span>
            <span className="font-medium capitalize">{profile.role}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}