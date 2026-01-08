-- ============================================
-- Script SQL pour créer un compte Administrateur
-- Projet : SADAKA
-- ============================================

-- Vérifier que la table existe
SELECT 
    'Vérification de la table utilisateur' AS info,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'utilisateur'
        ) THEN '✅ Table existe'
        ELSE '❌ Table n''existe pas'
    END AS statut;

-- Vérifier si la colonne 'role' existe, sinon l'ajouter
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'utilisateur' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE utilisateur ADD COLUMN role VARCHAR(50) DEFAULT 'USER';
        RAISE NOTICE 'Colonne "role" ajoutée à la table utilisateur';
    ELSE
        RAISE NOTICE 'Colonne "role" existe déjà';
    END IF;
END $$;

-- Créer un compte administrateur
-- Note: Utilisez des coordonnées valides (exemple: Casablanca)
INSERT INTO utilisateur (
    nom,
    prenom,
    email,
    userName,
    passWord,
    telephone,
    photo,
    genre,
    role,
    geom
) VALUES (
    'Admin',
    'SADAKA',
    'admin@sadaka.ma',
    'admin@sadaka.ma',
    'Admin123',  -- ⚠️ Changez ce mot de passe en production !
    '0612345678',
    '',
    '',
    'ADMIN',  -- Rôle administrateur
    ST_SetSRID(ST_MakePoint(-7.5898, 33.5731), 4326)  -- Casablanca
)
ON CONFLICT (email) DO UPDATE SET
    role = 'ADMIN',
    passWord = 'Admin123';  -- ⚠️ Changez ce mot de passe en production !

-- Vérifier que le compte admin a été créé
SELECT 
    id,
    nom,
    prenom,
    email,
    userName,
    role,
    CASE 
        WHEN role = 'ADMIN' THEN '✅ Compte administrateur créé'
        ELSE '⚠️ Rôle non défini'
    END AS statut
FROM utilisateur
WHERE email = 'admin@sadaka.ma';

-- Afficher tous les utilisateurs avec leurs rôles
SELECT 
    id,
    nom,
    prenom,
    email,
    role,
    CASE 
        WHEN role = 'ADMIN' THEN '👑 Administrateur'
        WHEN role = 'MODERATOR' THEN '🛡️ Modérateur'
        WHEN role = 'USER' THEN '👤 Utilisateur'
        ELSE '❓ Non défini'
    END AS role_label
FROM utilisateur
ORDER BY role, id;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- 
-- ✅ Compte admin créé avec :
--    Email: admin@sadaka.ma
--    Mot de passe: Admin123
--    Rôle: ADMIN
-- 
-- ⚠️ IMPORTANT: Changez le mot de passe en production !
-- ============================================

