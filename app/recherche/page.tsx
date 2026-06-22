'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  SlidersHorizontal, Grid3X3, List, 
  Loader2, Package, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCurrency } from '@/hooks/useCurrency';
import { searchAPI } from '@/lib/search';
import SearchBar from '@/components/search/SearchBar';
import FilterSidebar from '@/components/search/FilterSidebar';
import HistoriqueRecherches from '@/components/search/HistoriqueRecherches';
import Tendances from '@/components/search/Tendances';
import RecemmentVus from '@/components/search/RecemmentVus';

function RechercheContent() {
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [produits, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [facettes, setFacettes] = useState<any>(null);

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedMarques, setSelectedMarques] = useState<number[]>([]);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [prixMin, setPrixMin] = useState(0);
  const [prixMax, setPrixMax] = useState(0);
  const [enPromo, setEnPromo] = useState(false);
  const [enStock, setEnStock] = useState(false);
  const [tri, setTri] = useState('pertinence');
  const [currentPage, setCurrentPage] = useState(1);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setCurrentPage(1);
    fetchResults(q, 1);
  }, [searchParams]);

  const fetchResults = async (searchQuery: string, page: number) => {
    setLoading(true);
    try {
      const params: any = {
        q: searchQuery,
        page,
        tri,
      };

      if (selectedCategories.length > 0) params.categorie_id = selectedCategories;
      if (selectedMarques.length > 0) params.marque_id = selectedMarques;
      if (selectedNote) params.note_min = selectedNote;
      if (prixMin > 0) params.prix_min = prixMin;
      if (prixMax > 0) params.prix_max = prixMax;
      if (enPromo) params.en_promo = true;
      if (enStock) params.en_stock = true;

      const response: any = await searchAPI.search(params);
      if (response.success) {
        setProduits(response.data.produits || []);
        setPagination(response.data.pagination);
        setFacettes(response.data.facettes);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query || selectedCategories.length > 0 || selectedMarques.length > 0 || selectedNote || enPromo || enStock) {
      fetchResults(query, currentPage);
    }
  }, [currentPage, selectedCategories, selectedMarques, selectedNote, prixMin, prixMax, enPromo, enStock, tri]);

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedMarques([]);
    setSelectedNote(null);
    setPrixMin(0);
    setPrixMax(facettes?.prix?.max || 0);
    setEnPromo(false);
    setEnStock(false);
    setCurrentPage(1);
  };

  const isSearchActive = query || selectedCategories.length > 0 || selectedMarques.length > 0 || selectedNote || enPromo || enStock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Recherche
        </h1>
        <SearchBar
          className="max-w-2xl"
          placeholder="Rechercher un produit, une categorie, une marque..."
          showHistorique={true}
          showTendances={true}
        />
      </div>

      {/* Sidebar avec historique et tendances - visible quand pas de recherche */}
      {!isSearchActive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HistoriqueRecherches />
          <Tendances />
        </div>
      )}

      {/* Stats */}
      {pagination && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {pagination.total} resultat{pagination.total > 1 ? 's' : ''} trouve{pagination.total > 1 ? 's' : ''}
            {query && ` pour "${query}"`}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={tri}
              onChange={(e) => setTri(e.target.value)}
              className="h-9 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="pertinence">Pertinence</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix decroissant</option>
              <option value="note">Meilleures notes</option>
              <option value="nouveautes">Nouveautes</option>
              <option value="popularite">Popularite</option>
              <option value="promo">Promotions</option>
            </select>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-white dark:bg-gray-700'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-white dark:bg-gray-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout principal */}
      {isSearchActive && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar filtres - Desktop */}
          <div className="hidden lg:block">
            <FilterSidebar
              categories={facettes?.categories || []}
              marques={facettes?.marques || []}
              prixRange={facettes?.prix}
              selectedCategories={selectedCategories}
              selectedMarques={selectedMarques}
              selectedNote={selectedNote}
              prixMin={prixMin}
              prixMax={prixMax}
              enPromo={enPromo}
              enStock={enStock}
              onCategoryChange={setSelectedCategories}
              onMarqueChange={setSelectedMarques}
              onNoteChange={setSelectedNote}
              onPrixChange={(min, max) => { setPrixMin(min); setPrixMax(max); }}
              onPromoChange={setEnPromo}
              onStockChange={setEnStock}
              onReset={handleReset}
            />
          </div>

          {/* Bouton filtres mobile */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(true)}
              className="w-full gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
            </Button>
          </div>

          {/* Modal filtres mobile */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-800 overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                  <h2 className="font-bold text-lg">Filtres</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="p-4">
                  <FilterSidebar
                    categories={facettes?.categories || []}
                    marques={facettes?.marques || []}
                    prixRange={facettes?.prix}
                    selectedCategories={selectedCategories}
                    selectedMarques={selectedMarques}
                    selectedNote={selectedNote}
                    prixMin={prixMin}
                    prixMax={prixMax}
                    enPromo={enPromo}
                    enStock={enStock}
                    onCategoryChange={setSelectedCategories}
                    onMarqueChange={setSelectedMarques}
                    onNoteChange={setSelectedNote}
                    onPrixChange={(min, max) => { setPrixMin(min); setPrixMax(max); }}
                    onPromoChange={setEnPromo}
                    onStockChange={setEnStock}
                    onReset={handleReset}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Resultats */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
              </div>
            ) : produits.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Aucun produit trouve</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
              </Card>
            ) : (
              <>
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'space-y-4'
                }>
                  {produits.map((produit, index) => (
                    <motion.div
                      key={produit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <a href={`/produits/${produit.slug}`}>
                        <Card className={`overflow-hidden hover:shadow-xl transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                          viewMode === 'list' ? 'flex gap-4' : ''
                        }`}>
                          <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 ${
                            viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'
                          }`}>
                            {produit.image_principale ? (
                              <img
                                src={produit.image_principale}
                                alt={produit.nom}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                              </div>
                            )}
                            {produit.en_promo && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                -{produit.pourcentage_reduction}%
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                              {produit.nom}
                            </h3>
                            {produit.note_moyenne > 0 && (
                              <div className="flex items-center gap-1 mb-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-3 h-3 ${
                                        star <= Math.round(produit.note_moyenne)
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-300 dark:text-gray-600'
                                      }`}
                                    >
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">({produit.nombre_avis})</span>
                              </div>
                            )}
                            <div className="flex items-baseline gap-2">
                              {produit.en_promo && produit.prix_remise ? (
                                <>
                                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                    {formatPrice(produit.prix_remise)}
                                  </span>
                                  <span className="text-sm text-gray-400 line-through">
                                    {formatPrice(produit.prix)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                  {formatPrice(produit.prix)}
                                </span>
                              )}
                            </div>
                            {produit.categorie && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {produit.categorie.nom}
                                {produit.marque && ` • ${produit.marque.nom}`}
                              </p>
                            )}
                          </div>
                        </Card>
                      </a>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Precedent
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
                      Page {currentPage} / {pagination.last_page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                      disabled={currentPage === pagination.last_page}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Recemment vus - toujours visible */}
      <RecemmentVus />
    </div>
  );
}

export default function RecherchePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    }>
      <RechercheContent />
    </Suspense>
  );
}