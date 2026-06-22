'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showLabel?: boolean;
  className?: string;
}

const labels = ['', 'Tres faible', 'Faible', 'Moyen', 'Bien', 'Excellent'];
const colors = ['text-gray-300', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-green-500'];

export default function StarRating({ value = 0, onChange, size = 'md', readonly = false, showLabel = false, className }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const displayValue = hoverValue || value;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            className={cn(
              'transition-all duration-150',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
              !readonly && 'focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                star <= displayValue
                  ? colors[displayValue] + ' fill-current'
                  : 'text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        ))}
      </div>
      {showLabel && displayValue > 0 && (
        <span className={cn('text-sm font-medium ml-2', colors[displayValue])}>
          {labels[displayValue]}
        </span>
      )}
    </div>
  );
}