'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Heart, Trash2, ShoppingCart, Bell, BellOff, 
  Edit3, Package, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/hooks/useCurrency';
import { wishlistAPI } from '@/lib/wishlist';
import WishlistButton from './WishlistButton';

interface WishlistItemProps {
  item: any;
  onRemove: () => void;
  onUpdate: () => void;
}

export default function WishlistCard({ item, onRemove, onUpdate }: WishlistItemProps) {
  const { formatPrice } = useCurrency();
  const [showOptions, setShowOptions] = useState(false);
  const [note, setNote] = useState(item.note_personnelle || '');
  const [alertePrix, setAlertePrix] = useState(item.alerte_prix || false);
  const [prixCible, setPrixCible] = useState(item.prix_cible?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleTransferer = async () => {
    setLoading(true);
    setError('');
    try {
      const response: any = await wishlistAPI.transfererAuPanier([item.produit_id]);
      if (response.success) {
        setSuccess('Produit ajoute au panier !');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOptions = async () => {
    setLoading(true);
    try {
      await wishlistAPI.remove(item.produit_id);
      await wishlistAPI.add(item.produit_id, {
        nom_collection: item.nom_collection,
        note_personnelle: note,
        alerte_prix: alertePrix,
        prix_cible: prixCible ? parseFloat(prixCible) : undefined,
      });
      setSuccess('Options enregistrees !');
      setShowOptions(false);
      onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Retirer ce produit des favoris ?')) return;
    try {
      await wishlistAPI.remove(item.produit_id);
      onRemove();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const dernierAlerte = item.dernieres_alertes?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
        {success && (
          <div className="p-2 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}

        {error && (
          <div className="p-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 p-4">
          {/* Image */}
          <Link href={`/produits/${item.slug}`} className="flex-shrink-0">
            <div className="relative w-full sm:w-32 h-40 sm:h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
              {item.image_principale ? (
                <img
                  src={item.image_principale}
                  alt={item.nom}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                </div>
              )}
              {item.en_promo && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{item.pourcentage_reduction}%
                </div>
              )}
              {!item.en_stock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold bg-red-600 px-2 py-1 rounded">
                    RUPTURE
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Infos */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Link href={`/produits/${item.slug}`}>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2">
                    {item.nom}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {item.categorie && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.categorie.nom}
                    </span>
                  )}
                  {item.marque && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.marque.nom}
                      </span>
                    </>
                  )}
                  <span className="text-gray-300">•</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full">
                    {item.nom_collection}
                  </span>
                </div>
              </div>
              <WishlistButton produitId={item.produit_id} size="sm" />
            </div>

            {/* Prix */}
            <div className="flex items-baseline gap-2 flex-wrap">
              {item.en_promo && item.prix_remise ? (
                <>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatPrice(item.prix_remise)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(item.prix)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(item.prix)}
                </span>
              )}
            </div>

            {/* Note personnelle */}
            {item.note_personnelle && (
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-400 rounded">
                <p className="text-xs text-yellow-800 dark:text-yellow-300 italic">
                  "{item.note_personnelle}"
                </p>
              </div>
            )}

            {/* Alerte prix */}
            {dernierAlerte && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 border-l-2 border-green-400 rounded flex items-start gap-2">
                <Bell className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    Baisse de prix detectee !
                  </p>
                  <p className="text-green-600 dark:text-green-400">
                    {formatPrice(dernierAlerte.ancien_prix)} → {formatPrice(dernierAlerte.nouveau_prix)} (-{dernierAlerte.pourcentage}%)
                  </p>
                  <p className="text-green-500 dark:text-green-500 text-[10px] mt-0.5">
                    {dernierAlerte.date}
                  </p>
                </div>
              </div>
            )}

            {item.alerte_prix && item.prix_cible && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Bell className="w-3 h-3" />
                Alerte active a {formatPrice(item.prix_cible)}
              </div>
            )}

            {/* Date ajout */}
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Ajoute le {item.ajoute_le}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleTransferer}
                disabled={loading || !item.en_stock}
                className="gap-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <ShoppingCart className="w-3 h-3" />
                )}
                Ajouter au panier
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
                className="gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Options
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-3 h-3" />
                Retirer
              </Button>
            </div>
          </div>
        </div>

        {/* Options avancées */}
        {showOptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 space-y-3"
          >
            <div>
              <Label className="text-sm">Note personnelle</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: A acheter pour Noel..."
                rows={2}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`alerte-${item.id}`}
                checked={alertePrix}
                onChange={(e) => setAlertePrix(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor={`alerte-${item.id}`} className="text-sm flex items-center gap-1 cursor-pointer">
                <Bell className="w-4 h-4" />
                Me prevenir quand le prix baisse
              </Label>
            </div>

            {alertePrix && (
              <div>
                <Label className="text-sm">Prix cible (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={prixCible}
                  onChange={(e) => setPrixCible(e.target.value)}
                  placeholder="Ex: 50.00"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Vous recevrez un email quand le prix atteint ce montant
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveOptions} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowOptions(false)}>
                Annuler
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}