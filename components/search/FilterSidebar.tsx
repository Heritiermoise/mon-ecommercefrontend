'use client';

import { useState } from 'react';
import { Filter, X, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  categories?: Array<{ id: number; nom: string; count: number }>;
  marques?: Array<{ id: number; nom: string; count: number }>;
  prixRange?: { min: number; max: number };
  selectedCategories: number[];
  selectedMarques: number[];
  selectedNote: number | null;
  prixMin: number;
  prixMax: number;
  enPromo: boolean;
  enStock: boolean;
  onCategoryChange: (ids: number[]) => void;
  onMarqueChange: (ids: number[]) => void;
  onNoteChange: (note: number | null) => void;
  onPrixChange: (min: number, max: number) => void;
  onPromoChange: (value: boolean) => void;
  onStockChange: (value: boolean) => void;
  onReset: () => void;
}

export default function FilterSidebar({
  categories = [],
  marques = [],
  prixRange,
  selectedCategories,
  selectedMarques,
  selectedNote,
  prixMin,
  prixMax,
  enPromo,
  enStock,
  onCategoryChange,
  onMarqueChange,
  onNoteChange,
  onPrixChange,
  onPromoChange,
  onStockChange,
  onReset,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    marques: true,
    prix: true,
    note: true,
    autres: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryToggle = (id: number) => {
    if (selectedCategories.includes(id)) {
      onCategoryChange(selectedCategories.filter(catId => catId !== id));
    } else {
      onCategoryChange([...selectedCategories, id]);
    }
  };

  const handleMarqueToggle = (id: number) => {
    if (selectedMarques.includes(id)) {
      onMarqueChange(selectedMarques.filter(marqueId => marqueId !== id));
    } else {
      onMarqueChange([...selectedMarques, id]);
    }
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
    selectedMarques.length > 0 || 
    selectedNote !== null || 
    enPromo || 
    enStock ||
    prixMin > (prixRange?.min || 0) || 
    prixMax < (prixRange?.max || 0);

  return (
    <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtres
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
            <X className="w-3 h-3 mr-1" />
            Reinitialiser
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
          Categories
          {expandedSections.categories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                  className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{cat.nom}</span>
                <span className="text-xs text-gray-500">({cat.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Marques */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('marques')}
          className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
          Marques
          {expandedSections.marques ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.marques && (
          <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
            {marques.map((marque) => (
              <label key={marque.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMarques.includes(marque.id)}
                  onChange={() => handleMarqueToggle(marque.id)}
                  className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{marque.nom}</span>
                <span className="text-xs text-gray-500">({marque.count})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Prix */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('prix')}
          className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
          Prix
          {expandedSections.prix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.prix && (
          <div className="mt-2 space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Min</Label>
                <Input
                  type="number"
                  value={prixMin}
                  onChange={(e) => onPrixChange(Number(e.target.value), prixMax)}
                  min={prixRange?.min || 0}
                  max={prixMax}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Max</Label>
                <Input
                  type="number"
                  value={prixMax}
                  onChange={(e) => onPrixChange(prixMin, Number(e.target.value))}
                  min={prixMin}
                  max={prixRange?.max || 0}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('note')}
          className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
          Note minimale
          {expandedSections.note ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.note && (
          <div className="mt-2 space-y-1">
            {[4, 3, 2, 1].map((note) => (
              <button
                key={note}
                onClick={() => onNoteChange(selectedNote === note ? null : note)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  selectedNote === note
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                )}
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'w-4 h-4',
                        star <= note
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      )}
                    />
                  ))}
                </div>
                <span>& up</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Autres filtres */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('autres')}
          className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-900 dark:text-gray-100"
        >
          Autres
          {expandedSections.autres ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.autres && (
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enPromo}
                onChange={(e) => onPromoChange(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">En promotion</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enStock}
                onChange={(e) => onStockChange(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">En stock</span>
            </label>
          </div>
        )}
      </div>
    </Card>
  );
}