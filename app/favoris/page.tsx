'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, ShoppingCart, Share2, Bell, Filter, 
  Loader2, Package, CheckCircle, AlertCircle, 
  Copy, Link as LinkIcon, X, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useCurrency } from '@/hooks/useCurrency';
import { wishlistAPI } from '@/lib/wishlist';
import WishlistCard from '@/components/wishlist/WishlistCard';

export default function FavorisPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { formatPrice } = useCurrency();

  const [items, setItems] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareNom, setShareNom] = useState('Ma wishlist');
  const [shareExpiration, setShareExpiration] = useState<number | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      router.push('/connexion?redirect=/favoris');
      return;
    }

    setLoading(true);
    try {
      const response: any = await wishlistAPI.getAll(selectedCollection || undefined);
      if (response.success) {
        setItems(response.data.items || []);
        setCollections(response.data.collections || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated, selectedCollection]);

  const handleTransfererTout = async () => {
    if (items.length === 0) return;
    if (!confirm(`Transferer ${items.length} produit(s) au panier ?`)) return;

    try {
      const response: any = await wishlistAPI.transfererAuPanier();
      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => setSuccess(''), 3000);
        if (response.transferes?.length > 0) {
          router.push('/panier');
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePartager = async () => {
    setShareLoading(true);
    try {
      const response: any = await wishlistAPI.partager(shareNom, shareExpiration);
      if (response.success) {
        setShareUrl(response.url);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopierLien = () => {
    navigator.clipboard.writeText(shareUrl);
    setSuccess('Lien copie dans le presse-papier !');
    setTimeout(() => setSuccess(''), 3000);
  };

  const filteredItems = items
    .filter(item => !search || item.nom.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'prix_asc': return (a.prix_remise || a.prix) - (b.prix_remise || b.prix);
        case 'prix_desc': return (b.prix_remise || b.prix) - (a.prix_remise || a.prix);
        case 'nom': return a.nom.localeCompare(b.nom);
        default: return 0;
      }
    });

  const totalValeur = items.reduce((sum, item) => {
    const prix = item.prix_remise || item.prix;
    return sum + prix;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            Mes favoris
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {items.length} produit{items.length > 1 ? 's' : ''} • Valeur totale : {formatPrice(totalValeur)}
          </p>
        </div>
        <div className="flex gap-2">
          {items.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowShareModal(true)}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Partager</span>
              </Button>
              <Button
                onClick={handleTransfererTout}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Tout au panier</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2"
          >
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collections */}
      {collections.length > 1 && (
        <Card className="p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Tag className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <button
              onClick={() => setSelectedCollection('')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                !selectedCollection
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tous ({items.length})
            </button>
            {collections.map((col) => (
              <button
                key={col.nom_collection}
                onClick={() => setSelectedCollection(col.nom_collection)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCollection === col.nom_collection
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {col.nom_collection} ({col.nb_produits})
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Filtres */}
      {items.length > 0 && (
        <Card className="p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher dans mes favoris..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
            >
              <option value="recent">Plus recents</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix decroissant</option>
              <option value="nom">Nom A-Z</option>
            </select>
          </div>
        </Card>
      )}

      {/* Liste */}
      {filteredItems.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {items.length === 0 ? 'Vos favoris sont vides' : 'Aucun resultat'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {items.length === 0 
              ? 'Explorez notre boutique et ajoutez vos produits preferes'
              : 'Essayez une autre recherche'}
          </p>
          {items.length === 0 && (
            <Button onClick={() => router.push('/produits')}>
              Decouvrir la boutique
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onRemove={fetchWishlist}
              onUpdate={fetchWishlist}
            />
          ))}
        </div>
      )}

      {/* Modal Partage */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Partager ma wishlist
              </h2>
              <Button variant="ghost" size="icon" onClick={() => { setShowShareModal(false); setShareUrl(''); }}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {!shareUrl ? (
              <div className="space-y-4">
                <div>
                  <Label>Nom de la wishlist</Label>
                  <Input
                    value={shareNom}
                    onChange={(e) => setShareNom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Expiration</Label>
                  <select
                    value={shareExpiration || ''}
                    onChange={(e) => setShareExpiration(e.target.value ? Number(e.target.value) : null)}
                    className="w-full h-10 px-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  >
                    <option value="">Jamais</option>
                    <option value="7">7 jours</option>
                    <option value="30">30 jours</option>
                    <option value="90">90 jours</option>
                  </select>
                </div>
                <Button
                  onClick={handlePartager}
                  disabled={shareLoading}
                  className="w-full"
                >
                  {shareLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <LinkIcon className="w-4 h-4 mr-2" />
                  )}
                  Generer le lien
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Lien genere avec succes !
                  </p>
                </div>
                <div>
                  <Label>Lien de partage</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={shareUrl} readOnly className="flex-1 text-sm" />
                    <Button onClick={handleCopierLien} variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Partage ce lien avec tes amis pour qu'ils voient tes favoris
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}