'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  fallback?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  priority = false,
  fallback = '/placeholder.png',
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const imageSrc = error || !src ? fallback : src;

  if (fill) {
    return (
      <div className={cn('relative', className)}>
        {!loaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        <Image
          src={imageSrc}
          alt={alt}
          fill={fill}
          className={cn(
            'object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          priority={priority}
          unoptimized={!imageSrc.startsWith('/')}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}