# RAPPORT TECHNIQUE - APPLICATION WEB SADAKA

## Plateforme de Gestion des Dons avec Système d'Information Géographique (SIG)

---

**Version:** 1.0  
**Date:** 2024  
**Auteur:** Équipe de Développement SADAKA  
**Type:** Application Web Full-Stack

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture Technique](#2-architecture-technique)
3. [Structure du Code](#3-structure-du-code)
4. [Fonctionnalités Détaillées](#4-fonctionnalités-détaillées)
5. [Système d'Authentification](#5-système-dauthentification)
6. [Gestion des Annonces](#6-gestion-des-annonces)
7. [Système de Géolocalisation (SIG)](#7-système-de-géolocalisation-sig)
8. [Dashboard et Statistiques](#8-dashboard-et-statistiques)
9. [Espace Administrateur](#9-espace-administrateur)
10. [Sécurité et Validation](#10-sécurité-et-validation)
11. [API et Services](#11-api-et-services)
12. [Interface Utilisateur](#12-interface-utilisateur)
13. [Gestion des Images](#13-gestion-des-images)
14. [Système de Cooldown](#14-système-de-cooldown)
15. [Annexes Techniques](#15-annexes-techniques)

---

## 1. VUE D'ENSEMBLE

### 1.1 Description du Projet

**SADAKA** est une plateforme web collaborative permettant de connecter les donateurs avec les bénéficiaires. L'application intègre un système d'information géographique (SIG) pour la localisation des dons et utilise des technologies modernes pour offrir une expérience utilisateur optimale.

### 1.2 Objectifs Principaux

- Faciliter la mise en relation entre donateurs et bénéficiaires
- Géolocaliser les annonces de dons sur une carte interactive
- Gérer le cycle de vie complet des annonces (création, validation, attribution)
- Fournir des statistiques et analyses via un dashboard
- Assurer la sécurité et la validation des transactions

### 1.3 Technologies Utilisées

#### Frontend
- **React 18.3.1** - Bibliothèque JavaScript pour l'interface utilisateur
- **TypeScript 5.6.3** - Typage statique pour JavaScript
- **Vite 5.4.10** - Build tool et serveur de développement
- **Ant Design 5.20.2** - Framework UI complet
- **React Router 6.26.2** - Routage côté client
- **React Leaflet 4.2.1** - Intégration de cartes interactives
- **Recharts 3.6.0** - Bibliothèque de graphiques
- **Axios 1.7.7** - Client HTTP pour les appels API

#### Backend
- **Spring Boot** - Framework Java pour applications web
- **PostgreSQL** - Base de données relationnelle
- **PostGIS** - Extension géospatiale pour PostgreSQL
- **Hibernate/JPA** - ORM pour la persistance des données
- **Maven** - Gestionnaire de dépendances

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  Port: 5173                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   Services   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Context    │  │    Utils     │  │    Types     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Spring Boot)                        │
│  Port: 8080                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │   Services   │  │  Repositories│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │    Models    │  │   Utils      │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JDBC
                            │
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DONNÉES (PostgreSQL + PostGIS)         │
│  Tables: utilisateurs, annonces, demandes, categories,      │
│          communes, admins                                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flux de Données

1. **Requête Utilisateur** → Frontend (React)
2. **Appel API** → Service (Axios)
3. **Requête HTTP** → Backend (Spring Boot)
4. **Traitement Métier** → Service Layer
5. **Accès Base de Données** → Repository (JPA)
6. **Réponse** → Retour au Frontend
7. **Mise à Jour UI** → React State Management

---

## 3. STRUCTURE DU CODE

### 3.1 Structure Frontend

```
frontend-web/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── AppLayout.tsx    # Layout principal avec navigation
│   │   ├── ErrorBoundary.tsx # Gestion des erreurs React
│   │   ├── MapView.tsx      # Composant carte simplifié
│   │   ├── ProtectedRoute.tsx # Protection des routes
│   │   └── RequestButton.tsx # Bouton de demande
│   │
│   ├── pages/               # Pages de l'application
│   │   ├── Home.tsx         # Page d'accueil
│   │   ├── Login.tsx        # Connexion
│   │   ├── Register.tsx     # Inscription
│   │   ├── Announcements.tsx # Liste des annonces
│   │   ├── CreateAnnouncement.tsx # Création d'annonce
│   │   ├── MyAnnouncements.tsx # Mes annonces
│   │   ├── Map.tsx          # Carte simple
│   │   ├── MapWithList.tsx  # Carte + Liste synchronisées
│   │   ├── Dashboard.tsx    # Tableau de bord
│   │   ├── Admin.tsx        # Espace administrateur
│   │   ├── Newsletter.tsx  # Newsletter
│   │   ├── NotFound.tsx    # Page 404
│   │   └── Unauthorized.tsx # Page 403
│   │
│   ├── services/            # Services API
│   │   ├── annonceService.ts    # Gestion des annonces
│   │   ├── categoryService.ts   # Gestion des catégories
│   │   ├── communeService.ts    # Gestion des communes
│   │   ├── demandeService.ts    # Gestion des demandes
│   │   └── utilisateurService.ts # Gestion des utilisateurs
│   │
│   ├── context/             # Context React
│   │   └── AuthContext.tsx  # Contexte d'authentification
│   │
│   ├── utils/               # Utilitaires
│   │   ├── api.ts           # Configuration Axios
│   │   ├── mapHelpers.ts    # Helpers pour les cartes
│   │   ├── roles.ts         # Définition des rôles
│   │   └── mock.ts          # Données mock (dev)
│   │
│   ├── types/               # Types TypeScript
│   │   ├── api.ts           # Types API
│   │   └── leaflet.d.ts     # Types Leaflet
│   │
│   ├── data/                # Données statiques
│   │   └── moroccanCommunes.ts # Communes marocaines
│   │
│   ├── styles/              # Styles globaux
│   │   └── index.css        # CSS principal
│   │
│   ├── App.tsx              # Composant racine
│   └── main.tsx             # Point d'entrée
│
├── public/                  # Fichiers statiques
├── package.json             # Dépendances npm
├── tsconfig.json            # Configuration TypeScript
└── vite.config.ts           # Configuration Vite
```

### 3.2 Structure Backend

```
SadaqahApp_WEBServices-main/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/sadaqah/sadaqah/
│   │   │       ├── controller/      # Contrôleurs REST
│   │   │       │   ├── AnnonceController.java
│   │   │       │   ├── DemandeController.java
│   │   │       │   ├── UtilisateurController.java
│   │   │       │   ├── CategorieController.java
│   │   │       │   └── CommuneController.java
│   │   │       │
│   │   │       ├── service/        # Services métier
│   │   │       │   ├── AnnonceService.java
│   │   │       │   ├── DemandeService.java
│   │   │       │   └── UtilisateurService.java
│   │   │       │
│   │   │       ├── repo/            # Repositories JPA
│   │   │       │   ├── IAnnonce.java
│   │   │       │   ├── IDemande.java
│   │   │       │   └── IUtilisateur.java
│   │   │       │
│   │   │       ├── model/           # Modèles JPA
│   │   │       │   ├── Annonce.java
│   │   │       │   ├── Demande.java
│   │   │       │   ├── Utilisateur.java
│   │   │       │   └── Categorie.java
│   │   │       │
│   │   │       └── utils/            # Utilitaires
│   │   │
│   │   └── resources/
│   │       └── application.properties # Configuration
│   │
│   └── test/                 # Tests unitaires
│
├── images_annonce/           # Images des annonces
├── images_user/              # Images de profil
├── pom.xml                   # Configuration Maven
└── mvnw.cmd                  # Maven Wrapper (Windows)
```

---

## 4. FONCTIONNALITÉS DÉTAILLÉES

### 4.1 Page d'Accueil (Home.tsx)

**Localisation:** `frontend-web/src/pages/Home.tsx`

#### Fonctionnalités

1. **Section Hero**
   - Titre principal "Plateforme de Gestion des Dons"
   - Description de l'application
   - Présentation de SADAKA

2. **Présentation des Utilisateurs**
   - **Donateurs:** Section dédiée avec icône et description
   - **Bénéficiaires:** Section pour ceux qui recherchent des dons
   - **Associations:** Section pour les organisations caritatives

3. **Processus en 4 Étapes**
   - Étape 1: Créer une annonce
   - Étape 2: Validation par l'équipe
   - Étape 3: Mise en relation
   - Étape 4: Don effectué

4. **Statistiques**
   - Dons actifs
   - Communes couvertes
   - Familles aidées
   - Catégories disponibles

5. **Actions Principales**
   - Bouton "Voir les annonces"
   - Bouton "Publier une annonce"
   - Bouton "Voir sur la carte"

6. **Avantages de la Plateforme**
   - Gratuit et accessible
   - Sécurisé et validé
   - Géolocalisation
   - Communauté solidaire

#### Code Structure

```typescript
// Composants utilisés
- Card, Col, Row, Statistic, Typography, Button, Space, Divider
- Icons: HeartOutlined, GlobalOutlined, BarChartOutlined, GiftOutlined, etc.

// Structure
- Hero Section
- User Types Section (3 colonnes)
- Process Section (4 étapes)
- Statistics Section (4 cartes)
- Action Buttons Section
- Advantages Section
```

---

### 4.2 Authentification

#### 4.2.1 Inscription (Register.tsx)

**Localisation:** `frontend-web/src/pages/Register.tsx`

##### Fonctionnalités

1. **Formulaire d'Inscription**
   - Nom (validation: min 2 caractères)
   - Prénom (validation: min 2 caractères)
   - Téléphone (format marocain: `^0\d{9}$`)
   - Email (validation format email)
   - Confirmation email (doit correspondre)
   - Mot de passe (min 8 caractères, majuscule, minuscule, chiffre)
   - Confirmation mot de passe

2. **Upload Photo de Profil**
   - Composant `Upload` Ant Design
   - Formats acceptés: PNG, JPG, JPEG
   - Taille maximale: 2MB
   - Aperçu avant upload
   - Validation côté client

3. **Captcha Arithmétique**
   - Génération aléatoire de deux nombres (1-9)
   - Validation de la réponse
   - Bouton de régénération
   - Protection contre les bots

4. **Gestion des Erreurs**
   - Messages d'erreur contextuels
   - Validation en temps réel
   - Gestion des erreurs réseau

##### Code Structure

```typescript
// State Management
const [fileList, setFileList] = useState<UploadFile[]>([]);
const [previewOpen, setPreviewOpen] = useState(false);
const [previewImage, setPreviewImage] = useState('');
const [captcha, setCaptcha] = useState({ first: number, second: number });

// Validation Rules
- firstName: required, min 2 chars
- lastName: required, min 2 chars
- phone: required, pattern ^0\d{9}$
- email: required, type email
- confirmEmail: required, must match email
- password: required, min 8 chars, pattern
- captchaAnswer: required, must match sum
```

##### Flux d'Inscription

1. Utilisateur remplit le formulaire
2. Validation côté client
3. Si image présente → création FormData
4. Appel API `POST /api/v1/utilisateur`
5. Upload image si présente
6. Connexion automatique après inscription
7. Redirection vers la page d'accueil

#### 4.2.2 Connexion (Login.tsx)

**Localisation:** `frontend-web/src/pages/Login.tsx`

##### Fonctionnalités

1. **Connexion Utilisateur Standard**
   - Email
   - Mot de passe
   - Bouton "Se connecter"

2. **Connexion Administrateur**
   - Nom d'utilisateur
   - Mot de passe
   - Bouton "Connexion Admin"

3. **Gestion des Erreurs**
   - Messages d'erreur clairs
   - Redirection en cas de succès

#### 4.2.3 Contexte d'Authentification (AuthContext.tsx)

**Localisation:** `frontend-web/src/context/AuthContext.tsx`

##### Fonctionnalités

1. **Gestion de l'État**
   - Token stocké dans localStorage
   - Utilisateur connecté
   - Rôles et permissions

2. **Méthodes Principales**
   - `login(email, password)` - Connexion utilisateur
   - `loginAdmin(userName, password)` - Connexion admin
   - `register(payload)` - Inscription avec upload image
   - `logout()` - Déconnexion

3. **Gestion des Rôles**
   - `UserRole.ADMIN` - Administrateur
   - `UserRole.MODERATOR` - Modérateur
   - `UserRole.USER` - Utilisateur standard

4. **Permissions**
   - `hasPermission(permission)` - Vérification de permission
   - `isAdmin`, `isModerator`, `isUser` - Helpers de rôle

##### Structure du Token

```typescript
// Token utilisateur: base64(userId:email)
// Token admin: base64(admin:adminId:email)
// Stockage: localStorage key 'sadaka_web_token'
```

---

### 4.3 Gestion des Annonces

#### 4.3.1 Liste des Annonces (Announcements.tsx)

**Localisation:** `frontend-web/src/pages/Announcements.tsx`

##### Fonctionnalités

1. **Affichage des Annonces**
   - Tableau avec colonnes: Photo, Titre, Catégorie, Quantité, Commune, Date, Statut, Actions
   - Pagination automatique
   - Tri par colonnes

2. **Filtres**
   - Recherche par texte (titre, description)
   - Filtre par catégorie
   - Filtre par commune (multi-sélection)
   - Filtre par date (RangePicker)

3. **Détails d'Annonce**
   - Drawer latéral avec informations complètes
   - Photo de l'annonce (si disponible)
   - Informations du donateur (nom, email, téléphone)
   - Bouton "Faire une demande"

4. **Gestion des Images**
   - Résolution d'URL d'image (absolue, relative, endpoint API)
   - Affichage conditionnel (pas de placeholder si absence)
   - Aperçu en modal

##### Code Structure

```typescript
// State
const [data, setData] = useState<Annonce[]>([]);
const [filteredData, setFilteredData] = useState<Annonce[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
const [communes, setCommunes] = useState<Commune[]>([]);
const [selected, setSelected] = useState<Annonce | null>(null);

// Fonction de résolution d'URL
const resolvePhotoUrl = (photo?: string, annonceId?: number) => {
  // Gestion des URLs absolues, relatives, et endpoint API
  // Retourne /api/v1/annonce/{id}/image si disponible
};
```

#### 4.3.2 Création d'Annonce (CreateAnnouncement.tsx)

**Localisation:** `frontend-web/src/pages/CreateAnnouncement.tsx`

##### Fonctionnalités

1. **Formulaire de Création**
   - Titre (requis)
   - Description (requis)
   - Catégorie (sélection depuis backend)
   - Commune (sélection depuis backend)
   - Quantité (nombre entier)
   - Date d'expiration (optionnel)
   - Photo (URL ou upload)

2. **Upload d'Image**
   - Option 1: URL de l'image
   - Option 2: Upload fichier (max 5MB)
   - Formats acceptés: PNG, JPG, JPEG
   - Aperçu avant upload
   - Validation côté client

3. **Géolocalisation**
   - Coordonnées GPS automatiques depuis la commune
   - Latitude et longitude (WGS84, SRID 4326)

4. **Processus de Création**
   - Étape 1: Création de l'annonce (sans image ou avec URL)
   - Étape 2: Upload de l'image séparément (si fichier)
   - Étape 3: Mise à jour de l'URL de l'image en base

5. **Gestion du Cooldown**
   - Vérification côté backend (24h)
   - Message d'erreur explicite si cooldown actif
   - Affichage du temps restant

##### Code Structure

```typescript
// State
const [fileList, setFileList] = useState<UploadFile[]>([]);
const [photoInputType, setPhotoInputType] = useState<'url' | 'upload'>('url');
const [categories, setCategories] = useState<Category[]>([]);
const [communes, setCommunes] = useState<Commune[]>([]);

// Processus d'upload
1. Créer annonce avec photoUrl (si URL) ou vide
2. Récupérer l'ID de l'annonce créée
3. Si fichier présent → upload via FormData
4. Endpoints essayés: /api/v1/upload_annonce_image, /upload_annonce_image, /api/upload_annonce_image
```

#### 4.3.3 Mes Annonces (MyAnnouncements.tsx)

**Localisation:** `frontend-web/src/pages/MyAnnouncements.tsx`

##### Fonctionnalités

1. **Liste des Annonces Utilisateur**
   - Tableau avec toutes les annonces de l'utilisateur connecté
   - Colonnes: Titre, Catégorie, Quantité, Statut, Demandes, Actions

2. **Filtres**
   - Par statut (En attente, Validée, Rejetée, Attribuée, Annulée)
   - Par expiration (Expirant bientôt - 7 jours)

3. **Gestion des Demandes**
   - Liste des demandes pour chaque annonce
   - Informations du demandeur (nom, email, téléphone)
   - Quantité demandée
   - Statut de la demande

4. **Attribution de Dons**
   - Modal pour attribuer une quantité à un demandeur
   - Validation de la quantité disponible
   - Mise à jour automatique des quantités

5. **Indicateurs Visuels**
   - Badge "Expirant bientôt" (7 jours)
   - Badge "En attente depuis X jours" (si > 7 jours)
   - Affichage "X / Y" pour quantités (restant / total)

6. **Actions Disponibles**
   - Voir les détails
   - Gérer les demandes
   - Attribuer des quantités
   - Supprimer l'annonce (si non attribuée)

##### Code Structure

```typescript
// State
const [data, setData] = useState<MyAnn[]>([]);
const [interests, setInterests] = useState<InterestRequest[]>([]);
const [statusFilter, setStatusFilter] = useState<string | undefined>();
const [expirationFilter, setExpirationFilter] = useState<'expiring' | undefined>();

// Calculs
- EXPIRING_SOON_DAYS = 7
- PENDING_ALERT_DAYS = 7
- Calcul de la date d'expiration
- Calcul du temps en attente
```

---

### 4.4 Système de Géolocalisation (SIG)

#### 4.4.1 Carte Interactive (MapWithList.tsx)

**Localisation:** `frontend-web/src/pages/MapWithList.tsx`

##### Fonctionnalités

1. **Vue Divisée**
   - **Carte (gauche):** Affichage Leaflet avec marqueurs
   - **Liste (droite):** Tableau des annonces

2. **Couches de Carte**
   - **ESRI World Imagery** (par défaut)
   - **CartoDB Light** (alternative)
   - **OpenStreetMap retiré** (pour préserver l'unité territoriale du Maroc)

3. **Marqueurs sur la Carte**
   - Icônes personnalisées par catégorie
   - Couleurs différentes selon le statut
   - Popup avec informations de l'annonce
   - Tooltip au survol

4. **Synchronisation Bidirectionnelle**
   - Clic sur marqueur → zoom et sélection dans la liste
   - Clic sur ligne liste → zoom sur la carte
   - Filtres appliqués simultanément

5. **Filtres**
   - Par catégorie
   - Par commune (multi-sélection)
   - Par date
   - Recherche texte

6. **Géolocalisation des Communes**
   - Affichage des polygones des communes sélectionnées
   - Zoom automatique sur les limites
   - Validation des coordonnées (Maroc uniquement)

##### Code Structure

```typescript
// Composants Leaflet
- MapContainer: Conteneur principal
- TileLayer: Couche de tuiles
- Marker: Marqueurs d'annonces
- Popup: Informations au clic
- GeoJSON: Polygones des communes (optionnel)

// State
const [announcements, setAnnouncements] = useState<Annonce[]>([]);
const [selectedAnnouncement, setSelectedAnnouncement] = useState<Annonce | null>(null);
const [mapBaseLayer, setMapBaseLayer] = useState<'esri' | 'cartodb'>('esri');
const [selectedCommuneIds, setSelectedCommuneIds] = useState<number[]>([]);

// Helpers
- extractCoordinates(annonce): Extrait lat/lng
- isValidMoroccoCoordinates(coords): Valide les coordonnées
- createCategoryIcon(category): Crée l'icône personnalisée
```

#### 4.4.2 Helpers de Carte (mapHelpers.ts)

**Localisation:** `frontend-web/src/utils/mapHelpers.ts`

##### Fonctions Principales

1. **extractCoordinates(annonce)**
   - Extrait latitude/longitude depuis l'annonce
   - Supporte différents formats de données

2. **isValidMoroccoCoordinates(coords)**
   - Valide que les coordonnées sont au Maroc
   - Latitude: 20.7 - 35.9
   - Longitude: -17.0 - -1.0

3. **createCategoryIcon(category)**
   - Crée une icône Leaflet personnalisée
   - Couleur selon la catégorie
   - Taille et style configurables

4. **prepareAnnouncementsWithOffsets(annonces)**
   - Prépare les annonces pour l'affichage
   - Gère les décalages pour les marqueurs proches

---

### 4.5 Dashboard et Statistiques

#### 4.5.1 Dashboard (Dashboard.tsx)

**Localisation:** `frontend-web/src/pages/Dashboard.tsx`

##### Fonctionnalités

1. **Cartes de Statistiques (8 cartes)**
   - **Total Annonces:** Nombre total d'annonces
   - **Validées:** Nombre d'annonces validées (avec barre de progression)
   - **En Attente:** Nombre d'annonces en attente (avec barre de progression)
   - **Attribuées/Données:** Nombre d'annonces attribuées
   - **Rejetées:** Nombre d'annonces rejetées
   - **Annulées:** Nombre d'annonces annulées
   - **Total Quantité:** Somme des quantités (avec moyenne)
   - **Taux de Validation:** Pourcentage de validation

2. **Graphique en Barres - Catégories**
   - Nombre d'annonces par catégorie
   - Couleurs dynamiques
   - Tri par valeur décroissante
   - Tooltip avec détails

3. **Graphique en Barres - Communes**
   - Top 10 communes par nombre d'annonces
   - Affichage horizontal
   - Couleurs personnalisées

4. **Graphique en Camembert - Statuts**
   - Répartition par statut
   - Couleurs distinctes par statut
   - Labels avec valeurs et pourcentages
   - Légende avec compteurs

5. **Tableau des Annonces**
   - Colonnes: Titre, Catégorie, Commune, Date, Statut
   - Tri par date
   - Tags colorés pour les statuts
   - Pagination

6. **Filtres**
   - Par catégorie
   - Par commune
   - Par date (RangePicker)

##### Code Structure

```typescript
// Graphiques Recharts
- BarChart: Graphique en barres catégories
- BarChart: Graphique en barres communes
- PieChart: Graphique en camembert statuts
- ResponsiveContainer: Conteneur responsive

// Calculs
const filteredData = useMemo(() => {
  // Filtrage par catégorie, commune, date
});

const totals = useMemo(() => {
  // Calcul des totaux: validées, en attente, rejetées, etc.
});

// Mapping des catégories
const getCategoryName = (categorie: any) => {
  // Supporte nom, name, getName()
};
```

---

### 4.6 Espace Administrateur

#### 4.6.1 Page Admin (Admin.tsx)

**Localisation:** `frontend-web/src/pages/Admin.tsx`

##### Fonctionnalités

1. **Onglet: Annonces en Attente**
   - Liste des annonces en attente de validation
   - Actions: Approuver, Rejeter
   - Modal de rejet avec raison

2. **Onglet: Toutes les Annonces**
   - Liste complète des annonces
   - Filtres et recherche
   - Actions administratives

3. **Onglet: Utilisateurs**
   - Liste de tous les utilisateurs
   - Informations: nom, email, téléphone, rôle
   - Actions: Supprimer (avec confirmation)

4. **Onglet: Newsletter**
   - Liste des abonnés à la newsletter
   - Export des emails

5. **Onglet: Export/Import**
   - Export des données en JSON
   - Import de données depuis JSON
   - Sauvegarde et restauration

##### Code Structure

```typescript
// Tabs Ant Design
const tabs = [
  { key: 'pending', label: 'Annonces en Attente' },
  { key: 'all', label: 'Toutes les Annonces' },
  { key: 'users', label: 'Utilisateurs' },
  { key: 'newsletter', label: 'Newsletter' },
  { key: 'export', label: 'Export/Import' }
];

// Actions
- approveAnnonce(id): Approuve une annonce
- rejectAnnonce(id, reason): Rejette une annonce avec raison
- deleteUtilisateur(id): Supprime un utilisateur
```

---

## 5. SÉCURITÉ ET VALIDATION

### 5.1 Validation Côté Frontend

#### 5.1.1 Inscription
- **Nom/Prénom:** Min 2 caractères, max 50
- **Téléphone:** Format marocain `^0\d{9}$`
- **Email:** Format email standard
- **Confirmation Email:** Doit correspondre
- **Mot de passe:** Min 8 caractères, majuscule, minuscule, chiffre
- **Image:** PNG/JPG, max 2MB
- **Captcha:** Validation arithmétique

#### 5.1.2 Création d'Annonce
- **Titre:** Requis
- **Description:** Requis
- **Catégorie:** Requis
- **Commune:** Requis
- **Quantité:** Nombre entier positif
- **Image:** PNG/JPG/JPEG, max 5MB

### 5.2 Protection des Routes

**Localisation:** `frontend-web/src/components/ProtectedRoute.tsx`

```typescript
// Routes protégées
- /create-announcement: requirePermission('create_announcement')
- /admin: requirePermission('access_admin_panel')
- /my-announcements: requireAuth (utilisateur connecté)
```

### 5.3 Système de Cooldown

#### 5.3.1 Cooldown Annonces (24h)

**Backend:** `AnnonceService.java`

```java
private void validateAnnonceCooldown(Long donnateur) {
    Date lastAnnonceDate = annonceRepo.findLastAnnonceDateByDonnateur(donnateur);
    if (lastAnnonceDate == null) return;
    
    Duration sinceLast = Duration.between(
        lastAnnonceDate.toInstant(), 
        Instant.now()
    );
    
    if (sinceLast.toHours() < 24) {
        Duration remaining = Duration.ofHours(24).minus(sinceLast);
        throw new IllegalStateException(
            "Vous êtes en cooldown: une annonce par jour. " +
            "Réessayez dans " + remaining.toHours() + "h" + 
            String.format("%02d", remaining.toMinutes() % 60) + "."
        );
    }
}
```

**Frontend:** Gestion de l'erreur HTTP 429

```typescript
// annonceService.ts
catch (error: any) {
    if (error.response?.status === 429) {
        throw new Error(error.response.data.message);
    }
}
```

#### 5.3.2 Cooldown Demandes (24h)

**Backend:** `DemandeService.java`

Même logique que pour les annonces, appliquée aux demandes.

**Frontend:** `RequestButton.tsx`

```typescript
// Vérification du cooldown
const hasRecent = await hasRecentDemande(annonceId, userId);
// Bouton désactivé si cooldown actif
// Message: "Vous avez déjà fait une demande récemment (cooldown 24h)"
```

---

## 6. GESTION DES IMAGES

### 6.1 Upload d'Images

#### 6.1.1 Photo de Profil (Inscription)

**Endpoint Backend:** `POST /api/v1/utilisateur`

```typescript
// Frontend: Register.tsx
const formData = new FormData();
formData.append('firstName', values.firstName);
formData.append('lastName', values.lastName);
// ... autres champs
if (imageFile) {
    formData.append('image', imageFile);
}

// Headers
headers: { 'Content-Type': 'multipart/form-data' }
```

#### 6.1.2 Photo d'Annonce

**Endpoint Backend:** `POST /api/v1/upload_annonce_image`

**Processus:**
1. Création de l'annonce (sans image ou avec URL)
2. Récupération de l'ID de l'annonce créée
3. Upload de l'image via FormData
4. Mise à jour du champ `photo` en base

**Backend:** `AnnonceService.pictureupload()`

```java
public void pictureupload(long id, MultipartFile file) {
    // Création du répertoire images_annonce si inexistant
    // Sauvegarde: images_annonce/{id}.{extension}
    // Suppression de l'ancienne image si existe
    // Mise à jour du champ photo en base
}
```

### 6.2 Affichage des Images

#### 6.2.1 Résolution d'URL

**Fonction:** `resolvePhotoUrl(photo, annonceId)`

```typescript
// Priorités:
1. URL absolue (http://, https://, data:)
2. Endpoint API: /api/v1/annonce/{id}/image
3. URL relative: /{photo}
```

#### 6.2.2 Endpoint de Service d'Images

**Backend:** `GET /api/v1/annonce/{id}/image`

```java
@GetMapping("/annonce/{id}/image")
public ResponseEntity<Resource> getAnnonceImage(@PathVariable Long id) {
    String imagePath = annonceService.getAnnonceImagePath(id);
    // Détermine le Content-Type selon l'extension
    // Retourne le fichier image
}
```

### 6.3 Gestion des Images Manquantes

- **Pas de placeholder:** Cellule vide si pas d'image
- **Affichage conditionnel:** Section photo masquée si pas d'image
- **Message subtil:** "Aucune photo fournie" si nécessaire

---

## 7. API ET SERVICES

### 7.1 Configuration API

**Localisation:** `frontend-web/src/utils/api.ts`

```typescript
// Configuration Axios
const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour le token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sadaka_web_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

### 7.2 Services Frontend

#### 7.2.1 AnnonceService

**Localisation:** `frontend-web/src/services/annonceService.ts`

**Fonctions:**
- `getAnnonces()` - Liste toutes les annonces
- `getAnnoncesByUser(userId)` - Annonces d'un utilisateur
- `getAnnoncesEnCours()` - Annonces en attente
- `getAnnonceById(id)` - Détails d'une annonce
- `createAnnonce(data)` - Créer une annonce
- `updateAnnonce(id, data)` - Modifier une annonce
- `deleteAnnonce(id)` - Supprimer une annonce
- `approveAnnonce(id)` - Approuver une annonce
- `rejectAnnonce(id)` - Rejeter une annonce

#### 7.2.2 DemandeService

**Localisation:** `frontend-web/src/services/demandeService.ts`

**Fonctions:**
- `getDemandesByUser(userId)` - Demandes d'un utilisateur
- `getDemandesByAnnonce(annonceId)` - Demandes pour une annonce
- `createDemande(annonceId, userId)` - Créer une demande
- `hasRecentDemande(annonceId, userId)` - Vérifier cooldown
- `assignDemande(demandeId, quantite, donnateurId)` - Attribuer une demande

#### 7.2.3 CategoryService

**Localisation:** `frontend-web/src/services/categoryService.ts`

**Fonctions:**
- `getCategories()` - Liste toutes les catégories
- `getCategoriesByFamille(familleId)` - Catégories d'une famille
- `createCategory(category)` - Créer une catégorie
- `deleteCategory(id)` - Supprimer une catégorie

#### 7.2.4 CommuneService

**Localisation:** `frontend-web/src/services/communeService.ts`

**Fonctions:**
- `getCommunes()` - Liste toutes les communes
- Mapping des données géographiques (GeoJSON)

#### 7.2.5 UtilisateurService

**Localisation:** `frontend-web/src/services/utilisateurService.ts`

**Fonctions:**
- `getUtilisateurs()` - Liste tous les utilisateurs
- `deleteUtilisateur(userId)` - Supprimer un utilisateur

### 7.3 Endpoints Backend Principaux

#### 7.3.1 Annonces

```
GET    /api/v1/annonces              - Liste toutes les annonces
GET    /api/v1/annonces/user/{id}    - Annonces d'un utilisateur
GET    /api/v1/annonces/encours      - Annonces en attente
GET    /api/v1/annonce/{id}          - Détails d'une annonce
POST   /api/v1/annonce               - Créer une annonce
PUT    /api/v1/annonce/update/{id}   - Modifier une annonce
DELETE /api/v1/annonce/{id}          - Supprimer une annonce
POST   /api/v1/upload_annonce_image - Upload image annonce
GET    /api/v1/annonce/{id}/image    - Récupérer image annonce
POST   /api/v1/annonce/{id}/approve  - Approuver annonce
POST   /api/v1/annonce/{id}/reject   - Rejeter annonce
```

#### 7.3.2 Demandes

```
GET    /api/v1/demandes/user/{id}     - Demandes d'un utilisateur
GET    /api/v1/demandes/annonce/{id} - Demandes pour une annonce
POST   /api/v1/demandea               - Créer une demande
PUT    /api/v1/demande/{id}/assign    - Attribuer une demande
DELETE /api/v1/demande/{id}          - Supprimer une demande
```

#### 7.3.3 Utilisateurs

```
GET    /api/v1/utilisateurs           - Liste tous les utilisateurs
GET    /api/v1/utilisateur/{id}       - Détails d'un utilisateur
POST   /api/v1/utilisateur            - Créer un utilisateur (inscription)
GET    /api/v1/utilisateur/connect    - Connexion
DELETE /api/v1/utilisateur/{id}      - Supprimer un utilisateur
```

#### 7.3.4 Catégories

```
GET    /api/v1/categories             - Liste toutes les catégories
GET    /api/v1/categories/{familleId} - Catégories d'une famille
POST   /api/v1/categorie              - Créer une catégorie
DELETE /api/v1/categorie/{id}        - Supprimer une catégorie
```

#### 7.3.5 Communes

```
GET    /api/v1/communes               - Liste toutes les communes
```

---

## 8. INTERFACE UTILISATEUR

### 8.1 Design System

**Framework:** Ant Design 5.20.2

#### 8.1.1 Composants Principaux Utilisés

- **Layout:** Layout, Header, Content, Footer
- **Navigation:** Menu, Breadcrumb
- **Formulaires:** Form, Input, Select, DatePicker, Upload, Radio
- **Affichage:** Card, Table, Tag, Badge, Typography, Statistic
- **Feedback:** Message, Modal, Drawer, Alert, Spin
- **Graphiques:** Recharts (BarChart, PieChart)
- **Cartes:** React Leaflet (MapContainer, TileLayer, Marker)

#### 8.1.2 Thème et Couleurs

- **Couleur principale:** `#52c41a` (vert Ant Design)
- **Couleur secondaire:** `#1890ff` (bleu Ant Design)
- **Couleurs de statut:**
  - Validée: `#52c41a` (vert)
  - En attente: `#faad14` (orange)
  - Rejetée: `#ff4d4f` (rouge)
  - Attribuée: `#1890ff` (bleu)
  - Annulée: `#8c8c8c` (gris)

### 8.2 Navigation

**Localisation:** `frontend-web/src/components/AppLayout.tsx`

#### 8.2.1 Menu Principal

- **Accueil** (`/`)
- **Annonces** (`/announcements`)
- **Carte** (`/map`)
- **Dashboard** (`/dashboard`)

#### 8.2.2 Menu Utilisateur

- **Mes Annonces** (`/my-announcements`) - Si connecté
- **Publier une Annonce** (`/create-announcement`) - Si connecté
- **Admin** (`/admin`) - Si admin
- **Se connecter** (`/login`) - Si non connecté
- **Se déconnecter** - Si connecté

### 8.3 Responsive Design

- **Breakpoints Ant Design:**
  - `xs`: < 576px
  - `sm`: ≥ 576px
  - `md`: ≥ 768px
  - `lg`: ≥ 992px
  - `xl`: ≥ 1200px

- **Adaptations:**
  - Menu responsive (hamburger sur mobile)
  - Colonnes adaptatives (Grid system)
  - Tableaux scrollables sur mobile

---

## 9. GESTION DES ERREURS

### 9.1 Error Boundary

**Localisation:** `frontend-web/src/components/ErrorBoundary.tsx`

```typescript
// Capture les erreurs React
// Affiche un message d'erreur convivial
// Log les erreurs en console
```

### 9.2 Gestion des Erreurs API

```typescript
// Pattern général
try {
    const data = await service.function();
} catch (error: any) {
    if (error.response?.status === 429) {
        // Cooldown
        message.error(error.response.data.message);
    } else if (error.response?.status === 401) {
        // Non autorisé
        navigate('/unauthorized');
    } else {
        // Erreur générique
        message.error(error.message || 'Une erreur est survenue');
    }
}
```

### 9.3 Messages d'Erreur Utilisateur

- **Messages clairs et contextuels**
- **Pas de messages techniques** (sauf en mode dev)
- **Actions suggérées** quand possible

---

## 10. PERFORMANCES ET OPTIMISATIONS

### 10.1 Optimisations React

- **useMemo:** Pour les calculs coûteux (filtres, totaux)
- **useCallback:** Pour les fonctions passées en props
- **Lazy Loading:** Possible pour les routes (non implémenté actuellement)

### 10.2 Gestion des Appels API

- **Promise.allSettled:** Pour les appels parallèles
- **Gestion des erreurs individuelles:** Un échec n'empêche pas les autres
- **Cache local:** Données mises en cache dans le state

### 10.3 Optimisations Images

- **Lazy loading:** Images chargées à la demande
- **Compression:** Validation de la taille avant upload
- **Formats optimisés:** PNG/JPG uniquement

---

## 11. TESTS ET VALIDATION

### 11.1 Tests Manuels

- **Inscription:** Formulaire complet avec validation
- **Connexion:** Utilisateur et admin
- **Création d'annonce:** Avec et sans image
- **Filtres:** Tous les types de filtres
- **Carte:** Synchronisation et interactions
- **Dashboard:** Affichage des statistiques
- **Admin:** Toutes les actions administratives

### 11.2 Validation des Données

- **Frontend:** Validation en temps réel
- **Backend:** Validation côté serveur
- **Base de données:** Contraintes SQL

---

## 12. DÉPLOIEMENT

### 12.1 Environnement de Développement

- **Frontend:** `npm run dev` (Vite dev server)
- **Backend:** `mvnw spring-boot:run` (Spring Boot)
- **Base de données:** PostgreSQL local ou Neon Tech

### 12.2 Scripts de Démarrage

**Windows PowerShell:**
- `DEMARRER_PROJET_COMPLET.ps1` - Démarre backend et frontend
- `DEMARRER_BACKEND.ps1` - Démarre uniquement le backend

### 12.3 Configuration

**Backend:** `application.properties`
```properties
spring.datasource.url=jdbc:postgresql://...
spring.datasource.username=...
spring.datasource.password=...
server.port=8080
```

**Frontend:** `vite.config.ts`
```typescript
export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:8080'
        }
    }
});
```

---

## 13. ANNEXES TECHNIQUES

### 13.1 Types TypeScript Principaux

**Localisation:** `frontend-web/src/types/api.ts`

```typescript
export interface Annonce {
    id: number;
    titre: string;
    description: string;
    quatite: number;
    photo?: string;
    status: 'EN_COURS' | 'VALIDE' | 'REJETE' | 'ATTRIBUE' | 'ANNULE';
    date: string;
    categorie?: Category;
    commune?: Commune;
    donnateur?: Utilisateur;
    latitude?: number;
    longitude?: number;
}

export interface Category {
    id: number;
    nom: string;
    name?: string;
}

export interface Commune {
    gid: number;
    nomCommune: string;
    geom?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export interface Utilisateur {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: UserRole;
}

export interface Demande {
    id: number;
    annonce: Annonce;
    demandeur: Utilisateur;
    date: string;
    quantite?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

### 13.2 Rôles et Permissions

**Localisation:** `frontend-web/src/utils/roles.ts`

```typescript
export enum UserRole {
    ADMIN = 'ADMIN',
    MODERATOR = 'MODERATOR',
    USER = 'USER'
}

export const PERMISSIONS = {
    create_announcement: [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN],
    access_admin_panel: [UserRole.ADMIN],
    approve_announcement: [UserRole.ADMIN, UserRole.MODERATOR],
    // ...
};

export function hasPermission(role: UserRole, permission: string): boolean {
    return PERMISSIONS[permission]?.includes(role) || false;
}
```

### 13.3 Constantes et Configuration

```typescript
// Cooldowns
const COOLDOWN_HOURS = 24;

// Upload
const MAX_UPLOAD_SIZE_MB_PROFILE = 2;
const MAX_UPLOAD_SIZE_MB_ANNOUNCE = 5;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

// Expiration
const EXPIRING_SOON_DAYS = 7;
const PENDING_ALERT_DAYS = 7;
```

---

## 14. CONCLUSION

### 14.1 Fonctionnalités Implémentées

✅ **Authentification complète** (inscription, connexion, rôles)  
✅ **Gestion des annonces** (création, modification, suppression)  
✅ **Système de géolocalisation** (carte interactive, SIG)  
✅ **Dashboard avec statistiques** (graphiques, filtres)  
✅ **Espace administrateur** (validation, gestion utilisateurs)  
✅ **Upload d'images** (profil, annonces)  
✅ **Système de cooldown** (24h pour annonces et demandes)  
✅ **Gestion des demandes** (création, attribution)  
✅ **Filtres avancés** (catégorie, commune, date, texte)  
✅ **Interface responsive** (mobile, tablette, desktop)  

### 14.2 Points Forts

- **Architecture moderne:** React + TypeScript + Spring Boot
- **Expérience utilisateur:** Interface intuitive avec Ant Design
- **Sécurité:** Validation, cooldown, captcha
- **Géolocalisation:** Intégration PostGIS et Leaflet
- **Statistiques:** Dashboard avec graphiques interactifs

### 14.3 Améliorations Futures Possibles

- **Notifications en temps réel** (WebSocket)
- **Recherche avancée** (full-text search)
- **Export PDF** des statistiques
- **Application mobile** (React Native)
- **Système de messagerie** entre utilisateurs
- **Évaluations et commentaires** sur les dons
- **Historique des transactions**

---

## 15. RÉFÉRENCES

### 15.1 Documentation Technique

- [React Documentation](https://react.dev/)
- [Ant Design Components](https://ant.design/components/overview/)
- [React Leaflet](https://react-leaflet.js.org/)
- [Recharts](https://recharts.org/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [PostGIS Documentation](https://postgis.net/documentation/)

### 15.2 Bibliothèques Utilisées

- **React 18.3.1**
- **TypeScript 5.6.3**
- **Vite 5.4.10**
- **Ant Design 5.20.2**
- **React Router 6.26.2**
- **React Leaflet 4.2.1**
- **Recharts 3.6.0**
- **Axios 1.7.7**
- **Leaflet 1.9.4**
- **Day.js 1.11.19**

---

**Fin du Rapport**

---

*Ce document a été généré automatiquement à partir de l'analyse du code source de l'application SADAKA. Pour toute question ou clarification, veuillez consulter le code source ou contacter l'équipe de développement.*
