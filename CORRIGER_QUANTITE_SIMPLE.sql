-- Script SQL SIMPLIFIÉ pour corriger les quantités
-- Essayez cette version en premier (table en minuscules)

-- 1. Vérifier les annonces avec quantité NULL ou 0
SELECT id, titre, quantite 
FROM annonce 
WHERE quantite IS NULL OR quantite = 0;

-- 2. Mettre à jour les annonces avec quantité NULL ou 0 à 1
UPDATE annonce 
SET quantite = 1 
WHERE quantite IS NULL OR quantite = 0;

-- 3. Vérifier le résultat
SELECT id, titre, quantite 
FROM annonce 
ORDER BY id DESC 
LIMIT 10;
