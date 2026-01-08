# SADAKA - Plateforme de Gestion des Dons avec SIG

Application web complète pour la gestion des dons avec système d'information géographique (SIG), développée dans le cadre d'un projet académique.

## 📋 Description

SADAKA est une plateforme collaborative qui connecte les généreux donateurs avec ceux qui en ont besoin. Grâce à la géolocalisation et aux cartes interactives, les utilisateurs peuvent facilement trouver les dons disponibles près de chez eux ou publier leurs propres annonces de don.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités Principales

- **Carte + Liste Synchronisées** : Vue divisée avec carte interactive (gauche) et liste (droite) avec synchronisation bidirectionnelle
- **Filtres Fonctionnels** : Recherche par catégorie, commune, date, et texte
- **Gestion des Demandes** : Système de demande avec limitation à une demande par utilisateur par annonce pour 30 jours
- **Dashboard avec Graphiques** : Visualisation des données avec Recharts (barres et camemberts)
- **Authentification** : Système de connexion/inscription avec rôles (Admin, Modérateur, Utilisateur)
- **Gestion des Annonces** : Création, modification, suppression d'annonces avec géolocalisation
- **Page d'Accueil Claire** : Interface explicative avec boutons d'action visibles

### 🗺️ SIG (Système d'Information Géographique)

- Intégration PostGIS pour la gestion des données géographiques
- Affichage des annonces sur une carte interactive (Leaflet)
- Coordonnées GPS (WGS84, SRID 4326)
- Géolocalisation automatique par commune

## 🛠️ Technologies

### Frontend
- **React** 18+ avec TypeScript
- **Vite** pour le build
- **Ant Design** pour l'UI
- **Leaflet** pour les cartes
- **Recharts** pour les graphiques
- **React Router** pour la navigation
- **Axios** pour les appels API

### Backend
- **Spring Boot** (Java)
- **PostgreSQL** avec **PostGIS**
- **Hibernate** / **JPA**
- **Maven** pour la gestion des dépendances

### Base de Données
- **PostgreSQL** (local ou Neon Tech)
- **PostGIS** extension pour les données géographiques

## 📁 Structure du Projet

```
nouveau/
├── frontend-web/          # Application React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   ├── context/       # Context React (Auth)
│   │   └── utils/         # Utilitaires
│   └── package.json
│
├── SadaqahApp_WEBServices-main/  # Backend Spring Boot
│   ├── src/main/java/
│   │   ├── controller/    # Contrôleurs REST
│   │   ├── model/         # Modèles JPA
│   │   ├── service/       # Services métier
│   │   └── repo/          # Repositories
│   └── pom.xml
│
└── README.md
```

## 🚀 Installation et Démarrage

### Prérequis

- **Node.js** 18+ et npm
- **Java** 17+ et Maven (ou Maven Wrapper)
- **PostgreSQL** 14+ avec PostGIS
- **Git**

### 1. Cloner le Repository

```bash
git clone https://github.com/hajarol18/sadaka12.git
cd sadaka12
```

### 2. Configuration de la Base de Données

#### Option A : PostgreSQL Local

1. Créer une base de données PostgreSQL :
```sql
CREATE DATABASE geoinformatique;
CREATE EXTENSION postgis;
```

2. Configurer `SadaqahApp_WEBServices-main/src/main/resources/application.properties` :
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/geoinformatique
spring.datasource.username=votre_username
spring.datasource.password=votre_password
```

#### Option B : Neon Tech (Cloud)

1. Créer un compte sur [Neon Tech](https://neon.tech)
2. Créer une base de données
3. Configurer `application.properties` avec les credentials Neon Tech

### 3. Initialiser les Données

Exécuter les scripts SQL dans pgAdmin ou psql :

```bash
# Catégories
psql -d geoinformatique -f frontend-web/seed_categories.sql

# Communes (optionnel, pour les données de test)
psql -d geoinformatique -f frontend-web/insert_communes_complet.sql

