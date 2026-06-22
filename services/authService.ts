// services/authService.ts
import type { User } from '@/types';

// Base de données simulée (à remplacer par l'API backend plus tard)
const mockUsers = [
  {
    id: 1,
    nom: "Admin Principal",
    email: "admin@shoppro.com",
    telephone: "+33612345678",
    mot_de_passe: "admin123",
    role: 'super_administrateur' as const,
    statut: 'actif' as const,
  },
  {
    id: 2,
    nom: "Manager Boutique",
    email: "manager@shoppro.com",
    telephone: "+33623456789",
    mot_de_passe: "manager123",
    role: 'administrateur' as const,
    statut: 'actif' as const,
  },
  {
    id: 3,
    nom: "Jean Dupont",
    email: "client@shoppro.com",
    telephone: "+33634567890",
    mot_de_passe: "client123",
    role: 'client' as const,
    statut: 'actif' as const,
  },
];

interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

interface RegisterData {
  nom: string;
  email: string;
  telephone?: string;
  mot_de_passe: string;
}

export const authService = {
  // Connexion
  login: async (email: string, mot_de_passe: string): Promise<LoginResponse> => {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && 
           u.mot_de_passe === mot_de_passe &&
           u.statut === 'actif'
    );
    
    if (!user) {
      return {
        success: false,
        message: 'Email ou mot de passe incorrect',
      };
    }
    
    // Simulation d'un token JWT
    const token = `mock_token_${user.id}_${Date.now()}`;
    
    const { mot_de_passe: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Connexion réussie',
      user: userWithoutPassword as User,
      token,
    };
  },

  // Inscription
  register: async (data: RegisterData): Promise<LoginResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Vérifier si l'email existe déjà
    const existingUser = mockUsers.find(
      u => u.email.toLowerCase() === data.email.toLowerCase()
    );
    
    if (existingUser) {
      return {
        success: false,
        message: 'Cet email est déjà utilisé',
      };
    }
    
    // Créer le nouvel utilisateur
    const newUser = {
      id: mockUsers.length + 1,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone || '',
      mot_de_passe: data.mot_de_passe,
      role: 'client' as const, // Toujours client par défaut
      statut: 'actif' as const,
    };
    
    mockUsers.push(newUser);
    
    const token = `mock_token_${newUser.id}_${Date.now()}`;
    const { mot_de_passe: _, ...userWithoutPassword } = newUser;
    
    return {
      success: true,
      message: 'Inscription réussie',
      user: userWithoutPassword as User,
      token,
    };
  },

  // Récupérer l'utilisateur actuel
  me: async (token: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Extraire l'ID du token mock
    const match = token.match(/mock_token_(\d+)_/);
    if (!match) return null;
    
    const userId = parseInt(match[1]);
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) return null;
    
    const { mot_de_passe: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },
};