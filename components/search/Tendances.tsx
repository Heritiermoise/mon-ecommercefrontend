'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Flame, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { searchAPI } from '@/lib/search';

interface TendancesProps {
  onSelect?: (terme: string) => void;
}

export default function Tendances({ onSelect }: TendancesProps) {
  const router = useRouter();
  const [tendances, setTendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTendances();
  }, []);

  const fetchTendances = async () => {
    try {
      const response: any = await searchAPI.getTendances();
      if (response.success) {
        setTendances(response.data || []);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (tendances.length === 0) return null;

  const maxRecherches = Math.max(...tendances.map(t => t.nb_recherches), 1);

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
      <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm mb-3">
        <Flame className="w-4 h-4 text-orange-600" />
        Tendances de la semaine
      </h3>

      <div className="space-y-2">
        {tendances.map((item, index) => {
          const percentage = (item.nb_recherches / maxRecherches) * 100;
          return (
            <button
              key={index}
              onClick={() => handleSelect(item.terme)}
              className="w-full text-left group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-orange-500 text-white' :
                  index === 1 ? 'bg-orange-400 text-white' :
                  index === 2 ? 'bg-orange-300 text-white' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {index + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 truncate">
                  {item.terme}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.nb_recherches}
                </span>
              </div>
              <div className="h-1.5 bg-white dark:bg-gray-700 rounded-full overflow-hidden ml-8">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}