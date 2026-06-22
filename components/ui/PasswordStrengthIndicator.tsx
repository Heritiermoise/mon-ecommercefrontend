'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const checks = [
    { label: '8 caracteres minimum', test: password.length >= 8 },
    { label: 'Une majuscule', test: /[A-Z]/.test(password) },
    { label: 'Une minuscule', test: /[a-z]/.test(password) },
    { label: 'Un chiffre', test: /[0-9]/.test(password) },
    { label: 'Un caractere special', test: /[^A-Za-z0-9]/.test(password) },
  ];

  const strength = checks.filter(c => c.test).length;
  const strengthLabel = ['Tres faible', 'Faible', 'Moyen', 'Fort', 'Tres fort'][strength - 1] || 'Tres faible';
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'][strength - 1] || 'bg-red-500';

  return (
    <div className="space-y-3 mt-2">
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Force du mot de passe</span>
          <span className="font-semibold">{strengthLabel}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${strengthColor} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-1.5 text-xs">
            {check.test ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-gray-400" />
            )}
            <span className={check.test ? 'text-gray-700' : 'text-gray-500'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}