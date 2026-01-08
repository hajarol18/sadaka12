-- ============================================================
-- SCRIPT POUR VERIFIER LES UTILISATEURS DANS POSTGRESQL
-- ============================================================
-- 
-- Ce script vérifie les utilisateurs existants dans la table utilisateur
-- Utilisez-le pour voir quels comptes existent et leurs mots de passe
--
-- ============================================================

-- 1. Vérifier tous les utilisateurs avec leurs mots de passe
SELECT 
    id,
    nom,
    prenom,
    email,
    "userName",
    "passWord" as mot_de_passe,
    telephone,
    CASE 
        WHEN "userName" IS NULL OR "passWord" IS NULL THEN '⚠️ INCOMPLET - Ne peut pas se connecter'
        ELSE '✅ Complet'
    END as statut
FROM utilisateur
ORDER BY id;

-- 2. Vérifier uniquement les utilisateurs qui PEUVENT se connecter
-- (qui ont userName ET passWord)
SELECT 
    id,
    nom || ' ' || prenom as nom_complet,
    email,
    "userName",
    "passWord" as mot_de_passe,
    'Utilisez ces identifiants pour vous connecter' as instruction
FROM utilisateur
WHERE "userName" IS NOT NULL 
AND "passWord" IS NOT NULL
ORDER BY email;

-- 3. Vérifier les utilisateurs INCOMPLETS (qui ne peuvent pas se connecter)
SELECT 
    id,
    nom || ' ' || prenom as nom_complet,
    email,
    CASE 
        WHEN "userName" IS NULL THEN '❌ userName manquant'
        ELSE '✅ userName OK'
    END as userName_status,
    CASE 
        WHEN "passWord" IS NULL THEN '❌ passWord manquant'
        ELSE '✅ passWord OK'
    END as passWord_status
FROM utilisateur
WHERE "userName" IS NULL OR "passWord" IS NULL;

-- 4. Compter les utilisateurs
SELECT 
    COUNT(*) as total_utilisateurs,
    COUNT("userName") as avec_username,
    COUNT("passWord") as avec_password,
    COUNT(CASE WHEN "userName" IS NOT NULL AND "passWord" IS NOT NULL THEN 1 END) as peuvent_se_connecter
FROM utilisateur;

-- 5. Si vous voulez voir un utilisateur spécifique (remplacez l'email)
-- SELECT 
--     id,
--     nom,
--     prenom,
--     email,
--     "userName",
--     "passWord",
--     telephone
-- FROM utilisateur
-- WHERE email = 'hajaroulabasse2003@gmail.com';

