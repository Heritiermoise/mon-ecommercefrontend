'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, CheckCircle, XCircle, Trash2, MessageSquare, Flag, 
  Loader2, AlertCircle, Search, Filter, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { adminAPI } from '@/lib/api';
import StarRating from '@/components/ui/StarRating';

interface Avis {
  id: number;
  note: number;
  titre?: string;
  commentaire: string;
  est_verifie: boolean;
  est_approuve: boolean;
  nb_utile: number;
  nb_inutile: number;
  date: string;
  produit: { id: number; nom: string; slug: string };
  utilisateur: { id: number; nom: string; email: string };
  photos: Array<{ id: number; url: string }>;
  reponses: Array<{ id: number; contenu: string; est_admin: boolean; date: string; utilisateur: string }>;
  nb_signalements: number;
}

export default function AdminAvisPage() {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterApprouve, setFilterApprouve] = useState<boolean | null>(null);
  const [filterNote, setFilterNote] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAvis, setSelectedAvis] = useState<Avis | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showSignalements, setShowSignalements] = useState(false);
  const [signalements, setSignalements] = useState<any[]>([]);

  const fetchAvis = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { sort: sortBy, page: currentPage };
      if (filterApprouve !== null) params.est_approuve = filterApprouve;
      if (filterNote) params.note = filterNote;
      if (search) params.search = search;

      const response: any = await adminAPI.reviews.getAll(params);
      if (response.success) {
        setAvis(response.data || []);
        setStats(response.stats);
        setCurrentPage(response.pagination.current_page);
        setLastPage(response.pagination.last_page);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSignalements = async () => {
    try {
      const response: any = await adminAPI.reviews.getSignalements();
      if (response.success) {
        setSignalements(response.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAvis();
  }, [currentPage, filterApprouve, filterNote, sortBy]);

  const handleApprouver = async (id: number) => {
    try {
      const response: any = await adminAPI.reviews.approuver(id);
      if (response.success) {
        setSuccess('Avis approuve');
        setTimeout(() => setSuccess(''), 2000);
        await fetchAvis();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDesapprouver = async (id: number) => {
    try {
      const response: any = await adminAPI.reviews.desapprouver(id);
      if (response.success) {
        setSuccess('Avis desapprouve');
        setTimeout(() => setSuccess(''), 2000);
        await fetchAvis();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet avis definitivement ?')) return;
    try {
      const response: any = await adminAPI.reviews.delete(id);
      if (response.success) {
        setSuccess('Avis supprime');
        setTimeout(() => setSuccess(''), 2000);
        await fetchAvis();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRepondre = async () => {
    if (!selectedAvis || replyContent.trim().length < 5) return;
    try {
      const response: any = await adminAPI.reviews.repondre(selectedAvis.id, replyContent.trim());
      if (response.success) {
        setSuccess('Reponse envoyee');
        setReplyContent('');
        setSelectedAvis(null);
        setTimeout(() => setSuccess(''), 2000);
        await fetchAvis();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTraiterSignalement = async (id: number) => {
    try {
      const response: any = await adminAPI.reviews.traiterSignalement(id);
      if (response.success) {
        await fetchSignalements();
        await fetchAvis();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Gestion des Avis
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Moderez les avis clients
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => { setShowSignalements(!showSignalements); if (!showSignalements) fetchSignalements(); }}
          className="gap-2"
        >
          <Flag className="w-4 h-4" />
          Signalements {stats?.signales > 0 && `(${stats.signales})`}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'from-gray-500 to-gray-600' },
            { label: 'Approuves', value: stats.approuves, color: 'from-green-500 to-emerald-600' },
            { label: 'En attente', value: stats.en_attente, color: 'from-amber-500 to-orange-600' },
            { label: 'Signales', value: stats.signales, color: 'from-red-500 to-rose-600' },
            { label: 'Note moy.', value: stats.note_moyenne, color: 'from-indigo-500 to-purple-600' },
          ].map((stat, idx) => (
            <Card key={idx} className={`p-4 bg-gradient-to-br ${stat.color} text-white`}>
              <p className="text-xs opacity-90">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Signalements */}
      {showSignalements && (
        <Card className="p-4 sm:p-6 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Avis signales ({signalements.length})
          </h2>
          {signalements.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">Aucun signalement en attente</p>
          ) : (
            <div className="space-y-3">
              {signalements.map((s) => (
                <div key={s.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Motif : {s.motif}
                      </p>
                      {s.details && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{s.details}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Signale par {s.utilisateur?.nom || 'Anonyme'} le {s.date}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleTraiterSignalement(s.id)}>
                      Traiter
                    </Button>
                  </div>
                  {s.avis && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs">
                      <p className="font-medium">{s.avis.produit}</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{s.avis.commentaire}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Filtres */}
      <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
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
            <option value="meilleures">Meilleures notes</option>
            <option value="pires">Pires notes</option>
            <option value="signales">Plus signales</option>
          </select>
          <select
            value={filterApprouve === null ? '' : filterApprouve.toString()}
            onChange={(e) => setFilterApprouve(e.target.value === '' ? null : e.target.value === 'true')}
            className="h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
          >
            <option value="">Tous</option>
            <option value="true">Approuves</option>
            <option value="false">En attente</option>
          </select>
        </div>
      </Card>

      {/* Liste des avis */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : avis.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun avis trouve</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {avis.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`p-4 sm:p-6 border-l-4 ${
                a.est_approuve 
                  ? 'border-l-green-500 bg-white dark:bg-gray-800' 
                  : 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-900/10'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <StarRating value={a.note} size="sm" readonly />
                      {a.titre && (
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{a.titre}</span>
                      )}
                      {a.est_verifie && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Verifie
                        </span>
                      )}
                      {a.nb_signalements > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full flex items-center gap-1">
                          <Flag className="w-3 h-3" />
                          {a.nb_signalements}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                      {a.commentaire}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>Par <strong>{a.utilisateur?.nom}</strong></span>
                      <span>Produit : <strong>{a.produit?.nom}</strong></span>
                      <span>{a.date}</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-600" /> {a.nb_utile}
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-600" /> {a.nb_inutile}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {a.est_approuve ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDesapprouver(a.id)}
                        className="text-amber-600 border-amber-600"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Desapprouver
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprouver(a.id)}
                        className="text-green-600 border-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAvis(a)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Repondre
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(a.id)}
                      className="text-red-600 border-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>

                {/* Photos */}
                {a.photos.length > 0 && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {a.photos.map((p) => (
                      <img
                        key={p.id}
                        src={p.url}
                        alt="Photo avis"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    ))}
                  </div>
                )}

                {/* Reponses existantes */}
                {a.reponses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                      Reponses ({a.reponses.length})
                    </p>
                    {a.reponses.map((r) => (
                      <div
                        key={r.id}
                        className={`p-2 rounded-lg text-sm ${
                          r.est_admin
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-indigo-500'
                            : 'bg-gray-50 dark:bg-gray-900'
                        }`}
                      >
                        <p className="text-xs text-gray-500 mb-1">
                          <strong>{r.utilisateur}</strong> {r.est_admin && '(Admin)'} - {r.date}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">{r.contenu}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
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
            Page {currentPage} / {lastPage}
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

      {/* Modal reponse */}
      {selectedAvis && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Repondre a l avis de {selectedAvis.utilisateur?.nom}
            </h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
              <StarRating value={selectedAvis.note} size="sm" readonly />
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{selectedAvis.commentaire}</p>
            </div>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Ecrivez votre reponse..."
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleRepondre} disabled={replyContent.trim().length < 5}>
                Envoyer
              </Button>
              <Button variant="outline" onClick={() => setSelectedAvis(null)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}