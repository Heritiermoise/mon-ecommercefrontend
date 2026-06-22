const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    url: string;
    path: string;
    filename: string;
    size: number;
    mime: string;
  };
}

/**
 * RÃ©cupÃ©rer le token depuis localStorage (cohÃ©rent avec useAuthStore)
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Upload une image vers le serveur
 * Convertit automatiquement en HTTPS
 */
export async function uploadImage(
  file: File,
  folder: 'products' | 'categories' | 'users' = 'products'
): Promise<UploadResult> {
  const token = getToken();

  if (!token) {
    throw new Error('Non authentifiÃ©. Veuillez vous reconnecter.');
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  try {
    // IMPORTANT: Ne PAS mettre Content-Type, le navigateur le fait automatiquement pour FormData
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('RÃ©ponse non-JSON:', text.substring(0, 300));
      throw new Error('RÃ©ponse serveur invalide');
    }

    // Si non authentifiÃ©, rediriger vers la connexion
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/connexion?reason=session';
      throw new Error('Session expirÃ©e. Veuillez vous reconnecter.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'upload');
    }

    // S'assurer que l'URL est en HTTPS
    if (data.data?.url) {
      data.data.url = data.data.url.replace(/^http:\/\//i, 'https://');
    }

    return data;
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Impossible de contacter le serveur');
    }
    throw error;
  }
}

/**
 * Upload plusieurs images
 */
export async function uploadMultipleImages(
  files: File[],
  folder: 'products' | 'categories' | 'users' = 'products'
): Promise<UploadResult> {
  const token = getToken();

  if (!token) {
    throw new Error('Non authentifiÃ©');
  }

  const formData = new FormData();
  files.forEach((file) => formData.append('images[]', file));
  formData.append('folder', folder);

  const response = await fetch(`${API_URL}/upload/multiple`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erreur lors de l\'upload');
  }

  return data;
}

/**
 * Supprimer une image
 */
export async function deleteImage(path: string): Promise<boolean> {
  const token = getToken();

  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ path }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Convertir une URL HTTP en HTTPS
 */
export function toHttps(url: string): string {
  if (!url) return '';
  return url.replace(/^http:\/\//i, 'https://');
}

/**
 * Valider un fichier image
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5 MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Format non supportÃ©. Utilisez JPG, PNG, GIF ou WebP.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'L\'image ne doit pas dÃ©passer 5 MB.' };
  }

  return { valid: true };
}