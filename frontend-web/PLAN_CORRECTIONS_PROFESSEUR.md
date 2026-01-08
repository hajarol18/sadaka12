# 📋 Plan de Corrections - Remarques du Professeur

## ❌ Problèmes Identifiés

### 1. **MapWithList.tsx MANQUANT** (PRIORITÉ ABSOLUE)
- ❌ Le fichier a été supprimé
- ❌ Le prof veut **carte + liste synchronisées** sur une seule page
- ✅ Actuellement : `Map.tsx` (carte seule) existe
- ✅ Actuellement : `Announcements.tsx` (liste seule) existe

### 2. **Dashboard utilise Mock Data** (BONUS)
- ❌ Appelle `/donations` qui n'existe pas dans le backend
- ❌ Pas de Recharts (histogrammes)
- ✅ Doit utiliser `/api/v1/annonces`

### 3. **Page Home pas assez claire** (PRIORITÉ ABSOLUE)
- ⚠️ Manque explication de la cible/utilisateurs
- ⚠️ Boutons pas assez visibles

### 4. **Colonne statut toujours présente** (PRIORITÉ ABSOLUE)
- ⚠️ Le prof veut la retirer/repenser

---

## ✅ Plan d'Action

### Étape 1 : Créer MapWithList.tsx (PRIORITÉ ABSOLUE)
- [ ] Créer page avec layout : Carte (gauche) + Liste (droite)
- [ ] Synchronisation bidirectionnelle :
  - [ ] Cliquer sur item liste → zoom sur carte
  - [ ] Cliquer sur point carte → highlight dans liste
- [ ] Filtres communs (catégorie, date) qui affectent carte ET liste

### Étape 2 : Corriger Dashboard (BONUS)
- [ ] Remplacer `/donations` par `/api/v1/annonces`
- [ ] Ajouter Recharts (BarChart pour catégories, PieChart pour statut)
- [ ] Utiliser les vraies données du backend

### Étape 3 : Améliorer Home (PRIORITÉ ABSOLUE)
- [ ] Ajouter section "À qui s'adresse cette application ?"
- [ ] Ajouter section "Comment ça marche ?" (déjà présent mais améliorer)
- [ ] Rendre boutons "Voir les annonces" et "Publier une annonce" plus visibles

### Étape 4 : Retirer/Repenser colonne statut (PRIORITÉ ABSOLUE)
- [ ] Retirer colonne statut des tableaux
- [ ] Gérer disponibilité par quantité (si quantité = 0 → indisponible)

### Étape 5 : Mettre à jour App.tsx
- [ ] Changer route `/map` pour pointer vers `MapWithList`
- [ ] Garder `/map-old` pour `Map.tsx` (référence)

---

## 🎯 Ordre d'Exécution

1. **MapWithList.tsx** (le plus important)
2. **Dashboard Recharts**
3. **Home améliorée**
4. **Colonne statut**

---

## 📝 Notes

- Le backend n'a pas été modifié
- Tous les endpoints existent déjà
- Il faut juste adapter le frontend

