// components/shop/ProductCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  if (!product) return null;

  const images = product.images || [];
  const mainImage = images.find((img) => img.est_principale) || images[0];
  const hasDiscount = product.prix_remise && product.prix_remise < product.prix;
  const displayPrice = hasDiscount ? product.prix_remise : product.prix;
  const inCart = isInCart(String(product.id));
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: String(product.id),
      nom: product.nom,
      prix: displayPrice,
      quantite: 1,
      image: mainImage?.url_image || '',
      slug: product.slug,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative">
      {/* Bouton wishlist */}
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur rounded-full shadow-md hover:scale-110 transition-transform"
      >
        <Heart
          className={`w-4 h-4 ${
            inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
          }`}
        />
      </button>

      <Link href={`/produits/${product.slug || 'produit'}`} className="relative block aspect-square overflow-hidden bg-gray-100">
        {mainImage && mainImage.url_image ? (
          <Image
            src={mainImage.url_image}
            alt={product.nom || 'Produit'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
            <span className="text-sm">Pas d'image</span>
          </div>
        )}
        
        {hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white hover:bg-red-600">
            -{Math.round(((product.prix - product.prix_remise!) / product.prix) * 100)}%
          </Badge>
        )}
        
        {product.quantite_stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="text-lg">Rupture</Badge>
          </div>
        )}
      </Link>
      
      <CardContent className="p-4 flex-1">
        <p className="text-xs text-gray-500 mb-1">
          {product.categorie?.nom || 'Sans catégorie'}
        </p>
        <Link href={`/produits/${product.slug || 'produit'}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary transition-colors">
            {product.nom || 'Produit sans nom'}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold text-red-600">{displayPrice}€</span>
              <span className="text-sm text-gray-400 line-through">{product.prix}€</span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">{displayPrice}€</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <Button 
          onClick={handleAddToCart}
          className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity" 
          disabled={product.quantite_stock === 0}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Ajouté !
            </>
          ) : inCart ? (
            <>
              <Check className="w-4 h-4" />
              Dans le panier
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Ajouter
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}