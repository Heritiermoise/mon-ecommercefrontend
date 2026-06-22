'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { maishapayAPI } from '@/lib/api';

export default function PaiementRetourPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const numero = params.numero as string;
  const [status, setStatus] = useState<'checking' | 'success' | 'failed'>('checking');

  useEffect(() => {
    const verifierPaiement = async () => {
      try {
        // Recuperer les parametres de retour MaishaPay
        const maishaStatus = searchParams.get('status');
        const description = searchParams.get('description');

        // Si MaishaPay indique succes direct
        if (maishaStatus === '202' || description === 'Accepted') {
          setStatus('success');
          setTimeout(() => router.push(`/paiement/succes/${numero}`), 1500);
          return;
        }

        // Sinon verifier via l API
        const response: any = await maishapayAPI.verifier(numero);
        
        if (response.success && response.data.statut === 'paye') {
          setStatus('success');
          setTimeout(() => router.push(`/paiement/succes/${numero}`), 1500);
        } else if (response.success && response.data.statut === 'echoue') {
          setStatus('failed');
          setTimeout(() => router.push(`/paiement/echec/${numero}`), 1500);
        } else {
          // En attente - verifier a nouveau dans 3 secondes
          setTimeout(verifierPaiement, 3000);
        }
      } catch (error) {
        console.error('Erreur verification:', error);
        setStatus('failed');
        setTimeout(() => router.push(`/paiement/echec/${numero}`), 1500);
      }
    };

    verifierPaiement();
  }, [numero, router, searchParams]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Verification du paiement...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Commande #{numero}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Veuillez patienter pendant que nous confirmons votre paiement
        </p>
      </div>
    </div>
  );
}