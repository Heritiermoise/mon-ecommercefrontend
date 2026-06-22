'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, TrendingUp, TrendingDown, AlertTriangle,
  Loader2, CheckCircle, X, History, BarChart3, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { stockAPI, adminAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import ImageUploader from '@/components/ui/ImageUploader';

export default function StockPage() {
  const { formatPrice } = useCurrency();
  const [tab, setTab] = useState<'ajouter' | 'statistiques' | 'historique'>('ajouter');
  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    nom: '',
    categorie_id: '',
    marque_id: '',
    quantite_stock: '',
    prix: '',
    prix_remise: '',
    description: '',
    statut: 'actif',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, catRes, brandRes, mouvRes]: any[] = await Promise.all([
        stockAPI.statistiques(),
        adminAPI.categories.getAll(),
        adminAPI.brands.getAll(),
        stockAPI.mouvements(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (catRes.success) setCategories(catRes.data || []);
      if (brandRes.success) setBrands(brandRes.data || []);
      if (mouvRes.success) setMouvements(mouvRes.data?.data || mouvRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('nom', form.nom.trim());
      formData.append('categorie_id', form.categorie_id);
      formData.append('marque_id', form.marque_id);
      formData.append('quantite_stock', form.quantite_stock);
      formData.append('prix', form.prix);
      if (form.prix_remise) formData.append('prix_remise', form.prix_remise);
      if (form.description) formData.append('description', form.description);
      formData.append('statut', form.statut);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response: any = await stockAPI.ajouter(formData);

      if (response.success) {
        setSuccess(response.message);
        if (response.data?.action === 'updated') {
          setSuccess(`✅ ${response.message} (Stock: ${response.data.stock_avant} → ${response.data.stock_apres})`);
        } else {
          setSuccess(`✅ ${response.message} (Stock initial: ${response.data.stock_apres})`);
        }
        
        // Reset form
        setForm({
          nom: '', categorie_id: '', marque_id: '', quantite_stock: '',
          prix: '', prix_remise: '', description: '', statut: 'actif',
        });
        setImageFile(null);
        setImagePreview(null);
        
        loadData();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(response.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'entree': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'sortie': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'vente': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ajustement': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'retour': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Gestion intelligente du stock
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Ajout automatique, détection des doublons, historique complet
        </p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <p className="text-xs opacity-80">Total produits</p>
            <p className="text-2xl font-bold">{stats.total_produits}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-xs opacity-80">En stock</p>
            <p className="text-2xl font-bold">{stats.en_stock}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <p className="text-xs opacity-80">En rupture</p>
            <p className="text-2xl font-bold">{stats.en_rupture}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <p className="text-xs opacity-80">Stock faible</p>
            <p className="text-2xl font-bold">{stats.stock_faible}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-xs opacity-80">Entrées 30j</p>
            <p className="text-2xl font-bold">{stats.entrees_30j}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <p className="text-xs opacity-80">Sorties 30j</p>
            <p className="text-2xl font-bold">{stats.sorties_30j}</p>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'ajouter', label: 'Ajouter stock', icon: Plus },
          { id: 'statistiques', label: 'Statistiques', icon: BarChart3 },
          { id: 'historique', label: 'Historique', icon: History },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              tab === t.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Tab: Ajouter */}
      {tab === 'ajouter' && (
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Logique intelligente :</strong> Si un produit avec le même nom, catégorie et marque existe déjà, 
              la quantité sera ajoutée au stock existant. Sinon, un nouveau produit sera créé.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <ImageUploader
                  value={imagePreview}
                  onChange={(url, file) => {
                    setImagePreview(url);
                    setImageFile(file || null);
                  }}
                  label="Image du produit"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Nom du produit *</Label>
                <Input
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex: iPhone 15 Pro"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le système vérifiera si un produit identique existe déjà
                </p>
              </div>

              <div>
                <Label>Catégorie *</Label>
                <select
                  value={form.categorie_id}
                  onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}
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
                  value={form.marque_id}
                  onChange={(e) => setForm({ ...form, marque_id: e.target.value })}
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
                <Label>Quantité à ajouter *</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.quantite_stock}
                  onChange={(e) => setForm({ ...form, quantite_stock: e.target.value })}
                  placeholder="Ex: 50"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Prix unitaire (USD) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.prix}
                  onChange={(e) => setForm({ ...form, prix: e.target.value })}
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
                  value={form.prix_remise}
                  onChange={(e) => setForm({ ...form, prix_remise: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Statut</Label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  className="w-full h-10 px-3 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label>Description</Label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full h-24 px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="Description du produit..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    Ajouter au stock
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: Statistiques */}
      {tab === 'statistiques' && (
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Mouvements récents
          </h3>
          {mouvements.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun mouvement enregistré</p>
          ) : (
            <div className="space-y-2">
              {mouvements.slice(0, 20).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(m.type)}`}>
                      {m.type.toUpperCase()}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {m.produit?.nom || 'Produit inconnu'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {m.utilisateur} • {m.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold flex items-center gap-1 ${
                      m.quantite > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {m.quantite > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {m.quantite > 0 ? '+' : ''}{m.quantite}
                    </p>
                    <p className="text-xs text-gray-500">
                      {m.stock_avant} → {m.stock_apres}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab: Historique */}
      {tab === 'historique' && (
        <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Historique complet des mouvements
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Produit</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Quantité</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Stock</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Utilisateur</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Référence</th>
                </tr>
              </thead>
              <tbody>
                {mouvements.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">{m.date}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(m.type)}`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">{m.produit?.nom}</td>
                    <td className={`py-2 px-3 text-sm font-bold ${m.quantite > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {m.quantite > 0 ? '+' : ''}{m.quantite}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                      {m.stock_avant} → {m.stock_apres}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">{m.utilisateur}</td>
                    <td className="py-2 px-3 text-sm text-gray-500 font-mono">{m.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}