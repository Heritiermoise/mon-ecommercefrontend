'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { maishapayAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';

export default function PaiementPage() {
  const params = useParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const numero = params.numero as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    initPayment();
  }, [numero]);

  const initPayment = async () => {
    try {
      setLoading(true);
      const response: any = await maishapayAPI.initier(numero);
      
      if (response.success) {
        setPaymentData(response.data);
      } else {
        setError(response.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (!paymentData) return;

    setRedirecting(true);

    // Creer un formulaire HTML et le soumettre vers MaishaPay
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentData.checkout_url;

    const fields = {
      gatewayMode: paymentData.gatewayMode,
      publicApiKey: paymentData.publicApiKey,
      secretApiKey: paymentData.secretApiKey,
      montant: paymentData.montant,
      devise: paymentData.devise,
      callbackUrl: paymentData.callbackUrl,
    };

    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value as string;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Erreur</h2>
              <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
              <Button onClick={() => router.push('/commandes')} className="mt-4">
                Retour aux commandes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Aucune donnee de paiement</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Paiement securise
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Commande {paymentData.commande.numero_commande}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Montant a payer</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatPrice(paymentData.commande.montant)}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Devise</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {paymentData.devise}
            </span>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Mode</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {paymentData.gatewayMode === 0 ? 'Test (Sandbox)' : 'Production'}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Vous allez etre redirige vers MaishaPay pour effectuer le paiement de maniere securisee.
            Apres le paiement, vous serez automatiquement redirige vers cette page.
          </p>
        </div>

        <Button
          onClick={handlePay}
          disabled={redirecting}
          className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
        >
          {redirecting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirection en cours...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Payer {formatPrice(paymentData.commande.montant)} {paymentData.devise}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
          Paiement securise par MaishaPay
        </p>
      </Card>
    </div>
  );
}