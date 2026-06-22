import { useState, useEffect } from 'react';
import { updateCdfRate, setCurrency, getCurrentCurrency, CurrencyCode } from '@/lib/currency';

interface SiteSettings {
  site_nom: string;
  site_description: string;
  site_email_contact: string;
  site_telephone: string;
  devise_principale: 'USD' | 'CDF';
  taux_change_cdf: number;
  frais_livraison: number;
  livraison_gratuite_seuil: number;
  points_par_euro: number;
}

const defaultSettings: SiteSettings = {
  site_nom: 'ShopPro',
  site_description: 'La meilleure boutique en ligne',
  site_email_contact: 'contact@shoppro.com',
  site_telephone: '+243 000 000 000',
  devise_principale: 'USD',
  taux_change_cdf: 2800,
  frais_livraison: 9.99,
  livraison_gratuite_seuil: 100,
  points_par_euro: 1,
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/settings', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const newSettings = {
              ...defaultSettings,
              ...data.data,
              taux_change_cdf: parseFloat(data.data.taux_change_cdf) || 2800,
              frais_livraison: parseFloat(data.data.frais_livraison) || 9.99,
              livraison_gratuite_seuil: parseFloat(data.data.livraison_gratuite_seuil) || 100,
              points_par_euro: parseFloat(data.data.points_par_euro) || 1,
            };
            
            setSettings(newSettings);

            // Mettre Ã  jour le taux de change CDF
            updateCdfRate(newSettings.taux_change_cdf);

            // Si l'utilisateur n'a pas encore choisi de devise, utiliser celle des paramÃ¨tres
            const currentCurrency = getCurrentCurrency();
            if (!currentCurrency || currentCurrency === 'USD') {
              setCurrency(newSettings.devise_principale);
            }
          }
        }
      } catch (error) {
        console.error('Erreur chargement paramÃ¨tres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
}