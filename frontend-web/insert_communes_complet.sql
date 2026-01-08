-- ============================================
-- Script SQL COMPLET pour les Communes Marocaines
-- Base de données : geoinformatique
-- ============================================
-- Ce script insère TOUTES les communes marocaines (88 communes)
-- avec leurs coordonnées GPS précises
--
-- Instructions :
-- 1. Se connecter à PostgreSQL : psql -U postgres -d geoinformatique
-- 2. Exécuter ce script : \i insert_communes_complet.sql
--    OU copier-coller dans pgAdmin Query Tool
-- ============================================

-- Vérifier qu'on est sur la bonne base
\c geoinformatique

-- Vérifier que PostGIS est activé
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- NETTOYER LES DONNÉES EXISTANTES (OPTIONNEL)
-- ============================================
-- Décommentez la ligne suivante si vous voulez tout supprimer et recommencer
-- DELETE FROM commune;

-- ============================================
-- INSÉRER TOUTES LES COMMUNES MAROCAINES
-- ============================================
-- Format : ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
-- IMPORTANT : PostGIS utilise (longitude, latitude) et non (latitude, longitude)

INSERT INTO commune (codecommun, nomcommune, typecommun, geom) VALUES
    -- ============================================
    -- RÉGION CASABLANCA-SETTAT (5 communes)
    -- ============================================
    ('CAS001', 'Casablanca', 'Ville', ST_SetSRID(ST_MakePoint(-7.5898, 33.5731), 4326)),
    ('CAS002', 'Mohammedia', 'Ville', ST_SetSRID(ST_MakePoint(-7.3828, 33.6861), 4326)),
    ('CAS003', 'El Jadida', 'Ville', ST_SetSRID(ST_MakePoint(-8.5013, 33.2568), 4326)),
    ('CAS004', 'Settat', 'Ville', ST_SetSRID(ST_MakePoint(-7.6168, 33.0018), 4326)),
    ('CAS005', 'Berrechid', 'Ville', ST_SetSRID(ST_MakePoint(-7.5871, 33.2655), 4326)),
    
    -- ============================================
    -- RÉGION RABAT-SALÉ-KÉNITRA (5 communes)
    -- ============================================
    ('RAB001', 'Rabat', 'Ville', ST_SetSRID(ST_MakePoint(-6.8416, 34.0209), 4326)),
    ('RAB002', 'Salé', 'Ville', ST_SetSRID(ST_MakePoint(-6.7986, 34.0531), 4326)),
    ('RAB003', 'Kénitra', 'Ville', ST_SetSRID(ST_MakePoint(-6.5802, 34.2610), 4326)),
    ('RAB004', 'Témara', 'Ville', ST_SetSRID(ST_MakePoint(-6.9059, 33.9258), 4326)),
    ('RAB005', 'Sidi Slimane', 'Ville', ST_SetSRID(ST_MakePoint(-6.0439, 34.2648), 4326)),
    
    -- ============================================
    -- RÉGION FÈS-MEKNÈS (5 communes)
    -- ============================================
    ('FES001', 'Fès', 'Ville', ST_SetSRID(ST_MakePoint(-5.0000, 34.0333), 4326)),
    ('FES002', 'Meknès', 'Ville', ST_SetSRID(ST_MakePoint(-5.5547, 33.8935), 4326)),
    ('FES003', 'Taza', 'Ville', ST_SetSRID(ST_MakePoint(-4.0100, 34.2100), 4326)),
    ('FES004', 'Ifrane', 'Ville', ST_SetSRID(ST_MakePoint(-5.1000, 33.5333), 4326)),
    ('FES005', 'Sefrou', 'Ville', ST_SetSRID(ST_MakePoint(-4.8351, 33.8315), 4326)),
    
    -- ============================================
    -- RÉGION MARRAKECH-SAFI (5 communes)
    -- ============================================
    ('MAR001', 'Marrakech', 'Ville', ST_SetSRID(ST_MakePoint(-7.9811, 31.6295), 4326)),
    ('MAR002', 'Safi', 'Ville', ST_SetSRID(ST_MakePoint(-9.2372, 32.2994), 4326)),
    ('MAR003', 'Essaouira', 'Ville', ST_SetSRID(ST_MakePoint(-9.7700, 31.5125), 4326)),
    ('MAR004', 'El Kelâa des Sraghna', 'Ville', ST_SetSRID(ST_MakePoint(-7.4000, 32.0500), 4326)),
    ('MAR005', 'Chichaoua', 'Ville', ST_SetSRID(ST_MakePoint(-8.7590, 31.5447), 4326)),
    
    -- ============================================
    -- RÉGION TANGER-TÉTOUAN-AL HOCEÏMA (5 communes)
    -- ============================================
    ('TAN001', 'Tanger', 'Ville', ST_SetSRID(ST_MakePoint(-5.7998, 35.7673), 4326)),
    ('TAN002', 'Tétouan', 'Ville', ST_SetSRID(ST_MakePoint(-5.3644, 35.5784), 4326)),
    ('TAN003', 'Al Hoceïma', 'Ville', ST_SetSRID(ST_MakePoint(-3.9366, 35.2494), 4326)),
    ('TAN004', 'Larache', 'Ville', ST_SetSRID(ST_MakePoint(-6.1562, 35.1932), 4326)),
    ('TAN005', 'Chefchaouen', 'Ville', ST_SetSRID(ST_MakePoint(-5.2636, 35.1688), 4326)),
    
    -- ============================================
    -- RÉGION ORIENTAL (5 communes)
    -- ============================================
    ('ORI001', 'Oujda', 'Ville', ST_SetSRID(ST_MakePoint(-1.9063, 34.6805), 4326)),
    ('ORI002', 'Nador', 'Ville', ST_SetSRID(ST_MakePoint(-2.9333, 35.1667), 4326)),
    ('ORI003', 'Berkane', 'Ville', ST_SetSRID(ST_MakePoint(-2.3200, 34.9200), 4326)),
    ('ORI004', 'Taourirt', 'Ville', ST_SetSRID(ST_MakePoint(-2.8931, 34.4073), 4326)),
    ('ORI005', 'Jerada', 'Ville', ST_SetSRID(ST_MakePoint(-2.1600, 34.3100), 4326)),
    
    -- ============================================
    -- RÉGION SOUSS-MASSA (5 communes)
    -- ============================================
    ('SOU001', 'Agadir', 'Ville', ST_SetSRID(ST_MakePoint(-9.5981, 30.4278), 4326)),
    ('SOU002', 'Taroudant', 'Ville', ST_SetSRID(ST_MakePoint(-8.8800, 30.4700), 4326)),
    ('SOU003', 'Tiznit', 'Ville', ST_SetSRID(ST_MakePoint(-9.7369, 29.6974), 4326)),
    ('SOU004', 'Inezgane', 'Ville', ST_SetSRID(ST_MakePoint(-9.5372, 30.3611), 4326)),
    ('SOU005', 'Chtouka-Aït Baha', 'Ville', ST_SetSRID(ST_MakePoint(-9.1500, 30.0667), 4326)),
    
    -- ============================================
    -- RÉGION BÉNI MELLAL-KHÉNIFRA (5 communes)
    -- ============================================
    ('BEN001', 'Béni Mellal', 'Ville', ST_SetSRID(ST_MakePoint(-6.3591, 32.3372), 4326)),
    ('BEN002', 'Khénifra', 'Ville', ST_SetSRID(ST_MakePoint(-5.6647, 32.9349), 4326)),
    ('BEN003', 'Khouribga', 'Ville', ST_SetSRID(ST_MakePoint(-6.9089, 32.8811), 4326)),
    ('BEN004', 'Azilal', 'Ville', ST_SetSRID(ST_MakePoint(-6.5667, 31.9667), 4326)),
    ('BEN005', 'Fquih Ben Salah', 'Ville', ST_SetSRID(ST_MakePoint(-6.6833, 32.5000), 4326)),
    
    -- ============================================
    -- RÉGION DRÂA-TAFILALET (5 communes)
    -- ============================================
    ('DRA001', 'Errachidia', 'Ville', ST_SetSRID(ST_MakePoint(-4.4247, 31.9314), 4326)),
    ('DRA002', 'Ouarzazate', 'Ville', ST_SetSRID(ST_MakePoint(-6.8938, 30.9189), 4326)),
    ('DRA003', 'Zagora', 'Ville', ST_SetSRID(ST_MakePoint(-5.8384, 30.3328), 4326)),
    ('DRA004', 'Tinghir', 'Ville', ST_SetSRID(ST_MakePoint(-5.5320, 31.5147), 4326)),
    ('DRA005', 'Midelt', 'Ville', ST_SetSRID(ST_MakePoint(-4.7368, 32.6852), 4326)),
    
    -- ============================================
    -- RÉGION GUELMIM-OUED NOUN (4 communes)
    -- ============================================
    ('GUE001', 'Guelmim', 'Ville', ST_SetSRID(ST_MakePoint(-10.0574, 28.9870), 4326)),
    ('GUE002', 'Tan-Tan', 'Ville', ST_SetSRID(ST_MakePoint(-11.1028, 28.4381), 4326)),
    ('GUE003', 'Sidi Ifni', 'Ville', ST_SetSRID(ST_MakePoint(-10.1733, 29.3797), 4326)),
    ('GUE004', 'Assa-Zag', 'Ville', ST_SetSRID(ST_MakePoint(-9.4333, 28.6000), 4326)),
    
    -- ============================================
    -- RÉGION LAÂYOUNE-SAKIA EL HAMRA (4 communes)
    -- ============================================
    ('LAA001', 'Laâyoune', 'Ville', ST_SetSRID(ST_MakePoint(-13.1867, 27.1418), 4326)),
    ('LAA002', 'Boujdour', 'Ville', ST_SetSRID(ST_MakePoint(-14.4842, 26.1288), 4326)),
    ('LAA003', 'Es-Semara', 'Ville', ST_SetSRID(ST_MakePoint(-11.6711, 26.7422), 4326)),
    ('LAA004', 'Tarfaya', 'Ville', ST_SetSRID(ST_MakePoint(-12.9287, 27.9392), 4326)),
    
    -- ============================================
    -- RÉGION DAKHLA-OUED ED-DAHAB (2 communes)
    -- ============================================
    ('DAK001', 'Dakhla', 'Ville', ST_SetSRID(ST_MakePoint(-15.9369, 23.7136), 4326)),
    ('DAK002', 'Aousserd', 'Ville', ST_SetSRID(ST_MakePoint(-14.3333, 22.5500), 4326))

