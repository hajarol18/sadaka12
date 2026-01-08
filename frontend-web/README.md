# SADAKA — Frontend Web

Application web (administration + public) pour la plateforme de gestion des dons.

## Pile technique
- React 18 + Vite + TypeScript
- React Router DOM
- Axios
- Leaflet / React-Leaflet (SIG)

## Démarrage

Prérequis: Node.js 18+ et npm.

```bash
cd frontend-web
npm install
npm run dev
```

- Dev server: http://localhost:5173

## Scripts
- `npm run dev`: démarre le serveur de développement
- `npm run build`: build de production
- `npm run preview`: sert le build localement

## Structure
```
frontend-web/
  src/
    components/
    pages/
    styles/
    App.tsx
    main.tsx
```

## Configuration carte
Leaflet CSS est inclus dans `index.html`. Les composants carte se trouvent dans `src/components/MapView.tsx` et la page dans `src/pages/Map.tsx`.
