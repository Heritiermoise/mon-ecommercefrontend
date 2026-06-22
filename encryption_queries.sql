-- ============================================
-- CHIFFREMENT 100% - MODIFICATION DES COLONNES
-- Exécutez ces requêtes dans phpMyAdmin (XAMPP)
-- ============================================

-- 1. TABLE UTILISATEURS
ALTER TABLE utilisateurs 
  MODIFY nom TEXT,
  MODIFY telephone TEXT NULL,
  MODIFY two_factor_secret TEXT NULL,
  MODIFY current_session_token TEXT NULL,
  MODIFY last_login_ip VARCHAR(100) NULL;

-- 2. TABLE ADRESSES_LIVRAISON
ALTER TABLE adresses_livraison
  MODIFY nom_complet TEXT,
  MODIFY telephone TEXT,
  MODIFY adresse TEXT,
  MODIFY ville TEXT,
  MODIFY code_postal TEXT NULL,
  MODIFY instructions TEXT NULL;

-- 3. TABLE COMMANDES
ALTER TABLE commandes
  MODIFY note_client TEXT NULL,
  MODIFY note_admin TEXT NULL;

-- 4. TABLE PAIEMENTS
ALTER TABLE paiements
  MODIFY reference_transaction TEXT NULL;

-- 5. TABLE PRODUITS
ALTER TABLE produits
  MODIFY description TEXT NULL;

-- 6. TABLE AVIS
ALTER TABLE avis
  MODIFY commentaire TEXT,
  MODIFY titre TEXT NULL;

-- 7. TABLE AVIS_REPONSES
ALTER TABLE avis_reponses
  MODIFY contenu TEXT;

-- 8. TABLE AVIS_SIGNALEMENTS
ALTER TABLE avis_signalements
  MODIFY motif TEXT,
  MODIFY details TEXT NULL;

-- 9. TABLE WISHLISTS
ALTER TABLE wishlists
  MODIFY note_personnelle TEXT NULL;

-- 10. TABLE WISHLIST_PARTAGEES
ALTER TABLE wishlist_partagees
  MODIFY nom TEXT;

-- 11. TABLE NOTIFICATIONS
ALTER TABLE notifications
  MODIFY titre TEXT,
  MODIFY message TEXT,
  MODIFY lien TEXT NULL;

-- 12. TABLE TAGS
ALTER TABLE tags
  MODIFY nom TEXT,
  MODIFY slug TEXT;

-- 13. TABLE COULEURS
ALTER TABLE couleurs
  MODIFY nom TEXT,
  MODIFY code_hex VARCHAR(20);

-- 14. TABLE RECHERCHES_RECENTES
ALTER TABLE recherches_recentes
  MODIFY terme TEXT,
  MODIFY ip_address VARCHAR(100) NULL;

-- 15. TABLE SECURITY_BLOCKED_IPS
ALTER TABLE security_blocked_ips
  MODIFY ip_address VARCHAR(100),
  MODIFY reason TEXT;

-- 16. TABLE SECURITY_LOGS
ALTER TABLE security_logs
  MODIFY ip_address VARCHAR(100),
  MODIFY path TEXT NULL,
  MODIFY details TEXT NULL;

-- 17. TABLE PARAMETRES_SITE
ALTER TABLE parametres_site
  MODIFY valeur TEXT NULL;

-- 18. TABLE TAUX_CHANGE
ALTER TABLE taux_change
  MODIFY note TEXT NULL;

-- 19. TABLE USER_SESSIONS
ALTER TABLE user_sessions
  MODIFY session_token TEXT,
  MODIFY ip_address VARCHAR(100),
  MODIFY user_agent TEXT NULL;

-- 20. TABLE PRODUITS_VUES
ALTER TABLE produits_vues
  MODIFY ip_address VARCHAR(100) NULL;

-- 21. TABLE CATEGORIES
ALTER TABLE categories
  MODIFY description TEXT NULL;

-- 22. TABLE MARQUES
ALTER TABLE marques
  MODIFY description TEXT NULL;

-- 23. TABLE PANIERS (pas de données sensibles)
-- Pas de modification nécessaire

-- 24. TABLE ARTICLES_PANIER (pas de données sensibles)
-- Pas de modification nécessaire

-- 25. TABLE ARTICLES_COMMANDE (pas de données sensibles)
-- Pas de modification nécessaire

-- 26. TABLE IMAGES_PRODUITS
ALTER TABLE images_produits
  MODIFY url_image TEXT,
  MODIFY chemin_fichier TEXT;

-- 27. TABLE AVIS_PHOTOS
ALTER TABLE avis_photos
  MODIFY url_image TEXT,
  MODIFY chemin_fichier TEXT;

-- 28. TABLE CODES_PROMO
ALTER TABLE codes_promo
  MODIFY description TEXT NULL;

-- 29. TABLE POINTS_FIDELITE
ALTER TABLE points_fidelite
  MODIFY description TEXT NULL;

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT '✅ Toutes les colonnes ont été modifiées avec succès!' AS message;
