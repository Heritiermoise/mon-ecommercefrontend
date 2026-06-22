// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.user && response.token) {
        // Connexion réussie - on stocke l'utilisateur
        login(response.user, response.token);
        
        // 🔥 REDIRECTION SELON LE RÔLE
        if (response.user.role === 'super_administrateur' || response.user.role === 'administrateur') {
          // Admin → Dashboard Admin
          router.push('/admin');
        } else {
          // Client → Dashboard Client
          router.push('/dashboard');
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">
          Adresse email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary/20"
            required
          />
        </div>
      </div>

      {/* Mot de passe */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            Mot de passe
          </Label>
          <Link href="/mot-de-passe-oublie" className="text-sm text-primary hover:underline">
            Oublié ?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-12 border-gray-200 focus:border-primary focus:ring-primary/20"
            required
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

      {/* Se souvenir de moi */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="remember"
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="remember" className="text-sm text-gray-600">
          Se souvenir de moi
        </label>
      </div>

      {/* Bouton */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-semibold text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          'Se connecter'
        )}
      </Button>

      {/* Comptes de démonstration */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500 mb-3">
          Comptes de démonstration (cliquez pour remplir)
        </p>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <button
            type="button"
            onClick={() => { setEmail('admin@shoppro.com'); setPassword('admin123'); }}
            className="p-2 bg-purple-50 hover:bg-purple-100 rounded text-purple-700 transition-colors text-left"
          >
            <strong>🔴 Super Admin :</strong> admin@shoppro.com / admin123
          </button>
          <button
            type="button"
            onClick={() => { setEmail('manager@shoppro.com'); setPassword('manager123'); }}
            className="p-2 bg-pink-50 hover:bg-pink-100 rounded text-pink-700 transition-colors text-left"
          >
            <strong>🟣 Admin :</strong> manager@shoppro.com / manager123
          </button>
          <button
            type="button"
            onClick={() => { setEmail('client@shoppro.com'); setPassword('client123'); }}
            className="p-2 bg-amber-50 hover:bg-amber-100 rounded text-amber-700 transition-colors text-left"
          >
            <strong>🟡 Client :</strong> client@shoppro.com / client123
          </button>
        </div>
      </div>
    </motion.form>
  );
}