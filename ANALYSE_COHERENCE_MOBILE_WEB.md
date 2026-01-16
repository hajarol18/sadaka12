# ANALYSE DE COHÉRENCE - MOBILE vs WEB vs BACKEND

## ✅ CE QUI EST COHÉRENT

### 1. Structure des Données
- Le mobile gère bien les variantes de champs : `quantite`, `quantity`, `quantiteRestante`, etc.
- Les endpoints utilisés sont les mêmes : `/annonces`, `/categories`, `/communes`, etc.

### 2. Base de Données
- ✅ **POINT COMMUN** : Les deux (web + mobile) utilisent la même base de données Neon
- Toutes les modifications backend affectent les deux applications
- Les corrections de quantités bénéficient aux deux

## ⚠️ PROBLÈMES DE COHÉRENCE IDENTIFIÉS

### 1. URL BACKEND DIFFÉRENTE ⚠️ CRITIQUE

**Mobile :**
```javascript
const API_BASE_URL = 'http://192.168.43.250:6000/api/v1';
```

**Web :**
```javascript
const proxyTarget = 'http://localhost:8081';
```

**Problème :** 
- Le mobile pointe vers le port **6000** sur une IP locale (`192.168.43.250`)
- Le web pointe vers le port **8081** sur `localhost`
- Ces deux configurations pointent probablement vers le **même backend** mais avec des accès différents (réseau local vs localhost)

**Solution :**
- Vérifier que le backend mobile et web pointent vers le même serveur
- Si c'est le même serveur, c'est OK (juste une configuration différente pour accès réseau/localhost)

---

### 2. FORMAT DE CRÉATION D'ANNONCE ⚠️ CRITIQUE

**Mobile :**
```javascript
const res = await apiFetch('/annonces', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },  // ❌ JSON
  body: JSON.stringify(payload),
});
```

**Backend attend :**
```java
@PostMapping("/annonce")
public ResponseEntity<?> addAnnonce(
  @RequestParam("coordinates") List<Double> coordinates,  // ❌ form-urlencoded
  @RequestParam("titre") String titre,
  @RequestParam("quatite") Long quatite,  // ⚠️ Paramètre manquant dans mobile
  // ...
)
```

**Problèmes :**
1. ❌ Le mobile envoie en **JSON** alors que le backend attend **form-urlencoded**
2. ❌ Le mobile n'envoie pas le paramètre `quatite` (quantité)

**Solution nécessaire :**
Modifier le mobile pour envoyer en `form-urlencoded` comme le web, ou créer un endpoint qui accepte JSON.

---

### 3. PARAMÈTRE `quatite` MANQUANT ⚠️ IMPORTANT

**Mobile (`AddAnnouncementScreen.js`) :**
```javascript
const payload = {
  titre: `${selectedCat?.nom || selectedCat?.name || 'Don'} - don`,
  description: formData.description,
  photo: formData.photos[0],
  categorieId: Number(formData.category),
  communeId: Number(formData.commune),
  donnateurId: Number(user.id),
  coordinates: [Number(formData.longitude), Number(formData.latitude)],
  // ❌ MANQUE : quatite
};
```

**Le backend a besoin de :**
- `quatite` (Long) - La quantité
- Format : `application/x-www-form-urlencoded`
- Paramètres séparés, pas un objet JSON

---

## 🔧 CORRECTIONS NÉCESSAIRES

### Correction 1 : Modifier `createAnnouncement` dans le mobile

**Fichier :** `sadaka-mobile-125 (3)/sadaka-mobile-125/src/services/api.js`

**À changer :**
```javascript
export const createAnnouncement = async (data) => {
  const userId = await getStoredUserId();
  if (!userId) throw new Error('Non authentifié');

  // Convertir en form-urlencoded comme le web
  const params = new URLSearchParams();
  params.append('titre', data.titre || '');
  params.append('desc', data.description || '');
  params.append('categorie', (data.categorieId || data.categorie).toString());
  params.append('commune', (data.communeId || data.commune).toString());
  params.append('donnateur', (data.donnateurId || userId).toString());
  params.append('photo', data.photo || '');
  params.append('quatite', (data.quatite || data.quantity || 1).toString());
  
  // Pour les coordonnées (liste)
  if (data.coordinates && Array.isArray(data.coordinates)) {
    params.append('coordinates', data.coordinates[0].toString()); // longitude
    params.append('coordinates', data.coordinates[1].toString()); // latitude
  }

  const res = await apiFetch('/annonce', {  // ⚠️ Note: /annonce pas /annonces
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => null);
    throw new Error(txt || 'Erreur création annonce');
  }

  return await res.json();
};
```

### Correction 2 : Ajouter le champ quantité dans `AddAnnouncementScreen.js`

**Fichier :** `sadaka-mobile-125 (3)/sadaka-mobile-125/src/screens/AddAnnouncementScreen.js`

**À ajouter :**
1. Dans le formulaire, ajouter un champ pour la quantité (ligne 198 environ)
2. Dans le payload (ligne 131 environ), ajouter `quatite: Number(formData.quantity || 1)`

---

## 📋 RÉSUMÉ POUR LA SOUTENANCE

### Points à mentionner :

1. **Architecture partagée** :
   - ✅ Base de données commune (Neon PostgreSQL)
   - ✅ Backend commun (Spring Boot)
   - ✅ Frontends séparés (Web React + Mobile React Native)

2. **Modifications backend** :
   - ✅ Les corrections SQL (table `annonce` en minuscules) bénéficient aux deux
   - ✅ Les corrections de quantités bénéficient aux deux
   - ✅ Même structure de données

3. **Points d'attention** :
   - ⚠️ Format d'envoi différent (JSON vs form-urlencoded) - à harmoniser
   - ⚠️ Paramètre `quatite` manquant côté mobile - à corriger

### Recommandations :

**Pour une meilleure cohérence :**
1. Créer un endpoint backend qui accepte JSON pour le mobile
2. OU modifier le mobile pour utiliser form-urlencoded comme le web
3. Ajouter le champ `quatite` dans le formulaire mobile
4. Harmoniser les URLs backend (même serveur, même configuration)

---

## ✅ CONCLUSION

**Globalement cohérent** pour :
- Structure de données ✅
- Endpoints API ✅
- Base de données partagée ✅

**À améliorer** :
- Format d'envoi (JSON vs form-urlencoded) ⚠️
- Paramètre `quatite` manquant ⚠️

Les corrections backend que tu as faites **bénéficient automatiquement au mobile** car vous partagez la même base de données et le même backend.
