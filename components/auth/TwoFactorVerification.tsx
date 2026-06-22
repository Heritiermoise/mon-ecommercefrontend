'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { authAPI } from '@/lib/api';

interface TwoFactorVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TwoFactorVerification({ onSuccess, onCancel }: TwoFactorVerificationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response: any = await authAPI.verify2FA(code);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Code invalide');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setResendSuccess('');

    try {
      const response: any = await authAPI.resend2FA();
      
      if (response.success) {
        setResendSuccess('Nouveau code envoye par email');
        setTimeout(() => setResendSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-md w-full p-6"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification a deux facteurs</h2>
          <p className="text-sm text-gray-600">
            Un code a 6 chiffres a ete envoye a votre adresse email
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {resendSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2"
          >
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{resendSuccess}</p>
          </motion.div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Code de verification
            </label>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verification...
              </>
            ) : (
              'Verifier'
            )}
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={resendLoading}
              className="flex-1"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Renvoyer'
              )}
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Verifiez votre boite de reception et les spams
        </p>
      </motion.div>
    </div>
  );
}