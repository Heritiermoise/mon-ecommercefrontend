'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp, ShoppingCart, Users, Package, DollarSign,
  AlertTriangle, Loader2, ArrowRight, RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';

interface DashboardData {
  total_commandes: number;
  total_produits: number;
  total_clients: number;
  total_admins: number;
  revenu_total: number;
  commandes_en_attente: number;
  commandes_livrees: number;
  produits_en_stock: number;
  produits_stock_faible: number;
  produits_en_rupture: number;
  timestamp: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { formatPrice } = useCurrency();

  const fetchStats = async () => {
    try {
      const response: any = await adminAPI.dashboard();
      if (response.success) {
        setStats(response.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Erreur dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Derniere mise a jour : {lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <motion.div whileHover={{ y: -4 }}>
          <Card className="p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-500 to-emerald-600 opacity-10 rounded-full -translate-y-12 -translate-x-8 sm:-translate-y-16 sm:translate-x-16"></div>
            <div className="relative">
              <div className="inline-flex p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-2 sm:mb-4">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Revenu Total</p>
              <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
                {stats ? formatPrice(stats.revenu_total) : formatPrice(0)}
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 rounded-full -translate-y-12 -translate-x-8 sm:-translate-y-16 sm:translate-x-16"></div>
            <div className="relative">
              <div className="inline-flex p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-2 sm:mb-4">
                <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Commandes</p>
              <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                {stats?.total_commandes || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1 hidden sm:block">{stats?.commandes_livrees || 0} livrees</p>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10 rounded-full -translate-y-12 -translate-x-8 sm:-translate-y-16 sm:translate-x-16"></div>
            <div className="relative">
              <div className="inline-flex p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white mb-2 sm:mb-4">
                <Users className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Clients</p>
              <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                {stats?.total_clients || 0}
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-500 to-orange-600 opacity-10 rounded-full -translate-y-12 -translate-x-8 sm:-translate-y-16 sm:translate-x-16"></div>
            <div className="relative">
              <div className="inline-flex p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white mb-2 sm:mb-4">
                <Package className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Produits</p>
              <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                {stats?.total_produits || 0}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {(stats?.produits_stock_faible || 0) > 0 || (stats?.produits_en_rupture || 0) > 0 ? (
        <Card className="p-4 sm:p-6 border-l-4 border-l-amber-500">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Alertes de stock</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  <span className="text-xs sm:text-sm text-gray-700">
                    <strong>{stats?.produits_stock_faible || 0}</strong> produits en stock faible
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-xs sm:text-sm text-gray-700">
                    <strong>{stats?.produits_en_rupture || 0}</strong> produits en rupture
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <Link href="/admin/produits" className="col-span-1">
            <Button variant="outline" className="w-full justify-between group text-xs sm:text-sm h-10 sm:h-auto py-2 sm:py-3">
              <span className="flex items-center gap-1 sm:gap-2">
                <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Produits</span>
                <span className="sm:hidden">Prod</span>
              </span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/admin/commandes" className="col-span-1">
            <Button variant="outline" className="w-full justify-between group text-xs sm:text-sm h-10 sm:h-auto py-2 sm:py-3">
              <span className="flex items-center gap-1 sm:gap-2">
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Commandes</span>
                <span className="sm:hidden">Cmd</span>
              </span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/admin/utilisateurs" className="col-span-1">
            <Button variant="outline" className="w-full justify-between group text-xs sm:text-sm h-10 sm:h-auto py-2 sm:py-3">
              <span className="flex items-center gap-1 sm:gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Utilisateurs</span>
                <span className="sm:hidden">Users</span>
              </span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/admin/statistiques" className="col-span-1">
            <Button variant="outline" className="w-full justify-between group text-xs sm:text-sm h-10 sm:h-auto py-2 sm:py-3">
              <span className="flex items-center gap-1 sm:gap-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Statistiques</span>
                <span className="sm:hidden">Stats</span>
              </span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}