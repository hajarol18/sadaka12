-- ============================================
-- CORRECTION SIMPLE DU COMPTE ADMIN
-- Exécuter ce script dans pgAdmin
-- ============================================

-- ÉTAPE 1 : Vérifier l'état actuel
SELECT 
    id,
    email,
    "userName",
    "passWord",
    CASE 
        WHEN "userName" IS NULL THEN '❌ userName NULL'
        WHEN "passWord" IS NULL THEN '❌ passWord NULL'
        WHEN "userName" = 'admin@sadaka.ma' AND "passWord" = 'Admin123' THEN '✅ OK'
        ELSE '⚠️ Valeurs incorrectes'
    END AS statut
FROM utilisateur
WHERE email = 'admin@sadaka.ma';

-- ÉTAPE 2 : Créer les colonnes si elles n'existent pas
DO $$
BEGIN
    -- Créer userName si n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'utilisateur'
          AND column_name = 'userName'
    ) THEN
        ALTER TABLE utilisateur ADD COLUMN "userName" VARCHAR(255);
        RAISE NOTICE 'Colonne userName créée';
    END IF;
    
    -- Créer passWord si n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'utilisateur'
          AND column_name = 'passWord'
    ) THEN
        ALTER TABLE utilisateur ADD COLUMN "passWord" VARCHAR(255);
        RAISE NOTICE 'Colonne passWord créée';
    END IF;
END $$;

-- ÉTAPE 3 : Mettre à jour le compte admin
UPDATE utilisateur 
SET 
    "userName" = 'admin@sadaka.ma',
    "passWord" = 'Admin123'
WHERE email = 'admin@sadaka.ma';

-- ÉTAPE 4 : Vérification finale
SELECT 
    '✅ Compte Admin corrigé' AS message,
    id,
    email,
    "userName",
    "passWord",
    CASE 
        WHEN "userName" = 'admin@sadaka.ma' AND "passWord" = 'Admin123' 
        THEN '✅ Prêt pour connexion'
        ELSE '❌ Vérifier les valeurs'
    END AS statut
FROM utilisateur
WHERE email = 'admin@sadaka.ma';

-- ============================================
-- INFORMATIONS DE CONNEXION
-- ============================================
-- Email/UserName: admin@sadaka.ma
-- Mot de passe: Admin123
-- ============================================
-- IMPORTANT: Redémarrer le backend après cette modification
-- ============================================

