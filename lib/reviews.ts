const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // Ne pas mettre Content-Type pour FormData
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

export const reviewsAPI = {
  getProduitAvis: (produitId: number, params?: { note?: number; verifie?: boolean; sort?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.note) query.append('note', params.note.toString());
    if (params?.verifie !== undefined) query.append('verifie', params.verifie.toString());
    if (params?.sort) query.append('sort', params.sort);
    if (params?.page) query.append('page', params.page.toString());
    return apiRequest(`/produits/${produitId}/avis?${query.toString()}`);
  },

  create: (produitId: number, data: { note: number; titre?: string; commentaire: string; photos: File[] }) => {
    const formData = new FormData();
    formData.append('note', data.note.toString());
    if (data.titre) formData.append('titre', data.titre);
    formData.append('commentaire', data.commentaire);
    data.photos.forEach((photo) => formData.append('photos[]', photo));
    return apiRequest(`/avis/produit/${produitId}`, { method: 'POST', body: formData });
  },

  update: (id: number, data: { note: number; titre?: string; commentaire: string }) =>
    apiRequest(`/avis/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) =>
    apiRequest(`/avis/${id}`, { method: 'DELETE' }),

  voteUtile: (id: number) =>
    apiRequest(`/avis/${id}/utile`, { method: 'POST' }),

  voteInutile: (id: number) =>
    apiRequest(`/avis/${id}/inutile`, { method: 'POST' }),

  repondre: (avisId: number, contenu: string) =>
    apiRequest(`/avis/${avisId}/repondre`, { method: 'POST', body: JSON.stringify({ contenu }) }),

  signaler: (avisId: number, motif: string, details?: string) =>
    apiRequest(`/avis/${avisId}/signaler`, { method: 'POST', body: JSON.stringify({ motif, details }) }),
};