# Utilisateurs de test
psql -d geoinformatique -f frontend-web/CREER_UTILISATEURS_TEST.sql
```

### 4. Démarrer le Backend

#### Windows (PowerShell)
```powershell
.\DEMARRER_BACKEND.ps1
```

#### Manuellement
```bash
cd SadaqahApp_WEBServices-main
./mvnw spring-boot:run
```

Le backend démarre sur `http://localhost:8081`

### 5. Démarrer le Frontend

```bash
cd frontend-web
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

## 🔐 Comptes de Test

Après avoir exécuté `CREER_UTILISATEURS_TEST.sql` :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@sadaka.ma | Admin123 |
| Modérateur | moderator@sadaka.ma | Moderator123 |
| Utilisateur | user@sadaka.ma | User123 |

## 📡 API Endpoints

### Annonces
- `GET /api/v1/annonces` - Liste toutes les annonces
- `GET /api/v1/annonces/user/{id}` - Annonces d'un utilisateur
- `POST /api/v1/annonce` - Créer une annonce
- `DELETE /api/v1/annonce/{id}` - Supprimer une annonce

### Catégories
- `GET /api/v1/categories` - Liste toutes les catégories

### Communes
- `GET /api/v1/communes` - Liste toutes les communes

### Demandes
- `GET /api/v1/demandes/user/{id}` - Demandes d'un utilisateur
- `GET /api/v1/demandes/annonce/{id}` - Demandes pour une annonce
- `POST /api/v1/demandea` - Créer une demande

### Utilisateurs
- `GET /api/v1/utilisateur/connect` - Connexion
- `POST /api/v1/utilisateur` - Inscription
- `GET /api/v1/utilisateurs/{id}` - Détails d'un utilisateur

## 🎯 Fonctionnalités Détaillées

### Carte + Liste Synchronisées

- **Carte (gauche)** : Affichage des annonces sur une carte Leaflet
- **Liste (droite)** : Tableau avec toutes les annonces
- **Synchronisation** :
  - Clic sur un point de la carte → zoom et mise en évidence dans la liste
  - Clic sur une ligne de la liste → zoom sur la carte
  - Filtres appliqués simultanément sur la carte et la liste

### Gestion des Demandes

- Un utilisateur ne peut faire qu'**une seule demande** par annonce
- Période de blocage : **30 jours** après la dernière demande
- Bouton désactivé avec message clair si déjà demandé

### Dashboard

- **Graphique en barres** : Nombre d'annonces par catégorie
- **Graphique en camembert** : Répartition par statut
- Filtres par catégorie, commune, et date

## 🐛 Dépannage

### Backend ne démarre pas

1. Vérifier que PostgreSQL est démarré
2. Vérifier les credentials dans `application.properties`
3. Vérifier que le port 8081 est libre

### Frontend ne charge pas les données

1. Vérifier que le backend est démarré (`http://localhost:8081`)
2. Vérifier la console du navigateur pour les erreurs
3. Vérifier que les données sont présentes dans PostgreSQL

### Erreur "No data" pour communes/catégories

1. Exécuter les scripts SQL de seed
2. Vérifier les endpoints dans la console du navigateur
3. Vérifier que le backend retourne bien des données

## 📝 Scripts SQL Disponibles

- `seed_categories.sql` - Insère les catégories de base
- `insert_communes_complet.sql` - Insère des communes de test
- `CREER_UTILISATEURS_TEST.sql` - Crée des comptes de test
- `CORRIGER_ADMIN_SIMPLE.sql` - Corrige/crée le compte admin

## 👥 Contribution

Ce projet a été développé dans le cadre d'un projet académique. Pour toute contribution :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est développé dans un contexte académique.

## 🙏 Remerciements

- Professeur pour les retours et corrections
- Équipe de développement
- Communauté open source (React, Spring Boot, PostGIS, etc.)

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.

---

**Développé avec ❤️ pour faciliter le partage et la solidarité**

