'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Trash2, Search, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { searchAPI } from '@/lib/search';

interface HistoriqueRecherchesProps {
  onSelect?: (terme: string) => void;
}

export default function HistoriqueRecherches({ onSelect }: HistoriqueRecherchesProps) {
  const router = useRouter();
  const [historique, setHistorique] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchHistorique();
  }, []);

  const fetchHistorique = async () => {
    try {
      const response: any = await searchAPI.getHistorique();
      if (response.success) {
        setHistorique(response.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (terme: string) => {
    if (onSelect) {
      onSelect(terme);
    } else {
      router.push(`/recherche?q=${encodeURIComponent(terme)}`);
    }
  };

  const handleSupprimer = async () => {
    if (!confirm('Supprimer tout l historique ?')) return;
    try {
      await searchAPI.supprimerHistorique();
      setHistorique([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (historique.length === 0) return null;

  const displayed = showAll ? historique : historique.slice(0, 5);

  return (
    <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-indigo-600" />
          Mes recherches recentes
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSupprimer}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Effacer
        </Button>
      </div>

      <div className="space-y-1">
        {displayed.map((item, index) => (
          <button
            key={index}
            onClick={() => handleSelect(item.terme)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
              {item.terme}
            </span>
            <span className="text-xs text-gray-400">
              {item.nb_resultats} resultats
            </span>
          </button>
        ))}
      </div>

      {historique.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-2 text-xs text-indigo-600 dark:text-indigo-400"
        >
          {showAll ? 'Voir moins' : `Voir tout (${historique.length})`}
        </Button>
      )}
    </Card>
  );
}