'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, MessageSquare, BadgeCheck, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/ui/StarRating';
import { cn } from '@/lib/utils';

interface Review {
  id: number;
  note: number;
  titre?: string;
  commentaire: string;
  est_verifie: boolean;
  nb_utile: number;
  nb_inutile: number;
  date_publication: string;
  utilisateur: {
    nom: string;
    initiales: string;
  };
  photos: Array<{ id: number; url: string }>;
  reponses: Array<{
    id: number;
    contenu: string;
    est_admin: boolean;
    date: string;
    utilisateur: { nom: string; role: string };
  }>;
}

interface ReviewCardProps {
  review: Review;
  onVoteUtile?: (id: number) => void;
  onVoteInutile?: (id: number) => void;
  onSignaler?: (id: number) => void;
  onRepondre?: (id: number, contenu: string) => void;
  isAdmin?: boolean;
}

export default function ReviewCard({ review, onVoteUtile, onVoteInutile, onSignaler, onRepondre, isAdmin }: ReviewCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleSubmitReply = () => {
    if (replyContent.trim().length < 5) return;
    onRepondre?.(review.id, replyContent.trim());
    setReplyContent('');
    setShowReplyForm(false);
  };

  const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-green-500'];

  return (
    <>
      <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {review.utilisateur.initiales}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  {review.utilisateur.nom}
                </p>
                {review.est_verifie && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                    <BadgeCheck className="w-3 h-3" />
                    Achat verifie
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {review.date_publication}
              </p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <StarRating value={review.note} size="sm" readonly />
            {review.titre && (
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                {review.titre}
              </span>
            )}
          </div>
        </div>

        {/* Commentaire */}
        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-3 whitespace-pre-wrap">
          {review.commentaire}
        </p>

        {/* Photos */}
        {review.photos.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-2">
              <Camera className="w-3.5 h-3.5" />
              <span>{review.photos.length} photo{review.photos.length > 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {review.photos.slice(0, showAllPhotos ? undefined : 4).map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo.url)}
                  className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-indigo-500 transition-all"
                >
                  <img
                    src={photo.url}
                    alt="Photo avis"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
              {!showAllPhotos && review.photos.length > 4 && (
                <button
                  onClick={() => setShowAllPhotos(true)}
                  className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  +{review.photos.length - 4}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVoteUtile?.(review.id)}
            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            Utile ({review.nb_utile})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVoteInutile?.(review.id)}
            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            Inutile ({review.nb_inutile})
          </Button>
          {onRepondre && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              Repondre
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSignaler?.(review.id)}
            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-auto"
          >
            <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            Signaler
          </Button>
        </div>

        {/* Formulaire de réponse */}
        {showReplyForm && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Ecrivez votre reponse..."
              className="mb-2"
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitReply} disabled={replyContent.trim().length < 5}>
                Envoyer
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReplyForm(false)}>
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Réponses */}
        {review.reponses.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
              {review.reponses.length} reponse{review.reponses.length > 1 ? 's' : ''}
            </p>
            {review.reponses.map((reponse) => (
              <div
                key={reponse.id}
                className={cn(
                  'p-3 rounded-lg border-l-4',
                  reponse.est_admin
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {reponse.utilisateur.nom}
                  </span>
                  {reponse.est_admin && (
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs rounded-full font-medium">
                      Admin
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {reponse.date}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {reponse.contenu}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="Photo agrandie"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}