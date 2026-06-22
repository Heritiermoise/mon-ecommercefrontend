// components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';

export default function RegisterForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Validation du mot de passe
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas les critères de sécurité');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        nom,
        email,
        telephone,
        mot_de_passe: password,
      });
      
      if (response.success && response.user && response.token) {
        login(response.user, response.token);
        router.push('/');
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
      className="space-y-4"
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

      {/* Nom complet */}
      <div className="space-y-2">
        <Label htmlFor="nom" className="text-gray-700 font-medium">
          Nom complet
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="nom"
            type="text"
            placeholder="Jean Dupont"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary/20"
            required
          />
        </div>
      </div>

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

      {/* Téléphone */}
      <div className="space-y-2">
        <Label htmlFor="telephone" className="text-gray-700 font-medium">
          Téléphone <span className="text-gray-400 text-sm">(optionnel)</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="telephone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Mot de passe */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700 font-medium">
          Mot de passe
        </Label>
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

        {/* Indicateurs de force du mot de passe */}
        {password.length > 0 && (
          <div className="space-y-1 pt-1">
            <PasswordCheck label="Au moins 8 caractères" isValid={passwordChecks.length} />
            <PasswordCheck label="Une lettre majuscule" isValid={passwordChecks.uppercase} />
            <PasswordCheck label="Une lettre minuscule" isValid={passwordChecks.lowercase} />
            <PasswordCheck label="Un chiffre" isValid={passwordChecks.number} />
          </div>
        )}
      </div>

      {/* Confirmation mot de passe */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
          Confirmer le mot de passe
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`pl-10 h-12 border-gray-200 focus:border-primary focus:ring-primary/20 ${
              confirmPassword.length > 0 && !doPasswordsMatch ? 'border-red-300' : ''
            }`}
            required
          />
          {doPasswordsMatch && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="flex items-start gap-2 pt-2">
        <input
          type="checkbox"
          id="terms"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="terms" className="text-sm text-gray-600">
          J'accepte les{' '}
          <Link href="/cgv" className="text-primary hover:underline">
            conditions d'utilisation
          </Link>{' '}
          et la{' '}
          <Link href="/confidentialite" className="text-primary hover:underline">
            politique de confidentialité
          </Link>
        </label>
      </div>

      {/* Bouton */}
      <Button
        type="submit"
        disabled={isLoading || !isPasswordValid || !doPasswordsMatch || !acceptTerms}
        className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-semibold text-base disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Création du compte...
          </>
        ) : (
          'Créer mon compte'
        )}
      </Button>
    </motion.form>
  );
}

// Composant helper pour les checks du mot de passe
function PasswordCheck({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors ${
      isValid ? 'text-green-600' : 'text-gray-400'
    }`}>
      <CheckCircle2 className={`w-3 h-3 ${isValid ? 'text-green-500' : 'text-gray-300'}`} />
      <span>{label}</span>
    </div>
  );
}