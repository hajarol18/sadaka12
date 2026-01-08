# 🚀 Guide Simple : Démarrer le Backend

## ❌ Problème Actuel
- "Aucune catégorie disponible" sur le site
- Le backend n'est **PAS démarré**

## ✅ Solution en 3 Étapes

### Étape 1 : Démarrer le Backend

**Ouvrir PowerShell dans le dossier du projet :**
```powershell
.\DEMARRER_BACKEND.ps1
```

**OU manuellement :**
```powershell
cd SadaqahApp_WEBServices-main
.\mvnw.cmd spring-boot:run
```

**⏱️ Attendre 2-3 minutes** jusqu'à voir :
```
Started SadaqahAppApplication in X.XXX seconds
```

---

### Étape 2 : Vérifier que ça Fonctionne

**Dans un AUTRE PowerShell** (pendant que le backend tourne) :
```powershell
.\frontend-web\TEST_ENDPOINTS.ps1
```

**Résultat attendu :**
```
✅ Backend accessible
✅ Catégories: 25 trouvées
✅ Communes: X trouvées
```

---

### Étape 3 : Rafraîchir le Frontend

1. Ouvrir : http://localhost:5173/map
2. Appuyer sur **F5** (rafraîchir)
3. Les catégories et communes devraient s'afficher !

---

## 🔍 Si ça ne Marche Toujours Pas

### Vérifier la Console du Navigateur

1. Ouvrir la console (F12)
2. Regarder l'onglet **Console**
3. Chercher les logs `[getCategories]` et `[getCommunes]`
4. Me dire ce que vous voyez

### Vérifier le Backend

1. Regarder la fenêtre PowerShell où le backend tourne
2. Y a-t-il des erreurs rouges ?
3. Le message "Started SadaqahAppApplication" est-il visible ?

---

## ✅ Configuration Corrigée

- ✅ Mot de passe PostgreSQL : `hajar` (corrigé)
- ✅ Base de données : `Geoinformatique`
- ✅ Port backend : `6000`

**Il faut juste démarrer le backend maintenant !**

