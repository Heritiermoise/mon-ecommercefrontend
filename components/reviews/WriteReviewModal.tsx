'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import StarRating from '@/components/ui/StarRating';
import PhotoUpload from './PhotoUpload';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { note: number; titre: string; commentaire: string; photos: File[] }) => Promise<void>;
  produitNom: string;
}

export default function WriteReviewModal({ isOpen, onClose, onSubmit, produitNom }: WriteReviewModalProps) {
  const [note, setNote] = useState(0);
  const [titre, setTitre] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (note === 0) {
      setError('Veuillez selectionner une note');
      return;
    }
    if (commentaire.trim().length < 10) {
      setError('Le commentaire doit contenir au moins 10 caracteres');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ note, titre: titre.trim(), commentaire: commentaire.trim(), photos });
      setSuccess('Avis publie avec succes !');
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNote(0);
    setTitre('');
    setCommentaire('');
    setPhotos([]);
    setError('');
    setSuccess('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Laisser un avis</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Produit : <span className="font-medium">{produitNom}</span>
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 dark:text-gray-400">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="text-base font-semibold">Votre note *</Label>
                  <div className="mt-2">
                    <StarRating value={note} onChange={setNote} size="lg" showLabel />
                  </div>
                </div>

                <div>
                  <Label htmlFor="titre">Titre de l avis (optionnel)</Label>
                  <Input
                    id="titre"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Ex: Excellent produit !"
                    maxLength={255}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="commentaire">Votre commentaire *</Label>
                  <Textarea
                    id="commentaire"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Partagez votre experience avec ce produit (minimum 10 caracteres)..."
                    rows={5}
                    maxLength={2000}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {commentaire.length}/2000 caracteres
                  </p>
                </div>

                <PhotoUpload photos={photos} setPhotos={setPhotos} maxPhotos={5} maxSizeMB={2} />

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publication...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Publier l avis
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}