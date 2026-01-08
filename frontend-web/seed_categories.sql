-- ============================================
-- Script SQL pour les Catégories et Familles
-- Base de données : geoinformatique
-- Projet : SADAKA
-- ============================================
-- IMPORTANT : Ce script crée d'abord les FAMILLES, puis les CATÉGORIES
-- Une catégorie appartient à une famille (relation hiérarchique)
-- ============================================

-- ============================================
-- ÉTAPE 1 : CRÉER LES FAMILLES DE CATÉGORIES
-- ============================================

-- Vérifier que la séquence existe pour les familles
DO $$
DECLARE
    max_id BIGINT;
BEGIN
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM "Categorie_Famille";
    CREATE SEQUENCE IF NOT EXISTS categorie_famille_id_seq;
    PERFORM setval('categorie_famille_id_seq', GREATEST(max_id, 1));
    ALTER TABLE "Categorie_Famille" 
    ALTER COLUMN id SET DEFAULT nextval('categorie_famille_id_seq');
    ALTER SEQUENCE categorie_famille_id_seq OWNED BY "Categorie_Famille".id;
    RAISE NOTICE 'Séquence categorie_famille_id_seq configurée';
END $$;

-- Insérer les familles
INSERT INTO "Categorie_Famille" (name) VALUES
    ('ALIMENTATION'),
    ('HABILLEMENT'),
    ('SANTE'),
    ('EDUCATION'),
    ('MOBILIER'),
    ('TECHNOLOGIE'),
    ('CULTURE'),
    ('ENFANCE'),
    ('AUTRE')
ON CONFLICT DO NOTHING;

-- ============================================
-- ÉTAPE 2 : CRÉER LES CATÉGORIES
-- ============================================

-- Vérifier que la séquence existe pour les catégories
DO $$
DECLARE
    max_id BIGINT;
BEGIN
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM categorie;
    CREATE SEQUENCE IF NOT EXISTS categorie_id_seq;
    PERFORM setval('categorie_id_seq', GREATEST(max_id, 1));
    ALTER TABLE categorie 
    ALTER COLUMN id SET DEFAULT nextval('categorie_id_seq');
    ALTER SEQUENCE categorie_id_seq OWNED BY categorie.id;
    RAISE NOTICE 'Séquence categorie_id_seq configurée';
END $$;

-- Insérer les catégories avec référence aux familles (par ID)
INSERT INTO categorie (nom, famille) VALUES
    ('Nourriture', (SELECT id FROM "Categorie_Famille" WHERE name = 'ALIMENTATION')),
    ('Vêtements', (SELECT id FROM "Categorie_Famille" WHERE name = 'HABILLEMENT')),
    ('Médicaments', (SELECT id FROM "Categorie_Famille" WHERE name = 'SANTE')),
    ('Éducation', (SELECT id FROM "Categorie_Famille" WHERE name = 'EDUCATION')),
    ('Meubles', (SELECT id FROM "Categorie_Famille" WHERE name = 'MOBILIER')),
    ('Électronique', (SELECT id FROM "Categorie_Famille" WHERE name = 'TECHNOLOGIE')),
    ('Livres', (SELECT id FROM "Categorie_Famille" WHERE name = 'CULTURE')),
    ('Jouets', (SELECT id FROM "Categorie_Famille" WHERE name = 'ENFANCE')),
    ('Autres', (SELECT id FROM "Categorie_Famille" WHERE name = 'AUTRE'))
ON CONFLICT DO NOTHING;

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Afficher les familles créées
SELECT 
    'Total de familles créées :' AS info,
    COUNT(*) AS total
FROM "Categorie_Famille";

SELECT id, name AS famille FROM "Categorie_Famille" ORDER BY id;

-- Afficher le nombre total de catégories
SELECT 
    'Total de catégories insérées :' AS total
FROM categorie;

-- Afficher toutes les catégories avec leur famille
SELECT 
    c.id,
    c.nom AS categorie,
    f.name AS famille
FROM categorie c
LEFT JOIN "Categorie_Famille" f ON c.famille = f.id
ORDER BY f.name, c.nom;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- ✅ Vous devriez avoir au moins 9 catégories
-- ✅ Les catégories sont prêtes pour l'application
-- ============================================

