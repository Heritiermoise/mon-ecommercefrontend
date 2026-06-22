'use client';

import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { wishlistAPI } from '@/lib/wishlist';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  produitId: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export default function WishlistButton({ 
  produitId, 
  size = 'md', 
  className,
  showLabel = false 
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false);
      return;
    }

    const check = async () => {
      try {
        const response: any = await wishlistAPI.check(produitId);
        if (response.success) {
          setIsInWishlist(response.data.dans_wishlist);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [produitId, isAuthenticated]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/connexion?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.remove(produitId);
        setIsInWishlist(false);
      } else {
        await wishlistAPI.add(produitId);
        setIsInWishlist(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'rounded-full',
          size === 'sm' && 'w-8 h-8',
          size === 'md' && 'w-10 h-10',
          size === 'lg' && 'w-12 h-12',
          className
        )}
        disabled
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  const sizeClasses = {
    sm: { button: 'w-8 h-8', icon: 'w-3.5 h-3.5', label: 'text-xs' },
    md: { button: 'w-10 h-10', icon: 'w-5 h-5', label: 'text-sm' },
    lg: { button: 'w-12 h-12', icon: 'w-6 h-6', label: 'text-base' },
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'rounded-full transition-all relative group',
        sizeClasses[size].button,
        isInWishlist 
          ? 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50' 
          : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm',
        className
      )}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin text-gray-500', sizeClasses[size].icon)} />
      ) : (
        <Heart
          className={cn(
            'transition-all',
            sizeClasses[size].icon,
            isInWishlist
              ? 'fill-red-500 text-red-500 scale-110'
              : 'text-gray-600 dark:text-gray-300 group-hover:text-red-500'
          )}
        />
      )}
      {showLabel && (
        <span className={cn('ml-2 font-medium', sizeClasses[size].label, isInWishlist ? 'text-red-500' : 'text-gray-700 dark:text-gray-300')}>
          {isInWishlist ? 'Dans les favoris' : 'Ajouter aux favoris'}
        </span>
      )}
    </Button>
  );
}