'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Package, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { adminAPI, uploadAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import ImageUploader from '@/components/ui/ImageUploader';

interface Product {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  prix: number | string;
  prix_remise?: number | string | null;
  quantite_stock: number;
  categorie_id: number;
  marque_id: number;
  statut: string;
  categorie?: { id: number; nom: string };
  marque?: { id: number; nom: string };
  image_principale?: string | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const { formatPrice } = useCurrency();

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    prix_remise: '',
    quantite_stock: '',
    categorie_id: '',
    marque_id: '',
    statut: 'actif',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, brandsRes, productsRes]: any[] = await Promise.all([
        adminAPI.categories.getAll(),
        adminAPI.brands.getAll(),
        adminAPI.products.getAll(),
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.data || []);
      if (brandsRes.success) setBrands(brandsRes.data || []);
      if (productsRes.success) setProducts(productsRes.data?.data || productsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nom.trim()) return setError('Le nom est requis');
    if (!formData.prix || parseFloat(formData.prix) <= 0) return setError('Prix invalide');
    if (!formData.categorie_id) return setError('Categorie requise');
    if (!formData.marque_id) return setError('Marque requise');

    try {
      const data = new FormData();
      data.append('nom', formData.nom.trim());
      data.append('description', formData.description.trim());
      data.append('prix', formData.prix);
      if (formData.prix_remise) data.append('prix_remise', formData.prix_remise);
      data.append('quantite_stock', formData.quantite_stock || '0');
      data.append('categorie_id', formData.categorie_id);
      data.append('marque_id', formData.marque_id);
      data.append('statut', formData.statut);

      // Upload de l'image
      if (imageFile) {
        setUploading(true);
        try {
          const uploadResult = await uploadAPI.uploadImage(imageFile);
          if (uploadResult.success) {
            data.append('image_url', uploadResult.data.url);
          }
        } catch (uploadError: any) {
          setError('Erreur upload image: ' + uploadError.message);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const response: any = await adminAPI.products.create(Object.fromEntries(data));

      if (response.success) {
        setSuccess('✅ Produit créé avec succès !');
        resetForm();
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '', description: '', prix: '', prix_remise: '',
      quantite_stock: '', categorie_id: '', marque_id: '', statut: 'actif',
    });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      const response: any = await adminAPI.products.delete(id);
      if (response.success) {
        setSuccess('Produit supprimé');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleImageChange = (url: string | null, file?: File) => {
    setImagePreview(url);
    if (file) setImageFile(file);
    else setImageFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">Produits</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{products.length} produit(s)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Annuler' : 'Nouveau produit'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Nouveau produit</h2>

              {categories.length === 0 || brands.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    ⚠️ Créez d'abord des catégories et marques
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <ImageUploader
                        value={imagePreview}
                        onChange={handleImageChange}
                        label="Image du produit"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Nom du produit *</Label>
                      <Input
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        placeholder="Ex: iPhone 15 Pro"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Catégorie *</Label>
                      <select
                        value={formData.categorie_id}
                        onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                        className="w-full h-10 px-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        required
                      >
                        <option value="">Sélectionner...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.nom}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Marque *</Label>
                      <select
                        value={formData.marque_id}
                        onChange={(e) => setFormData({ ...formData, marque_id: e.target.value })}
                        className="w-full h-10 px-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        required
                      >
                        <option value="">Sélectionner...</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>{brand.nom}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Prix (USD) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.prix}
                        onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Prix remise (optionnel)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.prix_remise}
                        onChange={(e) => setFormData({ ...formData, prix_remise: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Quantité en stock *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.quantite_stock}
                        onChange={(e) => setFormData({ ...formData, quantite_stock: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Statut</Label>
                      <select
                        value={formData.statut}
                        onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                        className="w-full h-10 px-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      >
                        <option value="actif">Actif</option>
                        <option value="inactif">Inactif</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full h-24 px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        rows={3}
                        placeholder="Description du produit..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={uploading} className="gap-2">
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Upload en cours...
                        </>
                      ) : (
                        'Créer le produit'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">Aucun produit</p>
          <Button onClick={() => setShowForm(true)}>Créer mon premier produit</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const prix = Number(product.prix) || 0;
            const prixRemise = product.prix_remise ? Number(product.prix_remise) : null;
            const hasRemise = prixRemise !== null && prixRemise > 0 && prixRemise < prix;

            return (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 relative">
                    {product.image_principale ? (
                      <img
                        src={product.image_principale}
                        alt={product.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      product.statut === 'actif' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {product.statut}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">{product.nom}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {product.categorie?.nom} • {product.marque?.nom}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        {hasRemise ? (
                          <>
                            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              {formatPrice(prixRemise)}
                            </span>
                            <span className="text-xs text-gray-400 line-through ml-2">
                              {formatPrice(prix)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {formatPrice(prix)}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${
                        product.quantite_stock === 0 ? 'text-red-600' :
                        product.quantite_stock < 10 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        Stock: {product.quantite_stock}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1">
                        <Edit className="w-3 h-3" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}