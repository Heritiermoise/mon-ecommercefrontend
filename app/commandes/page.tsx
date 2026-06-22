'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Loader2, Eye, CreditCard, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrency } from '@/hooks/useCurrency';

interface Order {
  id: number;
  numero_commande: string;
  montant_total: number;
  frais_livraison: number;
  reduction: number;
  total_final: number;
  statut: string;
  statut_paiement: string;
  methode_paiement: string | null;
  date_creation: string;
  date_paiement: string | null;
  nombre_articles: number;
  articles: any[];
  adresse_livraison: any;
}

export default function CommandesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/connexion?redirect=/commandes');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await ordersAPI.getAll();
      if (response.success) {
        // On filtre pour afficher UNIQUEMENT les commandes NON payées
        const nonPayees = response.data.filter((o: Order) => o.statut_paiement !== 'paye');
        setOrders(nonPayees);
      } else {
        setError(response.message || 'Erreur de chargement');
      }
    } catch (err: any) {
      console.error('Erreur fetchOrders:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const badges: any = {
      en_attente: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'En attente' },
      confirmee: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Confirmée' },
      expediee: { icon: Package, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Expédiée' },
      livree: { icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Livrée' },
      annulee: { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Annulée' },
    };
    const badge = badges[statut] || badges.en_attente;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Mes commandes en attente de paiement
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Finalisez vos achats en effectuant le paiement
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 dark:text-red-100">Erreur</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Aucune commande en attente
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Toutes vos commandes sont payées ou vous n'avez pas encore passé de commande.
          </p>
          <Button onClick={() => router.push('/produits')} size="lg">
            <Package className="w-5 h-5 mr-2" />
            Découvrir nos produits
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {orders.length} commande{orders.length > 1 ? 's' : ''} en attente de paiement
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                Cliquez sur "Payer maintenant" pour finaliser votre achat
              </p>
            </div>
          </div>

          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-white dark:bg-gray-800 border-2 border-yellow-300 dark:border-yellow-700 hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                        Commande #{order.numero_commande}
                      </h3>
                      {getStatusBadge(order.statut)}
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <Clock className="w-3 h-3" />
                        Non payée
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Passée le {order.date_creation} • {order.nombre_articles} article{order.nombre_articles > 1 ? 's' : ''}
                    </p>
                    
                    {/* Liste des articles */}
                    {order.articles && order.articles.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {order.articles.slice(0, 3).map((art: any, i: number) => (
                          <p key={i} className="text-sm text-gray-500 dark:text-gray-500">
                            • {art.produit_nom} × {art.quantite}
                          </p>
                        ))}
                        {order.articles.length > 3 && (
                          <p className="text-xs text-gray-400 italic">
                            + {order.articles.length - 3} autre(s) article(s)
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start lg:items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total à payer</p>
                      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(order.total_final)}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/commandes/${order.numero_commande}`)}
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Détails
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/paiement/${order.numero_commande}`)}
                        className="gap-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <CreditCard className="w-4 h-4" />
                        Payer maintenant
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Sous-total</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(order.montant_total)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Livraison</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(order.frais_livraison)}</p>
                    </div>
                    {order.reduction > 0 && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Réduction</p>
                        <p className="font-semibold text-red-600 dark:text-red-400">-{formatPrice(order.reduction)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total</p>
                      <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{formatPrice(order.total_final)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}