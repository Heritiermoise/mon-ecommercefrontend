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

export const searchAPI = {
  search: (params: any) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.categorie_id) {
      if (Array.isArray(params.categorie_id)) {
        params.categorie_id.forEach((id: number) => query.append('categorie_id[]', id.toString()));
      } else {
        query.append('categorie_id', params.categorie_id.toString());
      }
    }
    if (params.marque_id) {
      if (Array.isArray(params.marque_id)) {
        params.marque_id.forEach((id: number) => query.append('marque_id[]', id.toString()));
      } else {
        query.append('marque_id', params.marque_id.toString());
      }
    }
    if (params.tags) params.tags.forEach((id: number) => query.append('tags[]', id.toString()));
    if (params.couleurs) params.couleurs.forEach((id: number) => query.append('couleurs[]', id.toString()));
    if (params.tailles) params.tailles.forEach((id: number) => query.append('tailles[]', id.toString()));
    if (params.prix_min !== undefined) query.append('prix_min', params.prix_min.toString());
    if (params.prix_max !== undefined) query.append('prix_max', params.prix_max.toString());
    if (params.note_min !== undefined) query.append('note_min', params.note_min.toString());
    if (params.en_promo) query.append('en_promo', '1');
    if (params.en_stock) query.append('en_stock', '1');
    if (params.tri) query.append('tri', params.tri);
    if (params.page) query.append('page', params.page.toString());
    if (params.per_page) query.append('per_page', params.per_page.toString());
    
    return apiRequest(`/search?${query.toString()}`);
  },

  autocomplete: (q: string) => apiRequest(`/search/autocomplete?q=${encodeURIComponent(q)}`),
  getHistorique: () => apiRequest('/search/historique'),
  supprimerHistorique: () => apiRequest('/search/historique/supprimer', { method: 'POST' }),
  getTendances: () => apiRequest('/search/tendances'),
  getRecemmentVus: () => apiRequest('/search/recemment-vus'),
  getSouventAchetesEnsemble: (produitId: number) => 
    apiRequest(`/search/souvent-achetes-ensemble/${produitId}`),
  enregistrerVue: (produitId: number) => 
    apiRequest(`/search/vue/${produitId}`, { method: 'POST' }),
};