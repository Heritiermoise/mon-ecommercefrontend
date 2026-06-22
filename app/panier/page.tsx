'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Minus, Plus, Trash2, Loader2, 
  AlertCircle, CheckCircle, Package, CreditCard,
  MapPin, User, Plus as PlusIcon, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cartAPI, ordersAPI, addressesAPI } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuthStore } from '@/store/useAuthStore';

interface CartItem {
  id: number;
  produit_id: number;
  produit_nom: string;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
  produit_image?: string;
}

interface Address {
  id: number;
  nom_complet: string;
  telephone: string;
  adresse: string;
  ville: string;
  est_defaut: boolean;
}

export default function PanierPage() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuthStore();

  const [items, setItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | ''>('');
  const [processing, setProcessing] = useState(false);

  const [newAddress, setNewAddress] = useState({
    nom_complet: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    instructions: '',
    est_defaut: false,
  });

  const fetchCart = async () => {
    if (!isAuthenticated) {
      router.push('/connexion?redirect=/panier');
      return;
    }

    try {
      const response: any = await cartAPI.get();
      if (response.success) {
        setItems(response.data?.articles || []);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response: any = await addressesAPI.getAll();
      if (response.success) {
        setAddresses(response.data || []);
        const defaultAddr = response.data.find((a: Address) => a.est_defaut);
        if (defaultAddr && !selectedAddressId) {
          setSelectedAddressId(defaultAddr.id);
        }
      }
    } catch (err: any) {
      console.error('Erreur adresses:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const updateQuantity = async (articleId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdating(articleId);
    setError('');
    try {
      const response: any = await cartAPI.update(articleId, newQuantity);
      if (response.success) {
        setSuccess('Quantite mise a jour');
        await fetchCart();
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError(response.message || 'Erreur');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (articleId: number) => {
    if (!confirm('Supprimer cet article ?')) return;
    
    try {
      const response: any = await cartAPI.remove(articleId);
      if (response.success) {
        setSuccess('Article supprime');
        await fetchCart();
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response: any = await addressesAPI.create(newAddress);
      if (response.success) {
        setSuccess('Adresse ajoutee');
        setNewAddress({
          nom_complet: '',
          telephone: '',
          adresse: '',
          ville: '',
          code_postal: '',
          instructions: '',
          est_defaut: false,
        });
        setShowAddressForm(false);
        await fetchAddresses();
        if (response.data?.id) {
          setSelectedAddressId(response.data.id);
        }
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCheckout = async () => {
    setError('');
    
    if (!selectedAddressId) {
      setError('Veuillez selectionner ou ajouter une adresse de livraison');
      return;
    }

    if (items.length === 0) {
      setError('Votre panier est vide');
      return;
    }

    setProcessing(true);

    try {
      const response: any = await ordersAPI.create({
        adresse_livraison_id: Number(selectedAddressId),
        methode_paiement: 'en_attente',
      });

      if (response.success && response.data) {
        setSuccess('Commande creee avec succes !');
        setShowCheckout(false);
        setItems([]);
        
        setTimeout(() => {
          router.push('/paiement/' + response.data.numero_commande);
        }, 1500);
      } else {
        setError(response.message || 'Erreur lors de la creation de la commande');
      }
    } catch (err: any) {
      console.error('Erreur checkout:', err);
      setError(err.message || 'Erreur de connexion au serveur');
    } finally {
      setProcessing(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.sous_total) || 0), 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">Mon panier</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{items.length} article(s)</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {items.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">Votre panier est vide</p>
          <Button onClick={() => router.push('/produits')}>
            Continuer mes achats
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      {item.produit_image ? (
                        <img src={item.produit_image} alt={item.produit_nom} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{item.produit_nom}</h3>
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">
                        {formatPrice(Number(item.prix_unitaire) || 0)}
                      </p>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantite - 1)}
                          disabled={updating === item.id || item.quantite <= 1}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-lg font-semibold w-12 text-center text-gray-900 dark:text-gray-100">
                          {updating === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            item.quantite
                          )}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantite + 1)}
                          disabled={updating === item.id}
                          className="border-gray-300 dark:border-gray-600"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {formatPrice(Number(item.sous_total) || 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Resume</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Livraison</span>
                  <span>{shipping === 0 ? 'GRATUIT' : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                  <span>Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                onClick={() => setShowCheckout(true)}
                disabled={processing}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Passer la commande
                  </>
                )}
              </Button>
            </Card>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Finaliser la commande</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCheckout(false)} className="text-gray-500 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Adresse de livraison</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      {showAddressForm ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Annuler
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-4 h-4 mr-1" />
                          Nouvelle adresse
                        </>
                      )}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showAddressForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAddAddress}
                        className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-3"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <Input
                              placeholder="Nom complet"
                              value={newAddress.nom_complet}
                              onChange={(e) => setNewAddress({...newAddress, nom_complet: e.target.value})}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              placeholder="Telephone"
                              value={newAddress.telephone}
                              onChange={(e) => setNewAddress({...newAddress, telephone: e.target.value})}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <textarea
                              placeholder="Adresse complete"
                              value={newAddress.adresse}
                              onChange={(e) => setNewAddress({...newAddress, adresse: e.target.value})}
                              className="w-full min-h-[80px] px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                              required
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="Ville"
                              value={newAddress.ville}
                              onChange={(e) => setNewAddress({...newAddress, ville: e.target.value})}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                              required
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="Code postal"
                              value={newAddress.code_postal}
                              onChange={(e) => setNewAddress({...newAddress, code_postal: e.target.value})}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">
                          Enregistrer l adresse
                        </Button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {addresses.length > 0 ? (
                    <div className="space-y-2">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{addr.nom_complet}</span>
                            {addr.est_defaut && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                                Defaut
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{addr.adresse}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{addr.ville}</p>
                        </div>
                      ))}
                    </div>
                  ) : !showAddressForm ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Aucune adresse. Cliquez sur "Nouvelle adresse".
                    </p>
                  ) : null}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    <span>Total a payer</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{formatPrice(total)}</span>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => setShowCheckout(false)} variant="outline" className="flex-1 border-gray-300 dark:border-gray-600">
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCheckout}
                      disabled={processing}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        'Continuer vers le paiement'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}