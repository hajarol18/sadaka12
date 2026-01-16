-- Script pour vérifier le nom exact de la colonne quantité dans la table annonce

-- 1. Lister toutes les colonnes de la table annonce
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'annonce'
ORDER BY ordinal_position;

-- 2. Vérifier si la colonne quantite existe et ses valeurs
SELECT 
    id, 
    titre, 
    quantite  -- Si cette colonne existe
FROM annonce 
LIMIT 5;

-- 3. Alternative: Vérifier toutes les colonnes disponibles
SELECT * 
FROM annonce 
LIMIT 1;
