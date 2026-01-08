# 🔍 Diagnostic Complet - Communes et Catégories

## ❌ Problème Actuel
- "Aucune commune disponible"
- "Aucune catégorie disponible"
- "Annonces (0)"

---

## ✅ Checklist de Diagnostic

### 1. Vérifier que le Backend est Démarré

**Dans PowerShell :**
```powershell
# Tester si le backend répond
Invoke-WebRequest -Uri "http://localhost:6000/api/v1/categories" -Method GET
Invoke-WebRequest -Uri "http://localhost:6000/api/v1/communes" -Method GET
```

**Si erreur `ECONNREFUSED` :**
```powershell
# Démarrer le backend
.\DEMARRER_BACKEND.ps1
```

---

### 2. Vérifier les Données dans PostgreSQL

**Dans pgAdmin, exécuter :**

```sql
-- Vérifier les communes
SELECT COUNT(*) AS total_communes FROM commune;
SELECT gid, nomcommune, typecommun FROM commune LIMIT 5;

-- Vérifier les catégories
SELECT COUNT(*) AS total_categories FROM categorie;
SELECT id, nom, famille FROM categorie LIMIT 5;

-- Vérifier les familles
SELECT COUNT(*) AS total_familles FROM "Categorie_Famille";
SELECT id, name FROM "Categorie_Famille";
```

**Si les comptes sont à 0 :**
- Exécuter `insert_communes_complet.sql` pour les communes
- Exécuter `seed_categories.sql` pour les catégories

---

### 3. Vérifier les Endpoints Backend

**Dans le navigateur ou Postman :**

1. **Catégories :**
   ```
   http://localhost:6000/api/v1/categories
   ```
   **Résultat attendu :** Tableau JSON avec les catégories

2. **Communes :**
   ```
   http://localhost:6000/api/v1/communes
   ```
   **Résultat attendu :** Tableau JSON avec les communes

---

### 4. Vérifier la Console du Navigateur

**Ouvrir la console (F12) et chercher :**

```
[getCategories] Appel API: /api/v1/categories
[getCategories] Réponse brute: ...
[getCommunes] Appel API: /api/v1/communes
[getCommunes] Réponse brute: ...
```

**Si vous voyez des erreurs :**
- `ECONNREFUSED` → Backend non démarré
- `404` → Endpoint incorrect
- `500` → Erreur serveur (vérifier les logs backend)
- `[]` ou `{value: []}` → Données vides dans PostgreSQL

---

### 5. Vérifier le Proxy Vite

**Dans `vite.config.ts` :**
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:6000',
    changeOrigin: true,
    secure: false
  }
}
```

**Vérifier que le proxy fonctionne :**
- Les requêtes `/api/v1/*` doivent être proxifiées vers `http://localhost:6000/api/v1/*`

---

## 🚨 Solutions selon le Problème

### Problème 1 : Backend non démarré

**Solution :**
```powershell
cd SadaqahApp_WEBServices-main
.\mvnw.cmd spring-boot:run
```

**Attendre le message :**
```
Started SadaqahAppApplication in X.XXX seconds
```

---

### Problème 2 : Données vides dans PostgreSQL

**Solution :**

1. **Communes :**
   ```sql
   -- Exécuter dans pgAdmin
   \i frontend-web/insert_communes_complet.sql
   ```

2. **Catégories :**
   ```sql
   -- Exécuter dans pgAdmin
   \i frontend-web/seed_categories.sql
   ```

---

### Problème 3 : Format de réponse incorrect

**Si le backend retourne `Iterable` au lieu d'un tableau :**

Le frontend gère maintenant automatiquement la conversion, mais vérifiez les logs dans la console.

---

### Problème 4 : Erreur CORS

**Si erreur CORS dans la console :**

Le backend a déjà `@CrossOrigin`, mais vérifiez que le backend est bien démarré.

---

## 📋 Test Rapide

**Exécuter ce script PowerShell :**

```powershell
Write-Host "Test des endpoints backend..." -ForegroundColor Cyan

# Test catégories
try {
    $cat = Invoke-WebRequest -Uri "http://localhost:6000/api/v1/categories" -Method GET
    Write-Host "✅ Catégories: OK" -ForegroundColor Green
    Write-Host "   Réponse: $($cat.Content.Substring(0, [Math]::Min(100, $cat.Content.Length)))" -ForegroundColor Gray
} catch {
    Write-Host "❌ Catégories: ERREUR" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

# Test communes
try {
    $com = Invoke-WebRequest -Uri "http://localhost:6000/api/v1/communes" -Method GET
    Write-Host "✅ Communes: OK" -ForegroundColor Green
    Write-Host "   Réponse: $($com.Content.Substring(0, [Math]::Min(100, $com.Content.Length)))" -ForegroundColor Gray
} catch {
    Write-Host "❌ Communes: ERREUR" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}
```

---

## ✅ Résumé

**Pour que ça fonctionne :**

1. ✅ Backend démarré sur port 6000
2. ✅ Données dans PostgreSQL (communes + catégories)
3. ✅ Frontend utilise les bons endpoints (`/api/v1/*`)
4. ✅ Proxy Vite configuré correctement

**Si tout est OK mais ça ne marche toujours pas :**
- Ouvrir la console (F12)
- Regarder les logs détaillés
- Me dire ce que vous voyez dans les logs

