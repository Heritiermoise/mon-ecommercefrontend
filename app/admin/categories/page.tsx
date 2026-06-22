'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Loader2, AlertCircle, Package, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { adminAPI } from '@/lib/api';

interface Category {
  id: number;
  nom: string;
  slug: string;
  produits_count?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ nom: '', slug: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response: any = await adminAPI.categories.getAll();
      if (response.success) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nom.trim()) {
      setError('Le nom est requis');
      return;
    }

    try {
      const response: any = await adminAPI.categories.create({
        nom: formData.nom.trim(),
        slug: formData.slug.trim() || undefined,
      });

      if (response.success) {
        setSuccess('✅ Categorie creee avec succes !');
        setFormData({ nom: '', slug: '' });
        setShowForm(false);
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur serveur');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette categorie ?')) return;
    try {
      const response: any = await adminAPI.categories.delete(id);
      if (response.success) {
        setSuccess('Categorie supprimee');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-600 mt-1">{categories.length} categorie(s)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 w-full sm:w-auto">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Annuler' : 'Nouvelle categorie'}
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3"
        >
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 sm:gap-3"
        >
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-green-700">{success}</p>
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Nouvelle categorie</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nom de la categorie *</Label>
                  <Input
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Smartphones"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Slug (optionnel)</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="smartphones"
                    className="mt-1"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button type="submit" className="w-full sm:flex-1">Creer la categorie</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="w-full sm:flex-1">
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {categories.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-base sm:text-lg mb-4">Aucune categorie</p>
          <Button onClick={() => setShowForm(true)}>Creer ma premiere categorie</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
            >
              <Card className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{category.nom}</h3>
                    <p className="text-xs text-gray-500 truncate">/{category.slug}</p>
                  </div>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold ml-2 flex-shrink-0">
                    {category.produits_count || 0}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Supprimer
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}