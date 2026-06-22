const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    let text = await response.text();

    // Supprimer le BOM si présent
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }

    if (!text || text.trim() === '') {
      throw new Error('Réponse vide du serveur');
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Réponse non-JSON:', text.substring(0, 200));
      throw new Error('Réponse serveur invalide');
    }

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/connexion')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/connexion?reason=expired';
      }
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      throw new Error(data.message || `Erreur ${response.status}`);
    }

    return data;
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Backend inaccessible');
    }
    throw error;
  }
}

// ============================================
// AUTH
// ============================================
export const authAPI = {
  register: (data: any) => apiRequest('/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => apiRequest('/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiRequest('/logout', { method: 'POST' }),
  profile: () => apiRequest('/profile'),
  checkSession: () => apiRequest('/check-session'),
  refresh: () => apiRequest('/refresh', { method: 'POST' }),
};

// ============================================
// PRODUITS
// ============================================
export const productsAPI = {
  getAll: (params?: any) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    return apiRequest(`/products?${query.toString()}`);
  },
  getBySlug: (slug: string) => apiRequest(`/products/${slug}`),
};

export const categoriesAPI = {
  getAll: () => apiRequest('/categories'),
};

export const brandsAPI = {
  getAll: () => apiRequest('/brands'),
};

// ============================================
// PANIER
// ============================================
export const cartAPI = {
  get: () => apiRequest('/cart'),
  add: (data: { produit_id: number; quantite: number }) =>
    apiRequest('/cart/add', { method: 'POST', body: JSON.stringify(data) }),
  update: (articleId: number, quantite: number) =>
    apiRequest(`/cart/update/${articleId}`, { method: 'PUT', body: JSON.stringify({ quantite }) }),
  remove: (articleId: number) =>
    apiRequest(`/cart/remove/${articleId}`, { method: 'DELETE' }),
  clear: () => apiRequest('/cart/clear', { method: 'DELETE' }),
};

// ============================================
// ADRESSES
// ============================================
export const addressesAPI = {
  getAll: () => apiRequest('/addresses'),
  create: (data: any) => apiRequest('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  setDefault: (id: number) => apiRequest(`/addresses/${id}/set-default`, { method: 'POST' }),
};

// ============================================
// COMMANDES
// ============================================
export const ordersAPI = {
  getAll: () => apiRequest('/orders'),
  create: (data: any) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(data) }),
};

// ============================================
// PAIEMENT GÉNÉRIQUE
// ============================================
export const paymentAPI = {
  initiate: (numeroCommande: string) => apiRequest(`/payment/initiate/${numeroCommande}`),
  process: (numeroCommande: string, data: any) =>
    apiRequest(`/payment/process/${numeroCommande}`, { method: 'POST', body: JSON.stringify(data) }),
};

// ============================================
// UPLOAD IMAGE
// ============================================
export const uploadAPI = {
  uploadImage: async (file: File): Promise<any> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/admin/products/upload`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    let text = await response.text();
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Réponse serveur invalide');
    }

    if (!response.ok) throw new Error(data.message || 'Erreur upload');
    return data;
  },
};

// ============================================
// STOCK
// ============================================
export const stockAPI = {
  ajouter: (data: FormData) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return fetch(`${API_URL}/admin/stock/ajouter`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: data,
    }).then(r => r.json());
  },
  ajuster: (produitId: number, quantite: number, note?: string) =>
    apiRequest(`/admin/stock/ajuster/${produitId}`, { method: 'POST', body: JSON.stringify({ quantite, note }) }),
  historique: (produitId: number) => apiRequest(`/admin/stock/historique/${produitId}`),
  statistiques: () => apiRequest('/admin/stock/statistiques'),
  mouvements: (params?: any) => {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.page) query.append('page', params.page.toString());
    return apiRequest(`/admin/stock/mouvements?${query.toString()}`);
  },
};

// ============================================
// MAISHAPAY (DÉFINI UNE SEULE FOIS)
// ============================================
export const maishapayAPI = {
  initier: (numeroCommande: string) =>
    apiRequest(`/payment/maishapay/initier/${numeroCommande}`, { method: 'POST' }),
  verifier: (numeroCommande: string) =>
    apiRequest(`/payment/maishapay/verifier/${numeroCommande}`),
};

// ============================================
// ADMIN
// ============================================
export const adminAPI = {
  dashboard: () => apiRequest('/admin/dashboard'),

  statistics: {
    get: () => apiRequest('/admin/statistics'),
  },

  products: {
    getAll: () => apiRequest('/admin/products'),
    create: (data: any) => apiRequest('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),
  },

  categories: {
    getAll: () => apiRequest('/admin/categories'),
    create: (data: any) => apiRequest('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => apiRequest(`/admin/categories/${id}`, { method: 'DELETE' }),
  },

  brands: {
    getAll: () => apiRequest('/admin/brands'),
    create: (data: any) => apiRequest('/admin/brands', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => apiRequest(`/admin/brands/${id}`, { method: 'DELETE' }),
  },

  orders: {
    getAll: (params?: any) => {
      const query = new URLSearchParams();
      if (params?.statut) query.append('statut', params.statut);
      if (params?.statut_paiement) query.append('statut_paiement', params.statut_paiement);
      if (params?.search) query.append('search', params.search);
      return apiRequest(`/admin/orders?${query.toString()}`);
    },
    get: (numero: string) => apiRequest(`/admin/orders/${numero}`),
    changeStatus: (id: number, statut: string) =>
      apiRequest(`/admin/orders/${id}/change-status`, { method: 'POST', body: JSON.stringify({ statut }) }),
  },

  users: {
    getAll: () => apiRequest('/admin/users'),
    delete: (id: number) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
    toggleStatus: (id: number) => apiRequest(`/admin/users/${id}/toggle-status`, { method: 'POST' }),
    changeRole: (id: number, role: string) =>
      apiRequest(`/admin/users/${id}/change-role`, { method: 'POST', body: JSON.stringify({ role }) }),
  },

  settings: {
    get: () => apiRequest('/admin/settings'),
    update: (data: any) => apiRequest('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },

  tauxChange: {
    getActif: () => apiRequest('/admin/taux-change/actif'),
    update: (taux: number, note?: string) =>
      apiRequest('/admin/taux-change', { method: 'POST', body: JSON.stringify({ taux, note }) }),
  },

  security: {
    dashboard: () => apiRequest('/admin/security/dashboard'),
    blockIP: (ip: string, reason: string, duration: number) =>
      apiRequest('/admin/security/block-ip', { method: 'POST', body: JSON.stringify({ ip, reason, duration }) }),
    unblockIP: (ip: string) => apiRequest(`/admin/security/unblock-ip/${ip}`, { method: 'DELETE' }),
  },

  reviews: {
    getAll: (params?: any) => {
      const query = new URLSearchParams();
      if (params?.produit_id) query.append('produit_id', params.produit_id);
      if (params?.sort) query.append('sort', params.sort);
      if (params?.page) query.append('page', params.page.toString());
      return apiRequest(`/admin/reviews?${query.toString()}`);
    },
    approuver: (id: number) => apiRequest(`/admin/reviews/${id}/approuver`, { method: 'POST' }),
    desapprouver: (id: number) => apiRequest(`/admin/reviews/${id}/desapprouver`, { method: 'POST' }),
    delete: (id: number) => apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' }),
  },
};

export const adminRegistrationAPI = {
  check: () => apiRequest('/admin-registration/check'),
  register: (data: any) => apiRequest('/admin-registration/register', { method: 'POST', body: JSON.stringify(data) }),
};