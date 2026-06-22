'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, History, Loader2, 
  AlertCircle, CheckCircle, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { adminAPI } from '@/lib/api';

export default function TauxChangePage() {
  const [tauxActif, setTauxActif] = useState<number>(2800);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaux, setNewTaux] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actifRes, historyRes]: any = await Promise.all([
        adminAPI.tauxChange.getActif(),
        adminAPI.tauxChange.history ? adminAPI.tauxChange.history() : Promise.resolve({ success: true, data: [] }),
      ]);

      if (actifRes.success) {
        setTauxActif(actifRes.data.taux);
      }

      if (historyRes.success) {
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaux || parseFloat(newTaux) <= 0) {
      setError('Veuillez entrer un taux valide');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response: any = await adminAPI.tauxChange.update(
        parseFloat(newTaux),
        note || undefined
      );

      if (response.success) {
        setSuccess('✅ Taux mis a jour avec succes !');
        setNewTaux('');
        setNote('');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Taux de change</h1>
        <p className="text-sm text-gray-600 mt-1">Gerez le taux USD/CDF</p>
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

      <Card className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Taux actuel</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600 break-words">
              1 USD = {tauxActif.toLocaleString('fr-FR')} FC
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-white rounded-full shadow-lg flex-shrink-0">
            <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          Mettre a jour le taux
        </h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <Label>Nouveau taux (1 USD = ? FC) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={newTaux}
              onChange={(e) => setNewTaux(e.target.value)}
              placeholder="2800.00"
              required
              className="mt-1"
            />
            {newTaux && (
              <p className="text-xs text-gray-500 mt-1">
                Apercu : 100 USD = {(parseFloat(newTaux) * 100).toLocaleString('fr-FR')} FC
              </p>
            )}
          </div>

          <div>
            <Label>Note (optionnel)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Raison du changement..."
              className="mt-1"
            />
          </div>

          <Button 
            type="submit" 
            disabled={saving}
            className="w-full sm:w-auto gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Mettre a jour
              </>
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          Historique
        </h2>

        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">Aucun historique</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 sm:p-4 rounded-lg border-2 ${
                  item.est_actif 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">
                        {parseFloat(item.taux).toLocaleString('fr-FR')} FC
                      </span>
                      {item.est_actif && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                          Actif
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {new Date(item.date_application).toLocaleString('fr-FR')}
                    </p>
                    {item.note && (
                      <p className="text-xs text-gray-500 mt-1 italic">{item.note}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}