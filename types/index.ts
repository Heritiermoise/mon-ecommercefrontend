// types/index.ts

export interface Product {
  id: number;
  nom: string;
  slug: string;
  description: string;
  prix: number;
  prix_remise: number | null;
  quantite_stock: number;
  statut: 'actif' | 'inactif';
  categorie?: Category;
  marque?: Brand;
  images: ProductImage[];
}

export interface ProductImage {
  id: number;
  url_image: string;
  est_principale: boolean;
}

export interface Category {
  id: number;
  nom: string;
  slug: string;
  parent_id?: number | null;
}

export interface Brand {
  id: number;
  nom: string;
}

export interface User {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: 'client' | 'administrateur' | 'super_administrateur';
  statut: 'actif' | 'banni';
}

export interface CartItem {
  id: string;
  nom: string;
  prix: number;
  quantite: number;
  image: string;
  slug: string;
}

export interface Order {
  id: number;
  numero_commande: string;
  montant_total: number;
  statut: 'en_attente' | 'payee' | 'confirmee' | 'en_cours_de_traitement' | 'expediee' | 'livree' | 'annulee';
  statut_paiement: 'non_paye' | 'paye' | 'echoue';
  cree_le: string;
  articles: OrderItem[];
}

export interface OrderItem {
  id: number;
  produit: Product;
  quantite: number;
  prix: number;
}