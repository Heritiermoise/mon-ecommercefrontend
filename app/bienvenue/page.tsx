// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';

export default function BienvenuePage() {
  const router = useRouter();
  const { user, firstLogin, setFirstLoginDone } = useAuthStore();

  useEffect(() => {
    if (!firstLogin) {
      router.push(user?.role === 'client' ? '/dashboard' : '/admin');
    }
  }, [firstLogin, router, user]);

  const handleContinue = () => {
    setFirstLoginDone();
    router.push(user?.role === 'client' ? '/dashboard' : '/admin');
  };

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {user.nom} !
          </h1>
          <p className="text-gray-600 mb-8">
            Votre compte a Ã©tÃ© crÃ©Ã© avec succÃ¨s
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-primary" />
              <div className="text-left flex-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <div className="text-left flex-1">
                <p className="text-xs text-gray-500">RÃ´le</p>
                <p className="font-medium text-gray-900 capitalize">
                  {user.role === 'super_administrateur' ? 'Super Administrateur' : 
                   user.role === 'administrateur' ? 'Administrateur' : 'Client'}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-semibold text-base"
          >
            Continuer
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}