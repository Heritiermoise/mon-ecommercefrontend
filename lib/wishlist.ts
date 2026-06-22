const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Reponse serveur invalide');
    }

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw new Error('Session expiree');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Erreur serveur');
    }

    return data;
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Backend inaccessible');
    }
    throw error;
  }
}

export const wishlistAPI = {
  getAll: (collection?: string) => {
    const query = collection ? `?collection=${encodeURIComponent(collection)}` : '';
    return apiRequest(`/wishlist${query}`);
  },

  add: (produitId: number, options?: {
    nom_collection?: string;
    note_personnelle?: string;
    alerte_prix?: boolean;
    prix_cible?: number;
  }) => apiRequest('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ produit_id: produitId, ...options }),
  }),

  remove: (produitId: number) => apiRequest(`/wishlist/${produitId}`, { method: 'DELETE' }),

  check: (produitId: number) => apiRequest(`/wishlist/check/${produitId}`),

  transfererAuPanier: (produitIds?: number[]) => apiRequest('/wishlist/transferer-panier', {
    method: 'POST',
    body: JSON.stringify({ produit_ids: produitIds }),
  }),

  partager: (nom?: string, expirationJours?: number) => apiRequest('/wishlist/partager', {
    method: 'POST',
    body: JSON.stringify({ nom, expiration_jours: expirationJours }),
  }),

  voirPartage: (token: string) => apiRequest(`/wishlist/partage/${token}`),

  getAlertes: () => apiRequest('/wishlist/alertes'),
};