-- ============================================
-- Script pour vérifier vos annonces dans PostgreSQL
-- Exécuter ce script dans pgAdmin Query Tool
-- ============================================

-- 1. Voir la structure de la table Annonce
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'Annonce'
ORDER BY ordinal_position;

-- 2. Voir TOUTES les annonces avec leur donnateur_id
SELECT 
    id,
    titre,
    description,
    status,
    donnateur_id,  -- C'est ici que se trouve l'ID de l'utilisateur qui a créé l'annonce
    categorie_id,
    commune_id,
    date,
    quantite
FROM Annonce
ORDER BY id DESC
LIMIT 10;

-- 3. Voir les annonces d'un utilisateur spécifique (remplacez X par votre userId)
-- Pour trouver votre userId, regardez dans la table utilisateur
SELECT 
    id,
    nom,
    prenom,
    email,
    "userName"
FROM utilisateur
ORDER BY id;

-- 4. Voir les annonces d'un utilisateur spécifique (remplacez X par votre userId)
-- Exemple avec userId = 4 (Hajar)
SELECT 
    a.id,
    a.titre,
    a.description,
    a.status,
    a.donnateur_id,
    u.nom || ' ' || u.prenom AS createur,
    u.email,
    a.date,
    a.quantite
FROM Annonce a
LEFT JOIN utilisateur u ON a.donnateur_id = u.id
WHERE a.donnateur_id = 4  -- REMPLACEZ 4 par votre userId
ORDER BY a.id DESC;

-- 5. Compter les annonces par utilisateur
SELECT 
    u.id,
    u.nom || ' ' || u.prenom AS utilisateur,
    u.email,
    COUNT(a.id) AS nombre_annonces,
    SUM(CASE WHEN a.status = 'déclarée' THEN 1 ELSE 0 END) AS en_attente,
    SUM(CASE WHEN a.status = 'approuvée' THEN 1 ELSE 0 END) AS approuvees,
    SUM(CASE WHEN a.status = 'rejetée' THEN 1 ELSE 0 END) AS rejetees
FROM utilisateur u
LEFT JOIN Annonce a ON u.id = a.donnateur_id
GROUP BY u.id, u.nom, u.prenom, u.email
ORDER BY nombre_annonces DESC;

-- 6. Voir les dernières annonces créées (toutes)
SELECT 
    a.id,
    a.titre,
    a.status,
    a.donnateur_id,
    u.nom || ' ' || u.prenom AS createur,
    u.email,
    a.date
FROM Annonce a
LEFT JOIN utilisateur u ON a.donnateur_id = u.id
ORDER BY a.id DESC
LIMIT 10;

