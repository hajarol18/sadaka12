-- ============================================
-- Script SIMPLE pour créer un compte Admin
-- ============================================

-- ÉTAPE 1 : Ajouter la colonne 'role' si elle n'existe pas
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'USER';

-- ÉTAPE 2 : Créer le compte admin
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
    'Admin123',
    '0612345678',
    '',
    '',
    'ADMIN',
    ST_SetSRID(ST_MakePoint(-7.5898, 33.5731), 4326)
)
ON CONFLICT (email) DO UPDATE SET
    role = 'ADMIN';

-- ÉTAPE 3 : Vérifier
SELECT id, nom, prenom, email, role 
FROM utilisateur 
WHERE email = 'admin@sadaka.ma';

-- ============================================
-- Compte admin créé !
-- Email: admin@sadaka.ma
-- Mot de passe: Admin123
-- ============================================

