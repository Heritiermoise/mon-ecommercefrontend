'use client';

import { useState, useRef } from 'react';
import { Camera, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  photos: File[];
  setPhotos: (photos: File[]) => void;
  maxPhotos?: number;
  maxSizeMB?: number;
}

export default function PhotoUpload({ photos, setPhotos, maxPhotos = 5, maxSizeMB = 2 }: PhotoUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setError('');

    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxPhotos} photos`);
      return;
    }

    const newFiles = Array.from(files).slice(0, remaining);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        setError('Format invalide (JPEG, PNG, WEBP uniquement)');
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Fichier trop volumineux (max ${maxSizeMB}MB)`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setPhotos([...photos, ...validFiles]);
    setPreviews([...previews, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    const newPreviews = [...previews];
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    setPhotos(newPhotos);
    setPreviews(newPreviews);
    setError('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Photos (optionnel, max {maxPhotos})
        </label>
        <span className="text-xs text-gray-500">
          {photos.length}/{maxPhotos}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {previews.map((preview, index) => (
          <div key={index} className="relative aspect-square group">
            <img
              src={preview}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all',
              'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400',
              'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            )}
          >
            <Camera className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-500">Ajouter</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        JPEG, PNG, WEBP - Max {maxSizeMB}MB par photo
      </p>
    </div>
  );
}