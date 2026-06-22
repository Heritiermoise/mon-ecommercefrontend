'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Package, Tag, TrendingUp, Loader2, Clock, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { searchAPI } from '@/lib/search';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  showHistorique?: boolean;
  showTendances?: boolean;
}

export default function SearchBar({ 
  className, 
  placeholder = 'Rechercher...',
  showHistorique = true,
  showTendances = true,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [historique, setHistorique] = useState<string[]>([]);
  const [tendances, setTendances] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showHistorique || showTendances) {
      loadInitialData();
    }
  }, [showHistorique, showTendances]);

  const loadInitialData = async () => {
    try {
      if (showHistorique) {
        const histRes: any = await searchAPI.getHistorique();
        if (histRes.success) {
          setHistorique((histRes.data || []).map((h: any) => h.terme).slice(0, 5));
        }
      }
      if (showTendances) {
        const tendRes: any = await searchAPI.getTendances();
        if (tendRes.success) {
          setTendances((tendRes.data || []).map((t: any) => t.terme).slice(0, 5));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const response: any = await searchAPI.autocomplete(query);
          if (response.success) {
            const allResults = [
              ...response.data.produits.map((p: any) => ({ ...p, type: 'produit' })),
              ...response.data.categories.map((c: any) => ({ ...c, type: 'categorie' })),
              ...response.data.marques.map((m: any) => ({ ...m, type: 'marque' })),
            ];
            setResults(allResults.slice(0, 8));
            setSuggestions(response.data.suggestions || []);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setSuggestions([]);
        if (showHistorique || showTendances) {
          setShowDropdown(true);
        } else {
          setShowDropdown(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, showHistorique, showTendances]);

  const handleSelect = (item: any) => {
    if (item.type === 'produit' && item.slug) {
      router.push(`/produits/${item.slug}`);
    } else if (item.type === 'categorie' && item.slug) {
      router.push(`/categories/${item.slug}`);
    } else if (typeof item === 'string') {
      router.push(`/recherche?q=${encodeURIComponent(item)}`);
      setQuery(item);
    } else {
      router.push(`/recherche?q=${encodeURIComponent(item.nom)}`);
    }
    setShowDropdown(false);
    setQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/recherche?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allItems = [...results, ...suggestions];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (selectedIndex >= results.length) {
        e.preventDefault();
        const suggIndex = selectedIndex - results.length;
        handleSelect(suggestions[suggIndex]);
      } else {
        handleSubmit(e);
      }
    }
  };

  const showInitialContent = !query.trim() && (historique.length > 0 || tendances.length > 0);

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10 pr-10 h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setShowDropdown(false); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {/* Resultats autocomplete */}
              {results.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 uppercase">
                    Resultats
                  </p>
                  {results.map((item, index) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                        index === selectedIndex
                          ? 'bg-indigo-50 dark:bg-indigo-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      {item.type === 'produit' && item.image ? (
                        <img src={item.image} alt={item.nom} className="w-10 h-10 object-cover rounded-lg" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          {item.type === 'produit' && <Package className="w-5 h-5 text-gray-400" />}
                          {item.type === 'categorie' && <Tag className="w-5 h-5 text-gray-400" />}
                          {item.type === 'marque' && <TrendingUp className="w-5 h-5 text-gray-400" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.nom}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.type === 'produit' && item.categorie && `Dans ${item.categorie}`}
                          {item.type === 'categorie' && 'Categorie'}
                          {item.type === 'marque' && 'Marque'}
                          {item.type === 'produit' && item.prix && ` - ${item.prix} USD`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Recherches similaires
                  </p>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(suggestion)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                        index + results.length === selectedIndex
                          ? 'bg-indigo-50 dark:bg-indigo-900/30'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      <Search className="w-3 h-3 text-gray-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Contenu initial : historique + tendances */}
              {showInitialContent && results.length === 0 && suggestions.length === 0 && (
                <div className="p-2 space-y-3">
                  {historique.length > 0 && showHistorique && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Mes recherches recentes
                      </p>
                      {historique.map((terme, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelect(terme)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Clock className="w-3 h-3 text-gray-400" />
                          {terme}
                        </button>
                      ))}
                    </div>
                  )}

                  {tendances.length > 0 && showTendances && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 uppercase flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Tendances
                      </p>
                      {tendances.map((terme, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelect(terme)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <span className="w-5 h-5 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          {terme}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {results.length === 0 && suggestions.length === 0 && !showInitialContent && !loading && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">Commencez a taper pour rechercher</p>
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}