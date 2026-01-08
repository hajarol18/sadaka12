-- ============================================
-- Script pour vérifier les annonces de l'utilisateur ID = 1
-- (hajaroulabasse2003@gmail.com)
-- ============================================

-- 1. Voir TOUTES vos annonces (userId = 1)
SELECT 
    a.id,
    a.titre,
    a.description,
    a.status,
    a.donnateur_id,
    a.categorie_id,
    a.commune_id,
    a.date,
    a.quantite,
    a.photo
FROM Annonce a
WHERE a.donnateur_id = 1
ORDER BY a.id DESC;

-- 2. Compter vos annonces par statut
SELECT 
    status,
    COUNT(*) AS nombre
FROM Annonce
WHERE donnateur_id = 1
GROUP BY status;

-- 3. Voir les dernières annonces créées (toutes, pour vérifier)
SELECT 
    a.id,
    a.titre,
    a.status,
    a.donnateur_id,
    u.email AS createur_email,
    a.date
FROM Annonce a
LEFT JOIN utilisateur u ON a.donnateur_id = u.id
ORDER BY a.id DESC
LIMIT 10;

-- 4. Voir toutes les annonces (pour debug)
SELECT 
    id,
    titre,
    status,
    donnateur_id,
    date
FROM Annonce
ORDER BY id DESC
LIMIT 20;

