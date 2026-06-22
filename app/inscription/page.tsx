'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI, adminRegistrationAPI } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [adminRegistrationAvailable, setAdminRegistrationAvailable] = useState(false);
  const [checking, setChecking] = useState(true);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<'client' | 'administrateur' | 'super_administrateur'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    adminRegistrationAPI.check()
      .then((data: any) => {
        setAdminRegistrationAvailable(data.available === true);
        if (!data.available) {
          setRole('client');
        }
      })
      .catch(() => setAdminRegistrationAvailable(false))
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      if (role === 'client') {
        const response: any = await authAPI.register({
          nom,
          email,
          telephone,
          mot_de_passe: password,
          mot_de_passe_confirmation: passwordConfirm,
        });

        if (response.success && response.token) {
          login(response.user, response.token);
          setSuccess('Inscription reussie ! Redirection...');
          setTimeout(() => router.push('/dashboard'), 1500);
        } else {
          setError(response.message || 'Erreur lors de l inscription');
        }
      } else {
        if (!adminRegistrationAvailable) {
          setError('Inscription admin fermee');
          setIsLoading(false);
          return;
        }

        const response: any = await adminRegistrationAPI.register({
          nom,
          email,
          telephone,
          mot_de_passe: password,
          mot_de_passe_confirmation: passwordConfirm,
          role,
        });

        if (response.success) {
          setSuccess('Inscription admin reussie ! Redirection vers la connexion...');
          setTimeout(() => router.push('/connexion'), 2000);
        } else {
          setError(response.message || 'Erreur lors de l inscription');
        }
      }
    } catch (err: any) {
      console.error('Erreur inscription:', err);
      setError(err.message || 'Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Creer un compte</h1>
          <p className="text-gray-600">Rejoignez ShopPro des aujourd hui</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {adminRegistrationAvailable && (
            <div className="space-y-2">
              <Label>Type de compte</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    role === 'client' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Client</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('administrateur')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    role === 'administrateur' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Shield className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('super_administrateur')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    role === 'super_administrateur' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Shield className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">Super Admin</span>
                </button>
              </div>
            </div>
          )}

          {!adminRegistrationAvailable && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                Inscription client uniquement
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nom">Nom complet</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="nom"
                type="text"
                placeholder="Jean Dupont"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Telephone (optionnel)</Label>
            <Input
              id="telephone"
              type="tel"
              placeholder="+243 000 000 000"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe (min. 8 caracteres)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Confirmer le mot de passe</Label>
            <Input
              id="passwordConfirm"
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="h-12"
              required
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-semibold text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Inscription en cours...
              </>
            ) : (
              "S'inscrire"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Deja un compte ?{' '}
            <Link href="/connexion" className="text-indigo-600 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}