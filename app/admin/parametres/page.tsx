'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Save, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { adminAPI } from '@/lib/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    site_nom: 'ShopPro',
    site_description: '',
    site_email_contact: '',
    site_telephone: '',
    devise_principale: 'USD',
    taux_change_usd_cdf: '2800',
    frais_livraison: '9.99',
    livraison_gratuite_seuil: '100',
    points_par_dollar: '1',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response: any = await adminAPI.settings.get();
      if (response.success && response.data) {
        setSettings({ ...settings, ...response.data });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response: any = await adminAPI.settings.update(settings);
      if (response.success) {
        setSuccess('✅ Parametres enregistres avec succes !');
        setTimeout(() => setSuccess(''), 3000);
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Parametres du site</h1>
        <p className="text-sm text-gray-600 mt-1">Configurez les parametres globaux</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3"
        >
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 sm:gap-3"
        >
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-green-700">{success}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Informations generales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label>Nom du site</Label>
              <Input
                value={settings.site_nom}
                onChange={(e) => setSettings({ ...settings, site_nom: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email de contact</Label>
              <Input
                type="email"
                value={settings.site_email_contact}
                onChange={(e) => setSettings({ ...settings, site_email_contact: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Telephone</Label>
              <Input
                value={settings.site_telephone}
                onChange={(e) => setSettings({ ...settings, site_telephone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <textarea
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                className="w-full h-20 px-3 py-2 mt-1 border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 border-2 border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Configuration des devises</h2>
              <p className="text-xs sm:text-sm text-gray-600">Choisissez la devise principale</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm sm:text-base font-semibold">Devise principale *</Label>
              <p className="text-xs text-gray-500 mb-2">Cette devise sera utilisee par defaut</p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, devise_principale: 'USD' })}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    settings.devise_principale === 'USD'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">$ USD</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Dollar americain</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, devise_principale: 'CDF' })}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    settings.devise_principale === 'CDF'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">FC CDF</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Franc congolais</div>
                </button>
              </div>
            </div>

            <div>
              <Label>Taux de change CDF (1 USD = ? FC)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={settings.taux_change_usd_cdf}
                onChange={(e) => setSettings({ ...settings, taux_change_usd_cdf: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Exemple : 100 USD = {(parseFloat(settings.taux_change_usd_cdf || '0') * 100).toLocaleString()} FC
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Livraison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label>Frais de livraison (USD)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={settings.frais_livraison}
                onChange={(e) => setSettings({ ...settings, frais_livraison: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Livraison gratuite a partir de (USD)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={settings.livraison_gratuite_seuil}
                onChange={(e) => setSettings({ ...settings, livraison_gratuite_seuil: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Programme de fidelite</h2>
          <div>
            <Label>Points par dollar depense</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={settings.points_par_dollar}
              onChange={(e) => setSettings({ ...settings, points_par_dollar: e.target.value })}
              className="mt-1"
            />
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button type="submit" disabled={saving} className="gap-2 w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer les parametres
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}