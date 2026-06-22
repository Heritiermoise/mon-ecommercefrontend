'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null, file?: File) => void;
  label?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
}

interface UploadedImage {
  file: File;
  preview: string;
  url?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Image du produit',
  multiple = false,
  maxFiles = 5,
  maxSizeMB = 5,
  className,
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Le fichier doit être une image';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Taille maximale: ${maxSizeMB}MB`;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Format non supporté (JPEG, PNG, WebP, GIF uniquement)';
    }
    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setError('');

    const newImages: UploadedImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        return;
      }

      if (!multiple && images.length + newImages.length >= 1) {
        setError('Une seule image autorisée');
        return;
      }

      if (images.length + newImages.length >= maxFiles) {
        setError(`Maximum ${maxFiles} images`);
        break;
      }

      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });
    }

    if (newImages.length > 0) {
      if (multiple) {
        setImages(prev => [...prev, ...newImages]);
        onChange(null, newImages[0].file);
      } else {
        setImages(newImages);
        onChange(null, newImages[0].file);
      }
    }
  }, [images, multiple, maxFiles, onChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
    onChange(newImages.length > 0 ? newImages[0].preview : null);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  // Si une URL est fournie (image existante)
  const existingImage = value && !images.some(img => img.preview === value);

  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Zone de drop */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        className={cn(
          'relative border-2 border-dashed rounded-xl cursor-pointer transition-all',
          'hover:border-indigo-500 dark:hover:border-indigo-400',
          dragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800',
          images.length === 0 && !existingImage && 'min-h-[200px] flex items-center justify-center'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {/* État vide */}
        {images.length === 0 && !existingImage && (
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliquez pour sélectionner ou glissez-déposez
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              JPEG, PNG, WebP, GIF • Max {maxSizeMB}MB
              {multiple && ` • Max ${maxFiles} images`}
            </p>
          </div>
        )}

        {/* Image existante (URL) */}
        {existingImage && images.length === 0 && (
          <div className="relative p-4">
            <img
              src={value}
              alt="Preview"
              className="w-full h-48 object-contain rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute top-6 right-6 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Preview des nouvelles images */}
        {images.length > 0 && (
          <div className={cn(
            'p-4',
            multiple ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : ''
          )}>
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.preview}
                  alt={`Preview ${index + 1}`}
                  className={cn(
                    'object-cover rounded-lg border border-gray-200 dark:border-gray-700',
                    multiple ? 'w-full h-32' : 'w-full h-48'
                  )}
                />
                
                {/* Overlay au hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(img.preview);
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Bouton ajouter plus (si multiple) */}
            {multiple && images.length < maxFiles && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
              >
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs">Ajouter</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span>{images.length} image(s) sélectionnée(s)</span>
        </div>
      )}

      {/* Modal preview */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}