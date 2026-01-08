-- ============================================
-- Script pour vérifier si une annonce a été créée
-- Exécuter ce script dans pgAdmin Query Tool
-- ============================================

-- 1. Voir TOUTES les annonces (peu importe le statut)
SELECT 
    id,
    titre,
    description,
    status,
    donnateur_id,
    categorie_id,
    commune_id,
    date,
    quantite,
    photo
FROM Annonce
ORDER BY id DESC
LIMIT 20;

-- 2. Voir les utilisateurs pour trouver votre userId
SELECT 
    id,
    nom,
    prenom,
    email,
    "userName"
FROM utilisateur
ORDER BY id;

-- 3. Voir les annonces d'un utilisateur spécifique (remplacez X par votre userId)
-- Cette requête devrait retourner TOUTES vos annonces (déclarées, approuvées, rejetées, annulées)
SELECT 
    a.id,
    a.titre,
    a.description,
    a.status,
    a.donnateur_id,
    u.nom || ' ' || u.prenom AS createur,
    u.email,
    a.date,
    a.quantite,
    a.photo
FROM Annonce a
LEFT JOIN utilisateur u ON a.donnateur_id = u.id
WHERE a.donnateur_id = 4  -- REMPLACEZ 4 par votre userId
ORDER BY a.id DESC;

-- 4. Compter les annonces par statut pour votre userId
SELECT 
    status,
    COUNT(*) AS nombre
FROM Annonce
WHERE donnateur_id = 4  -- REMPLACEZ 4 par votre userId
GROUP BY status;

-- 5. Voir la dernière annonce créée (toutes confondues)
SELECT 
    a.id,
    a.titre,
    a.status,
    a.donnateur_id,
    u.email,
    a.date
FROM Annonce a
LEFT JOIN utilisateur u ON a.donnateur_id = u.id
ORDER BY a.id DESC
LIMIT 1;

