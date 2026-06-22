'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Minus, Plus, Star, Loader2, 
  CheckCircle, AlertCircle, Package, Truck, Shield, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { productsAPI, cartAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuthStore } from '@/store/useAuthStore';
import StarRating from '@/components/ui/StarRating';
import ReviewsSection from '@/components/reviews/ReviewsSection';

interface Product {
  id: number;
  nom: string;
  slug: string;
  description: string;
  prix: number;
  prix_remise?: number | null;
  quantite_stock: number;
  image_principale?: string;
  images?: Array<{ id: number; url: string; est_principale: boolean }>;
  categorie?: { nom: string };
  marque?: { nom: string };
  note_moyenne: number;
  nombre_avis: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'avis' | 'infos'>('description');

  useEffect(() => {
    if (slug) {
      productsAPI.getBySlug(slug)
        .then((response: any) => {
          if (response.success) {
            setProduct(response.data);
            if (response.data.images && response.data.images.length > 0) {
              const mainIndex = response.data.images.findIndex((img: any) => img.est_principale);
              setSelectedImage(mainIndex >= 0 ? mainIndex : 0);
            }
          }
        })
        .catch((err: any) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/connexion?redirect=/produits/' + slug);
      return;
    }

    if (!product) return;

    setAdding(true);
    setError('');
    setSuccess('');

    try {
      const response: any = await cartAPI.add({
        produit_id: product.id,
        quantite: quantity,
      });

      if (response.success) {
        setSuccess('Produit ajoute au panier !');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l ajout au panier');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!product) return null;

  const prix = product.prix;
  const prixRemise = product.prix_remise;
  const hasRemise = prixRemise !== null && prixRemise > 0 && prixRemise < prix;
  const pourcentageReduction = hasRemise ? Math.round(((prix - prixRemise) / prix) * 100) : 0;

  return (
    <div className="space-y-8">
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Section principale produit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galerie images */}
        <div className="space-y-4">
          <Card className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage].url}
                alt={product.nom}
                className="w-full h-full object-cover"
              />
            ) : product.image_principale ? (
              <img
                src={product.image_principale}
                alt={product.nom}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-300 dark:text-gray-600" />
              </div>
            )}
          </Card>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-indigo-600 dark:border-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informations produit */}
        <div className="space-y-6">
          <div>
            {product.categorie && (
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                {product.categorie.nom}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {product.nom}
            </h1>
            {product.marque && (
              <p className="text-gray-600 dark:text-gray-400">
                Marque : <span className="font-medium">{product.marque.nom}</span>
              </p>
            )}
          </div>

          {/* Note et avis */}
          {product.note_moyenne > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <StarRating value={product.note_moyenne} size="md" readonly />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.note_moyenne.toFixed(1)} ({product.nombre_avis} avis)
              </span>
              <button
                onClick={() => setActiveTab('avis')}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Voir les avis
              </button>
            </div>
          )}

          {/* Prix */}
          <div className="space-y-2">
            {hasRemise ? (
              <>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatPrice(prixRemise)}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(prix)}
                  </span>
                </div>
                <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold">
                  -{pourcentageReduction}% de reduction
                </span>
              </>
            ) : (
              <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(prix)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {product.quantite_stock > 0 ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                  En stock ({product.quantite_stock} disponible{product.quantite_stock > 1 ? 's' : ''})
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-700 dark:text-red-400 font-medium">Rupture de stock</span>
              </>
            )}
          </div>

          {/* Description courte */}
          {product.description && (
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {product.description.substring(0, 300)}
              {product.description.length > 300 && '...'}
            </p>
          )}

          {/* Quantité et ajout panier */}
          {product.quantite_stock > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Quantite
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center text-gray-900 dark:text-gray-100">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.quantite_stock, quantity + 1))}
                    disabled={quantity >= product.quantite_stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg gap-2"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Ajouter au panier - {formatPrice((prixRemise || prix) * quantity)}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Avantages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {[
              { icon: Truck, label: 'Livraison rapide' },
              { icon: Shield, label: 'Paiement securise' },
              { icon: RotateCcw, label: 'Retour 30 jours' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <item.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onglets : Description / Avis / Infos */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto">
          {[
            { id: 'description', label: 'Description' },
            { id: 'avis', label: `Avis (${product.nombre_avis})` },
            { id: 'infos', label: 'Informations' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {product.description || 'Aucune description disponible.'}
            </p>
          </div>
        )}

        {activeTab === 'avis' && (
          <ReviewsSection produitId={product.id} produitNom={product.nom} />
        )}

        {activeTab === 'infos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference</p>
              <p className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                {product.slug.toUpperCase()}
              </p>
            </Card>
            {product.categorie && (
              <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Categorie</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{product.categorie.nom}</p>
              </Card>
            )}
            {product.marque && (
              <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Marque</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{product.marque.nom}</p>
              </Card>
            )}
            <Card className="p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock disponible</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{product.quantite_stock} unites</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}