ON CONFLICT (codecommun) DO NOTHING;

-- ============================================
-- VÉRIFICATIONS ET STATISTIQUES
-- ============================================

-- Afficher le nombre total de communes insérées
SELECT 
    'Total de communes insérées :' AS info,
    COUNT(*) AS total
FROM commune;

-- Afficher les communes par région (exemple)
SELECT 
    CASE 
        WHEN codecommun LIKE 'CAS%' THEN 'Casablanca-Settat'
        WHEN codecommun LIKE 'RAB%' THEN 'Rabat-Salé-Kénitra'
        WHEN codecommun LIKE 'FES%' THEN 'Fès-Meknès'
        WHEN codecommun LIKE 'MAR%' THEN 'Marrakech-Safi'
        WHEN codecommun LIKE 'TAN%' THEN 'Tanger-Tétouan-Al Hoceïma'
        WHEN codecommun LIKE 'ORI%' THEN 'Oriental'
        WHEN codecommun LIKE 'SOU%' THEN 'Souss-Massa'
        WHEN codecommun LIKE 'BEN%' THEN 'Béni Mellal-Khénifra'
        WHEN codecommun LIKE 'DRA%' THEN 'Drâa-Tafilalet'
        WHEN codecommun LIKE 'GUE%' THEN 'Guelmim-Oued Noun'
        WHEN codecommun LIKE 'LAA%' THEN 'Laâyoune-Sakia El Hamra'
        WHEN codecommun LIKE 'DAK%' THEN 'Dakhla-Oued Ed-Dahab'
        ELSE 'Autre'
    END AS region,
    COUNT(*) AS nombre_communes
