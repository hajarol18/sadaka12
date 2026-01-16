-- Script SQL pour corriger les quantités nulles ou à 0 dans les annonces existantes
-- À exécuter sur votre base de données PostgreSQL (Neon ou local)

-- IMPORTANT: Essayez d'abord de trouver le nom exact de la table
-- Option 1: Si la table s'appelle "annonce" (minuscules)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name ILIKE '%annonce%';

-- Une fois que vous connaissez le nom exact, utilisez l'une des options ci-dessous:

-- ============================================
-- OPTION 1: Si la table s'appelle "annonce" (tout en minuscules)
-- ============================================

-- 1. Vérifier les annonces avec quantité NULL ou 0
SELECT id, titre, quantite 
FROM annonce 
WHERE quantite IS NULL OR quantite = 0;

-- 2. Mettre à jour les annonces avec quantité NULL ou 0 à 1 (valeur par défaut)
UPDATE annonce 
SET quantite = 1 
WHERE quantite IS NULL OR quantite = 0;

-- 3. Vérifier le résultat
SELECT id, titre, quantite 
FROM annonce 
ORDER BY id DESC 
LIMIT 10;

-- ============================================
-- OPTION 2: Si la table s'appelle "Annonce" (avec majuscule, entre guillemets)
-- ============================================

-- 1. Vérifier les annonces avec quantité NULL ou 0
-- SELECT id, titre, quantite 
-- FROM "Annonce" 
-- WHERE quantite IS NULL OR quantite = 0;

-- 2. Mettre à jour les annonces avec quantité NULL ou 0 à 1 (valeur par défaut)
-- UPDATE "Annonce" 
-- SET quantite = 1 
-- WHERE quantite IS NULL OR quantite = 0;

-- 3. Vérifier le résultat
-- SELECT id, titre, quantite 
-- FROM "Annonce" 
-- ORDER BY id DESC 
-- LIMIT 10;

-- Note: Si vous souhaitez mettre une quantité différente selon le type d'annonce,
-- vous pouvez utiliser une requête conditionnelle, par exemple:
-- UPDATE "Annonce" 
-- SET quantite = CASE 
--     WHEN categorie_id = 1 THEN 10  -- Exemple pour une catégorie spécifique
--     ELSE 1 
-- END
-- WHERE quantite IS NULL OR quantite = 0;
