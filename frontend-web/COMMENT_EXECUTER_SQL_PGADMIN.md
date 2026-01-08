# 📋 Comment Exécuter les Scripts SQL dans pgAdmin

## ❌ Erreur Commune

**NE PAS faire ça :**
```sql
frontend-web/insert_communes_complet.sql  ❌
```

pgAdmin ne comprend pas les chemins de fichiers comme ça.

---

## ✅ Méthode Correcte

### Option 1 : Ouvrir le Fichier dans pgAdmin (Recommandé)

1. **Dans pgAdmin :**
   - Cliquez sur votre base de données `geoinformatique`
   - Clic droit → **Query Tool**

2. **Dans Query Tool :**
   - Cliquez sur l'icône **📁 Ouvrir un fichier** (en haut à gauche)
   - OU Menu : **File → Open**

3. **Naviguer vers le fichier :**
   - Allez dans : `C:\Users\Hajar\Desktop\helltfo\nouveau\frontend-web\`
   - Sélectionnez : `insert_communes_complet.sql`
   - Cliquez sur **Ouvrir**

4. **Exécuter :**
   - Le contenu du fichier s'affiche dans l'éditeur
   - Cliquez sur **▶ Exécuter** (ou appuyez sur **F5**)

---

### Option 2 : Copier-Coller le Contenu

1. **Ouvrir le fichier SQL** dans un éditeur de texte (Notepad++, VS Code, etc.)
   - Fichier : `frontend-web/insert_communes_complet.sql`

2. **Sélectionner tout** (Ctrl+A) et **Copier** (Ctrl+C)

3. **Dans pgAdmin :**
   - Ouvrir **Query Tool** sur la base `geoinformatique`
   - **Coller** le contenu (Ctrl+V)
   - Cliquez sur **▶ Exécuter** (F5)

---

## 📝 Ordre d'Exécution Recommandé

### 1. D'abord : Communes
- Ouvrir : `insert_communes_complet.sql`
- Exécuter dans pgAdmin
- **Résultat attendu :** 88 communes insérées

### 2. Ensuite : Catégories et Familles
- Ouvrir : `seed_categories.sql`
- Exécuter dans pgAdmin
- **Résultat attendu :** 9 familles + 9 catégories

### 3. Vérification
```sql
-- Vérifier les communes
SELECT COUNT(*) FROM commune;
-- Doit retourner au moins 88

-- Vérifier les catégories
SELECT COUNT(*) FROM categorie;
-- Doit retourner au moins 9

-- Vérifier les familles
SELECT COUNT(*) FROM "Categorie_Famille";
-- Doit retourner au moins 9
```

---

## 🎯 Résumé

**Dans pgAdmin :**
1. ✅ Ouvrir Query Tool
2. ✅ File → Open → Sélectionner le fichier `.sql`
3. ✅ F5 pour exécuter

**PAS :**
- ❌ Taper le chemin du fichier dans l'éditeur
- ❌ Utiliser `\i` (ça marche seulement dans psql)

---

## 💡 Astuce

Si vous avez plusieurs fichiers SQL à exécuter :
1. Ouvrez le premier fichier
2. Exécutez-le (F5)
3. Ouvrez le deuxième fichier (File → Open)
4. Exécutez-le (F5)
5. Et ainsi de suite...

