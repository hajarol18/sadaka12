-- ============================================================
-- SCRIPT POUR CREER DES UTILISATEURS DE TEST DANS POSTGRESQL
-- ============================================================
-- 
-- Ce script crée 3 utilisateurs de test :
-- 1. Admin : admin@sadaka.ma / Admin123
-- 2. Modérateur : moderator@sadaka.ma / Moderator123
-- 3. Utilisateur : user@sadaka.ma / User123
-- 4. Votre compte : hajaroulabasse2003@gmail.com (si besoin)
--
-- IMPORTANT : 
-- - Exécutez ce script dans pgAdmin Query Tool
-- - Connectez-vous à la base de données : geoinformatique (ou neondb selon votre config)
-- - Vérifiez que la table "utilisateur" existe
--
-- ============================================================

-- 1. Vérifier que la table utilisateur existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'utilisateur';

-- 2. Vérifier les colonnes de la table utilisateur
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'utilisateur'
ORDER BY ordinal_position;

-- 3. Ajouter les colonnes userName et passWord si elles n'existent pas
DO $$
BEGIN
    -- Ajouter userName si n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utilisateur' AND column_name = 'username'
    ) THEN
        ALTER TABLE utilisateur ADD COLUMN "userName" VARCHAR(255);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_utilisateur_username ON utilisateur("userName");
    END IF;

    -- Ajouter passWord si n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utilisateur' AND column_name = 'password'
    ) THEN
        ALTER TABLE utilisateur ADD COLUMN "passWord" VARCHAR(255);
    END IF;
END $$;

-- 4. Insérer/Créer les utilisateurs de test
-- Note: Les mots de passe sont en clair (pas de hashage) car le backend compare directement

-- Compte ADMIN
INSERT INTO utilisateur (nom, prenom, email, "userName", "passWord", telephone)
VALUES (
    'Admin',
    'SADAKA',
    'admin@sadaka.ma',
    'admin@sadaka.ma',
    'Admin123',
    0612345678
)
ON CONFLICT (email) DO UPDATE 
SET "userName" = EXCLUDED."userName",
    "passWord" = EXCLUDED."passWord",
    nom = EXCLUDED.nom,
    prenom = EXCLUDED.prenom;

-- Compte MODERATEUR
INSERT INTO utilisateur (nom, prenom, email, "userName", "passWord", telephone)
VALUES (
    'Moderateur',
    'SADAKA',
    'moderator@sadaka.ma',
    'moderator@sadaka.ma',
    'Moderator123',
    0612345679
)
ON CONFLICT (email) DO UPDATE 
SET "userName" = EXCLUDED."userName",
    "passWord" = EXCLUDED."passWord",
    nom = EXCLUDED.nom,
    prenom = EXCLUDED.prenom;

-- Compte UTILISATEUR
INSERT INTO utilisateur (nom, prenom, email, "userName", "passWord", telephone)
VALUES (
    'User',
    'Test',
    'user@sadaka.ma',
    'user@sadaka.ma',
    'User123',
    0612345680
)
ON CONFLICT (email) DO UPDATE 
SET "userName" = EXCLUDED."userName",
    "passWord" = EXCLUDED."passWord",
    nom = EXCLUDED.nom,
    prenom = EXCLUDED.prenom;

-- Compte Hajar (si nécessaire)
INSERT INTO utilisateur (nom, prenom, email, "userName", "passWord", telephone)
VALUES (
    'Hajar',
    'Oulabasse',
    'hajaroulabasse2003@gmail.com',
    'hajaroulabasse2003@gmail.com',
    'Hajar123',  -- CHANGEZ CE MOT DE PASSE !
    0612345681
)
ON CONFLICT (email) DO UPDATE 
SET "userName" = EXCLUDED."userName",
    "passWord" = EXCLUDED."passWord",
    nom = EXCLUDED.nom,
    prenom = EXCLUDED.prenom;

-- 5. Vérifier les utilisateurs créés
SELECT 
    id,
    nom,
    prenom,
    email,
    "userName",
    CASE 
        WHEN "passWord" IS NOT NULL THEN '***' || SUBSTRING("passWord", -3) 
        ELSE 'NULL' 
    END as password_preview,
    telephone
FROM utilisateur
WHERE email IN (
    'admin@sadaka.ma',
    'moderator@sadaka.ma',
    'user@sadaka.ma',
    'hajaroulabasse2003@gmail.com'
)
ORDER BY email;

-- 6. Afficher les mots de passe complets (pour debug uniquement)
-- ATTENTION : Ne partagez pas ce résultat !
SELECT 
    email,
    "userName",
    "passWord" as mot_de_passe,
    'Utilisez ces identifiants pour vous connecter' as instruction
FROM utilisateur
WHERE email IN (
    'admin@sadaka.ma',
    'moderator@sadaka.ma',
    'user@sadaka.ma',
    'hajaroulabasse2003@gmail.com'
)
ORDER BY email;

-- ============================================================
-- INSTRUCTIONS DE CONNEXION
-- ============================================================
-- 
-- Compte ADMIN :
--   Email : admin@sadaka.ma
--   Mot de passe : Admin123
--
-- Compte MODERATEUR :
--   Email : moderator@sadaka.ma
--   Mot de passe : Moderator123
--
-- Compte UTILISATEUR :
--   Email : user@sadaka.ma
--   Mot de passe : User123
--
-- Compte HAJAR :
--   Email : hajaroulabasse2003@gmail.com
--   Mot de passe : Hajar123 (changez-le si besoin)
--
-- ============================================================

