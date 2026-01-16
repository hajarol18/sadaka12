-- Requête pour vérifier spécifiquement si la colonne quantite existe

-- Option 1: Chercher la colonne quantite (ou variantes)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'annonce'
  AND (column_name ILIKE '%quant%' OR column_name ILIKE '%qty%' OR column_name ILIKE '%amount%');

-- Option 2: Lister TOUTES les colonnes (pour voir toutes les 13 colonnes)
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'annonce'
ORDER BY ordinal_position;

-- Option 3: Vérifier directement si on peut sélectionner quantite
SELECT id, titre, quantite 
FROM annonce 
LIMIT 3;
