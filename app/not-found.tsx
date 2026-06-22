// app/not-found.tsx
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Numéro 404 */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-bold leading-none bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Page introuvable
          </h2>
          <p className="text-gray-600 text-lg">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          <Link
            href="/produits"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Search className="w-5 h-5" />
            Voir la boutique
          </Link>
        </div>

        {/* Info supplémentaire */}
        <div className="pt-8 border-t">
          <p className="text-sm text-gray-500">
            Vous pouvez aussi utiliser la recherche ou naviguer depuis le menu principal
          </p>
        </div>
      </div>
    </div>
  );
}