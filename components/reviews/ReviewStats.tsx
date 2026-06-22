'use client';

import { Star, MessageSquare, Camera, BadgeCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ReviewStatsProps {
  noteMoyenne: number;
  totalAvis: number;
  distribution: Record<number, number>;
  avisVerifies: number;
  avecPhotos: number;
}

export default function ReviewStats({ noteMoyenne, totalAvis, distribution, avisVerifies, avecPhotos }: ReviewStatsProps) {
  const maxCount = Math.max(...Object.values(distribution), 1);

  const getBarColor = (note: number) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    return colors[note - 1] || 'bg-gray-400';
  };

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Note moyenne */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
              {noteMoyenne.toFixed(1)}
            </span>
            <div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-5 h-5',
                      star <= Math.round(noteMoyenne)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Base sur {totalAvis} avis
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <BadgeCheck className="w-4 h-4 text-green-600" />
              <span>{avisVerifies} verifie{avisVerifies > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>{avecPhotos} avec photo{avecPhotos > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((note) => {
            const count = distribution[note] || 0;
            const percentage = totalAvis > 0 ? (count / totalAvis) * 100 : 0;
            return (
              <div key={note} className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-12 flex items-center gap-1">
                  {note} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', getBarColor(note))}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}