-- ============================================
-- Vérifier le compte admin et corriger si nécessaire
-- ============================================

-- 1. Voir le compte admin
SELECT 
    id,
    nom,
    prenom,
    email,
    telephone,
    "userName",
    "passWord"
FROM utilisateur
WHERE email = 'admin@sadaka.ma';

-- 2. Si userName ou passWord sont NULL, les mettre à jour
UPDATE utilisateur 
SET "userName" = 'admin@sadaka.ma',
    "passWord" = 'Admin123'
WHERE email = 'admin@sadaka.ma'
  AND ("userName" IS NULL OR "passWord" IS NULL);

-- 3. Vérifier que userName et passWord sont bien définis
SELECT 
    id,
    email,
    "userName",
    "passWord",
    CASE 
        WHEN "userName" IS NULL THEN '❌ userName manquant'
        WHEN "passWord" IS NULL THEN '❌ passWord manquant'
        ELSE '✅ Prêt pour connexion'
    END AS statut
FROM utilisateur
WHERE email = 'admin@sadaka.ma';

