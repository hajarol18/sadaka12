# Modifier la catégorie "maison" sur Neon

## Étapes pour modifier sur Neon

### 1. Se connecter à Neon
- Allez sur https://console.neon.tech
- Connectez-vous à votre projet
- Ouvrez l'éditeur SQL (SQL Editor)

### 2. Vérifier d'abord la catégorie actuelle
```sql
-- Voir toutes les catégories qui contiennent "maison"
SELECT 
    id,
    nom AS categorie_actuelle
FROM categorie
WHERE LOWER(nom) LIKE '%maison%';
```

### 3. Modifier le nom
```sql
-- Modifier "maison" en "Fournitures maison"
UPDATE categorie 
SET nom = 'Fournitures maison'
WHERE LOWER(nom) LIKE '%maison%';
```

### 4. Vérifier le résultat
```sql
-- Voir toutes les catégories après modification
SELECT 
    id,
    nom AS categorie
FROM categorie
WHERE LOWER(nom) LIKE '%maison%' OR nom = 'Fournitures maison'
ORDER BY nom;
```

## Notes importantes
- ✅ Le changement sera immédiat
- ✅ Pas besoin de redémarrer le backend
- ✅ Le frontend affichera automatiquement le nouveau nom au prochain chargement
- ⚠️ Si plusieurs catégories contiennent "maison", elles seront toutes modifiées

## Alternative: Modifier une catégorie spécifique par ID
Si vous connaissez l'ID exact de la catégorie "maison":
```sql
-- Remplacer X par l'ID réel de la catégorie
UPDATE categorie 
SET nom = 'Fournitures maison'
WHERE id = X;
```
