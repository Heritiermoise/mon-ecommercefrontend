'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Search, Loader2, Eye, 
  CheckCircle, Clock, XCircle, Truck, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { adminAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';

interface Order {
  id: number;
  numero_commande: string;
  utilisateur: {
    id: number;
    nom: string;
    email: string;
    telephone?: string;
  } | null;
  montant_total: number;
  frais_livraison: number;
  reduction: number;
  total_final: number;
  statut: string;
  statut_paiement: string;
  methode_paiement?: string;
  nombre_articles: number;
  date_creation: string;
  date_paiement?: string;
}

const statutConfig: Record<string, { label: string; color: string; icon: any }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  payee: { label: 'Payee', color: 'bg-blue-100 text-blue-700', icon: CreditCard },
  confirmee: { label: 'Confirmee', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
  en_cours_de_traitement: { label: 'En traitement', color: 'bg-purple-100 text-purple-700', icon: Package },
  expediee: { label: 'Expediee', color: 'bg-cyan-100 text-cyan-700', icon: Truck },
  livree: { label: 'Livree', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  annulee: { label: 'Annulee', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterPaiement, setFilterPaiement] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');
  const { formatPrice } = useCurrency();

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (filterStatut) params.statut = filterStatut;
      if (filterPaiement) params.statut_paiement = filterPaiement;
      if (search) params.search = search;

      const response: any = await adminAPI.orders.getAll(params);
      
      // Verification que la reponse contient bien un tableau
      if (response && response.success) {
        // Gerer les differentes structures de reponse possibles
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setOrders(response.data.data);
        } else {
          setOrders([]);
        }
      } else {
        setOrders([]);
        setError('Impossible de charger les commandes');
      }
    } catch (err: any) {
      console.error('Erreur chargement commandes:', err);
      setError(err.message || 'Erreur de chargement');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatut, filterPaiement]);

  const handleChangeStatus = async (orderId: number, newStatut: string) => {
    setUpdating(orderId);
    try {
      const response: any = await adminAPI.orders.changeStatus(orderId, newStatut);
      if (response && response.success) {
        await fetchOrders();
        setSelectedOrder(null);
      }
    } catch (err: any) {
      console.error('Erreur changement statut:', err);
    } finally {
      setUpdating(null);
    }
  };

  // Filtrage securise avec verification que orders est un tableau
  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      order.numero_commande?.toLowerCase().includes(searchLower) ||
      order.utilisateur?.nom?.toLowerCase().includes(searchLower) ||
      order.utilisateur?.email?.toLowerCase().includes(searchLower)
    );
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Gestion des commandes</h1>
        <p className="text-gray-600 mt-1">{Array.isArray(orders) ? orders.length : 0} commande(s)</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statutConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={filterPaiement}
            onChange={(e) => setFilterPaiement(e.target.value)}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tous les paiements</option>
            <option value="non_paye">Non paye</option>
            <option value="paye">Paye</option>
          </select>
        </div>
      </Card>

      {!Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucune commande trouvee</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const config = statutConfig[order.statut] || statutConfig.en_attente;
            const Icon = config.icon;
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-mono font-bold text-gray-900">{order.numero_commande}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color} flex items-center gap-1`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                        {order.statut_paiement === 'paye' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Paye
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            Non paye
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Client: <strong>{order.utilisateur?.nom || 'N/A'}</strong> ({order.utilisateur?.email || 'N/A'})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.date_creation} - {order.nombre_articles} article(s)
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{formatPrice(order.total_final)}</p>
                      {order.methode_paiement && (
                        <p className="text-xs text-gray-500">{order.methode_paiement}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Commande {selectedOrder.numero_commande}</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-semibold">{selectedOrder.utilisateur?.nom || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.utilisateur?.email || 'N/A'}</p>
                    {selectedOrder.utilisateur?.telephone && (
                      <p className="text-sm text-gray-500">{selectedOrder.utilisateur.telephone}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Montant total</p>
                    <p className="text-2xl font-bold text-indigo-600">{formatPrice(selectedOrder.total_final)}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.date_creation}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Changer le statut</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(statutConfig).map(([key, config]) => (
                      <Button
                        key={key}
                        variant={selectedOrder.statut === key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleChangeStatus(selectedOrder.id, key)}
                        disabled={updating === selectedOrder.id}
                        className={selectedOrder.statut === key ? config.color : ''}
                      >
                        {updating === selectedOrder.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <config.icon className="w-4 h-4 mr-1" />
                        )}
                        {config.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}