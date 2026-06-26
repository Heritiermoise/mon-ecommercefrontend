// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package,
  DollarSign, Star, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#84cc16'];

export default function StatistiquesPage() {
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periode, setPeriode] = useState('12m');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await adminAPI.statistics.get();
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Erreur de chargement');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const g = stats.globales;

  const kpiCards = [
    { label: 'Revenu Total', value: formatPrice(g.revenu_total), icon: DollarSign, color: 'from-green-500 to-emerald-600', trend: '+12%' },
    { label: 'Commandes', value: g.total_commandes, icon: ShoppingCart, color: 'from-blue-500 to-indigo-600', trend: '+8%' },
    { label: 'Clients', value: g.total_clients, icon: Users, color: 'from-purple-500 to-pink-600', trend: '+15%' },
    { label: 'Produits', value: g.total_produits, icon: Package, color: 'from-amber-500 to-orange-600', trend: '+5%' },
    { label: 'Panier Moyen', value: formatPrice(g.panier_moyen), icon: TrendingUp, color: 'from-cyan-500 to-blue-600', trend: '+3%' },
    { label: 'Note Moyenne', value: g.note_moyenne.toFixed(1) + '/5', icon: Star, color: 'from-yellow-500 to-amber-600', trend: '+0.2' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Tableau de bord analytique
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble de votre activitÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â© e-commerce
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
          >
            <option value="7j">7 derniers jours</option>
            <option value="30j">30 derniers jours</option>
            <option value="3m">3 derniers mois</option>
            <option value="12m">12 derniers mois</option>
          </select>
          <Button onClick={fetchStats} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-4 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${kpi.color} opacity-10 rounded-full -translate-y-8 translate-x-8`} />
              <div className="relative">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{kpi.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">{kpi.trend}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus par mois */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â°volution des revenus
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.revenus_par_mois}>
              <defs>
                <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mois" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => formatPrice(Number(value))}
              />
              <Area type="monotone" dataKey="total" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenu)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Commandes par jour */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Commandes (30 derniers jours)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.commandes_par_jour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="jour" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="nombre" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Ventes par catÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©gorie */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ventes par catÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©gorie
          </h3>
          {stats.ventes_par_categorie && stats.ventes_par_categorie.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.ventes_par_categorie}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total_revenu"
                >
                  {stats.ventes_par_categorie.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => formatPrice(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Aucune donnÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©e disponible
            </div>
          )}
        </Card>

        {/* Distribution des notes */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Distribution des avis
          </h3>
          {stats.distribution_notes && stats.distribution_notes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.distribution_notes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis type="category" dataKey="note" stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Aucun avis disponible
            </div>
          )}
        </Card>
      </div>

      {/* Top produits et MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©thodes de paiement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 produits */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Top 10 produits vendus
          </h3>
          {stats.top_produits && stats.top_produits.length > 0 ? (
            <div className="space-y-3">
              {stats.top_produits.map((produit: any, idx: number) => (
                <div key={produit.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-500 text-white' :
                    idx === 1 ? 'bg-gray-400 text-white' :
                    idx === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {produit.nom}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{produit.total_vendu} vendus</span>
                      <span>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢</span>
                      <span>{formatPrice(produit.revenu_total)}</span>
                    </div>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                      style={{ width: `${(produit.total_vendu / stats.top_produits[0].total_vendu) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Aucune vente enregistrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©e
            </div>
          )}
        </Card>

        {/* MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©thodes de paiement */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©thodes de paiement
          </h3>
          {stats.methodes_paiement && stats.methodes_paiement.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.methodes_paiement}
                  cx="50%"
                  cy="50%"
                  label={({ methode, percent }) => `${methode} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {stats.methodes_paiement.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => formatPrice(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Aucune donnÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©e disponible
            </div>
          )}
        </Card>
      </div>

      {/* Statistiques supplÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©mentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Commandes</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">PayÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©es</span>
              <span className="font-semibold text-green-600">{g.commandes_payees}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">En attente</span>
              <span className="font-semibold text-amber-600">{g.commandes_en_attente}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">LivrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©es</span>
              <span className="font-semibold text-blue-600">{g.commandes_livrees}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Stock</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">En stock</span>
              <span className="font-semibold text-green-600">{g.produits_en_stock}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">En rupture</span>
              <span className="font-semibold text-red-600">{g.produits_en_rupture}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{g.total_produits}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Avis clients</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Note moyenne</span>
              <span className="font-semibold text-yellow-600">{g.note_moyenne.toFixed(1)}/5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total avis</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{g.total_avis}</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(g.note_moyenne)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}