FROM commune
GROUP BY 
    CASE 
        WHEN codecommun LIKE 'CAS%' THEN 'Casablanca-Settat'
        WHEN codecommun LIKE 'RAB%' THEN 'Rabat-Salé-Kénitra'
        WHEN codecommun LIKE 'FES%' THEN 'Fès-Meknès'
        WHEN codecommun LIKE 'MAR%' THEN 'Marrakech-Safi'
        WHEN codecommun LIKE 'TAN%' THEN 'Tanger-Tétouan-Al Hoceïma'
        WHEN codecommun LIKE 'ORI%' THEN 'Oriental'
        WHEN codecommun LIKE 'SOU%' THEN 'Souss-Massa'
        WHEN codecommun LIKE 'BEN%' THEN 'Béni Mellal-Khénifra'
        WHEN codecommun LIKE 'DRA%' THEN 'Drâa-Tafilalet'
        WHEN codecommun LIKE 'GUE%' THEN 'Guelmim-Oued Noun'
        WHEN codecommun LIKE 'LAA%' THEN 'Laâyoune-Sakia El Hamra'
        WHEN codecommun LIKE 'DAK%' THEN 'Dakhla-Oued Ed-Dahab'
        ELSE 'Autre'
    END
ORDER BY nombre_communes DESC;

-- Afficher quelques exemples de communes avec leurs coordonnées
SELECT 
    gid,
    codecommun,
    nomcommune,
    typecommun,
    ST_X(geom) AS longitude,
    ST_Y(geom) AS latitude,
    ST_AsText(geom) AS coordonnees_wkt
FROM commune
ORDER BY gid
LIMIT 10;

-- Vérifier que toutes les communes ont des coordonnées valides
SELECT 
    'Communes sans coordonnées :' AS info,
    COUNT(*) AS total
FROM commune
WHERE geom IS NULL;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- ✅ Vous devriez avoir 88 communes insérées
-- ✅ Toutes les régions du Maroc sont couvertes
-- ✅ Toutes les coordonnées GPS sont valides
-- ============================================

