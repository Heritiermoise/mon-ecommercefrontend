'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { settings, loading } = useSiteSettings();

  useEffect(() => {
    // Les paramètres sont chargés et appliqués automatiquement par le hook
    if (!loading) {
      console.log('✅ Paramètres chargés:', settings.devise_principale, settings.taux_change_cdf);
    }
  }, [settings, loading]);

  return <>{children}</>;
}