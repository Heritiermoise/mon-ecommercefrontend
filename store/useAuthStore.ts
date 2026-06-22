import { create } from 'zustand';

interface User {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: 'client' | 'administrateur' | 'super_administrateur';
  statut: 'actif' | 'banni';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  initializeAuth: () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_expiry');
      }
    }
  },

  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const { authAPI } = await import('@/lib/api');
      await authAPI.logout();
    } catch (error) {
      // Continuer même si erreur
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_expiry');
      }
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));

if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}