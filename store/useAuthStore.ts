import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
  statut?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  firstLogin: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setFirstLoginDone: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      firstLogin: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => set({ token }),

      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        firstLogin: false,
      }),

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          firstLogin: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('firstLoginDone');
        }
      },

      setFirstLoginDone: () => {
        set({ firstLogin: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('firstLoginDone', 'true');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        firstLogin: state.firstLogin,
      }),
    }
  )
);