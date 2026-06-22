// components/admin/RecentOrders.tsx
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

const recentOrders = [
  {
    id: '#CMD-001',
    customer: 'Jean Dupont',
    amount: '€299.99',
    status: 'payee',
    date: 'Il y a 2h',
  },
  {
    id: '#CMD-002',
    customer: 'Marie Martin',
    amount: '€149.50',
    status: 'en_cours_de_traitement',
    date: 'Il y a 5h',
  },
  {
    id: '#CMD-003',
    customer: 'Pierre Durand',
    amount: '€599.00',
    status: 'expediee',
    date: 'Il y a 1j',
  },
  {
    id: '#CMD-004',
    customer: 'Sophie Bernard',
    amount: '€89.99',
    status: 'livree',
    date: 'Il y a 2j',
  },
];

const statusColors: Record<string, string> = {
  en_attente: 'bg-gray-100 text-gray-700',
  payee: 'bg-green-100 text-green-700',
  confirmee: 'bg-blue-100 text-blue-700',
  en_cours_de_traitement: 'bg-yellow-100 text-yellow-700',
  expediee: 'bg-purple-100 text-purple-700',
  livree: 'bg-emerald-100 text-emerald-700',
  annulee: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  en_attente: 'En attente',
  payee: 'Payée',
  confirmee: 'Confirmée',
  en_cours_de_traitement: 'En cours',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée',
};

export default function RecentOrders() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Commandes récentes</h3>
        </div>
        <button className="text-sm text-primary hover:underline">
          Voir tout
        </button>
      </div>

      <div className="space-y-4">
        {recentOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                {order.customer.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{order.customer}</p>
                <p className="text-sm text-gray-500">{order.id}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{order.amount}</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}