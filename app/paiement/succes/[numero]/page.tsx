'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ordersAPI, maishapayAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';

export default function PaiementSuccesPage() {
  const params = useParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const numero = params.numero as string;
  const [commande, setCommande] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommande();
  }, [numero]);

  const fetchCommande = async () => {
    try {
      const response: any = await ordersAPI.getByNumero(numero);
      if (response.success) {
        setCommande(response.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-14 h-14 text-white" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Paiement reussi !
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Votre commande <span className="font-semibold text-indigo-600">#{numero}</span> a ete confirmee
          </p>

          {commande && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Numero de commande</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{commande.numero_commande}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Montant paye</p>
                  <p className="font-bold text-2xl text-green-600">{formatPrice(commande.total_final)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{commande.date_paiement || commande.date_creation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Statut</p>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Payee
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              📧 Un email de confirmation avec votre facture a ete envoye a votre adresse email.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/commandes')}
              variant="outline"
              className="gap-2"
            >
              <Package className="w-4 h-4" />
              Voir mes commandes
            </Button>
            <Button
              onClick={() => router.push('/produits')}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Continuer mes achats
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}