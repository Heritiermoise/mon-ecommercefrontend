'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Filter, MessageSquarePlus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import ReviewStats from './ReviewStats';
import ReviewCard from './ReviewCard';
import WriteReviewModal from './WriteReviewModal';
import { reviewsAPI } from '@/lib/reviews';

interface ReviewsSectionProps {
  produitId: number;
  produitNom: string;
}

export default function ReviewsSection({ produitId, produitNom }: ReviewsSectionProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [avis, setAvis] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filterNote, setFilterNote] = useState<number | null>(null);
  const [filterVerifie, setFilterVerifie] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAvis = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { sort: sortBy, page: currentPage };
      if (filterNote) params.note = filterNote;
      if (filterVerifie !== null) params.verifie = filterVerifie;

      const response: any = await reviewsAPI.getProduitAvis(produitId, params);
      if (response.success) {
        setAvis(response.data.avis || []);
        setStats(response.data.statistiques);
        setCurrentPage(response.data.pagination.current_page);
        setLastPage(response.data.pagination.last_page);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvis();
  }, [produitId, currentPage, filterNote, filterVerifie, sortBy]);

  const handleSubmitReview = async (data: { note: number; titre: string; commentaire: string; photos: File[] }) => {
    const response: any = await reviewsAPI.create(produitId, data);
    if (response.success) {
      setSuccess('Avis publie avec succes !');
      setTimeout(() => setSuccess(''), 3000);
      await fetchAvis();
    }
  };

  const handleVoteUtile = async (id: number) => {
    try {
      await reviewsAPI.voteUtile(id);
      await fetchAvis();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVoteInutile = async (id: number) => {
    try {
      await reviewsAPI.voteInutile(id);
      await fetchAvis();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRepondre = async (avisId: number, contenu: string) => {
    try {
      await reviewsAPI.repondre(avisId, contenu);
      await fetchAvis();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignaler = async (avisId: number) => {
    const motif = prompt('Motif du signalement (spam, offensant, faux, autre) :');
    if (!motif) return;
    try {
      await reviewsAPI.signaler(avisId, motif);
      setSuccess('Avis signale avec succes');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
            Avis des clients
          </h2>
          {stats && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.total_avis} avis - Note moyenne : {stats.note_moyenne}/5
            </p>
          )}
        </div>
        {isAuthenticated && (
          <Button onClick={() => setShowWriteModal(true)} className="gap-2">
            <MessageSquarePlus className="w-4 h-4" />
            Laisser un avis
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Statistiques */}
      {stats && (
        <ReviewStats
          noteMoyenne={stats.note_moyenne}
          totalAvis={stats.total_avis}
          distribution={stats.distribution}
          avisVerifies={stats.avis_verifies}
          avecPhotos={stats.avec_photos}
        />
      )}

      {/* Filtres et tri */}
      <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtres :</span>
            <Button
              variant={filterNote === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterNote(null)}
              className="text-xs"
            >
              Tous
            </Button>
            {[5, 4, 3, 2, 1].map((note) => (
              <Button
                key={note}
                variant={filterNote === note ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterNote(filterNote === note ? null : note)}
                className="text-xs"
              >
                {note} <Star className="w-3 h-3 fill-current ml-0.5" />
              </Button>
            ))}
            <Button
              variant={filterVerifie === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterVerifie(filterVerifie === true ? null : true)}
              className="text-xs"
            >
              Verifies
            </Button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="recent">Plus recents</option>
            <option value="meilleures">Meilleures notes</option>
            <option value="pires">Pires notes</option>
            <option value="utiles">Plus utiles</option>
          </select>
        </div>
      </Card>

      {/* Liste des avis */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : avis.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <MessageSquarePlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Aucun avis pour le moment</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Soyez le premier a laisser un avis !
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {avis.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ReviewCard
                review={review}
                onVoteUtile={handleVoteUtile}
                onVoteInutile={handleVoteInutile}
                onRepondre={user?.role === 'administrateur' || user?.role === 'super_administrateur' ? handleRepondre : undefined}
                onSignaler={handleSignaler}
                isAdmin={user?.role === 'administrateur' || user?.role === 'super_administrateur'}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Precedent
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
            Page {currentPage} sur {lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
            disabled={currentPage === lastPage}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Modal ecrire avis */}
      <WriteReviewModal
        isOpen={showWriteModal}
        onClose={() => setShowWriteModal(false)}
        onSubmit={handleSubmitReview}
        produitNom={produitNom}
      />
    </div>
  );
}