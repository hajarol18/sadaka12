-- Script pour vérifier les annonces en cours de traitement (statut 'déclarée' ou 'modifiée')
-- Ces annonces doivent apparaître dans le panel admin

-- 1. Vérifier toutes les annonces avec leur statut
-- Note: Dans Neon, la colonne s'appelle commune_gid (pas commune_id)
SELECT 
    id,
    titre,
    status,
    donnateur_id,
    date,
    categorie_id,
    commune_gid  -- Corrigé: utilise commune_gid au lieu de commune_id
FROM Annonce
ORDER BY id DESC
LIMIT 10;

-- 2. Vérifier spécifiquement les annonces en cours (celles qui doivent apparaître dans admin)
SELECT 
    id,
    titre,
    status,
    donnateur_id,
    date
FROM Annonce
WHERE status = 'déclarée' OR status = 'modifiée'
ORDER BY id DESC;

-- 3. Compter les annonces par statut
SELECT 
    status,
    COUNT(*) as nombre
FROM Annonce
GROUP BY status;

-- 4. Vérifier les annonces créées par un utilisateur spécifique (remplacer l'ID)
-- Trouver l'ID de hajar d'abord
SELECT id, email, nom, prenom FROM utilisateur WHERE email LIKE '%hajar%' OR nom LIKE '%hajar%';

-- Puis vérifier ses annonces (remplacer X par l'ID trouvé ci-dessus)
-- SELECT * FROM Annonce WHERE donnateur_id = X;

-- 5. Vérifier TOUTES les annonces (peu importe le statut) - pour debug
SELECT 
    id,
    titre,
    status,
    donnateur_id,
    date,
    description
FROM Annonce
ORDER BY id DESC;

