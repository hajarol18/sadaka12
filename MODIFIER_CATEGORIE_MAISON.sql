-- ============================================
-- Script SQL pour modifier le nom de la catégorie "maison"
-- Nouveau nom: "Fournitures maison" ou "Équipement maison"
-- ============================================

-- Afficher d'abord la catégorie actuelle pour vérifier
SELECT 
    id,
    nom AS categorie_actuelle
FROM categorie
WHERE LOWER(nom) LIKE '%maison%';

-- ============================================
-- MODIFICATION (choisir une option)
-- ============================================

-- Option 1: Si la catégorie s'appelle exactement "maison" (minuscule)
UPDATE categorie 
SET nom = 'Fournitures maison'
WHERE LOWER(nom) = 'maison';

-- Option 2: Si la catégorie s'appelle "Maison" (avec majuscule)
UPDATE categorie 
SET nom = 'Fournitures maison'
WHERE nom = 'Maison';

-- Option 3: Si la catégorie contient "maison" (n'importe où)
UPDATE categorie 
SET nom = 'Fournitures maison'
WHERE LOWER(nom) LIKE '%maison%';

-- Option 4: Si vous préférez "Équipement maison"
-- UPDATE categorie 
-- SET nom = 'Équipement maison'
-- WHERE LOWER(nom) LIKE '%maison%';

-- ============================================
-- VÉRIFICATION: Afficher toutes les catégories après modification
-- ============================================
SELECT 
    id,
    nom AS categorie
FROM categorie
WHERE LOWER(nom) LIKE '%maison%' OR nom = 'Fournitures maison'
ORDER BY nom;

-- ============================================
-- ALTERNATIVE: Utiliser l'API REST (après redémarrage du backend)
-- ============================================
-- PUT http://localhost:8081/api/v1/categorie/{id}
-- Headers: Content-Type: application/json
-- Body: 
-- {
--   "id": X,
--   "nom": "Fournitures maison",
--   "famille": Y
-- }
-- ============================================
