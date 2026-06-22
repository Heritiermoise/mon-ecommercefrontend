'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaiementEchecPage() {
  const params = useParams();
  const router = useRouter();
  const numero = params.numero as string;

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
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center"
          >
            <XCircle className="w-14 h-14 text-white" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Paiement echoue
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Le paiement de votre commande <span className="font-semibold text-red-600">#{numero}</span> n a pas pu etre effectue
          </p>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">Raisons possibles :</h3>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
              <li>Fonds insuffisants sur votre compte</li>
              <li>Transaction annulee</li>
              <li>Erreur technique temporaire</li>
              <li>Delai de paiement depasse</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 Pas d inquietude ! Votre commande est toujours en attente. Vous pouvez reessayer le paiement quand vous le souhaitez.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push(`/commandes`)}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <RefreshCw className="w-4 h-4" />
              Reessayer le paiement
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Retour a l accueil
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}