import L from 'leaflet';
import type { Annonce } from '../types/api';

/**
 * Calcule un décalage (offset) pour les markers superposés
 * Utilise un algorithme en spirale pour disperser les markers visuellement
 */
export function calculateMarkerOffset(
  lat: number,
  lng: number,
  index: number,
  totalAtSameLocation: number
): [number, number] {
  // Si un seul marker, pas de décalage
  if (totalAtSameLocation <= 1) {
    return [lat, lng];
  }

  // Distance approximative pour le décalage en degrés
  // Environ 50-100 mètres selon la latitude
  const offsetDistance = 0.001; // ~100 mètres
  const angleStep = (2 * Math.PI) / totalAtSameLocation;
  const angle = index * angleStep;
  const radius = offsetDistance * (1 + index * 0.3); // Légère augmentation du rayon

  // Calculer le décalage en utilisant la formule de Haversine simplifiée
  const dLat = radius * Math.cos(angle);
  const dLng = radius * Math.sin(angle) / Math.cos(lat * Math.PI / 180);

  return [lat + dLat, lng + dLng];
}

/**
 * Groupe les annonces par coordonnées identiques
 * Utilise extractCoordinates pour gérer l'inversion automatique
 */
export function groupByCoordinates(announcements: Annonce[]): Map<string, Annonce[]> {
  const groups = new Map<string, Annonce[]>();
  
  announcements.forEach(announcement => {
    const coords = extractCoordinates(announcement);
    if (!coords) return;
    
    const { lat, lng } = coords;
    // Arrondir à 4 décimales pour grouper les coordonnées très proches (~11 mètres)
    const key = `${Math.round(lat * 10000) / 10000},${Math.round(lng * 10000) / 10000}`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(announcement);
  });
  
  return groups;
}

/**
 * Prépare les annonces avec leurs offsets calculés pour éviter la superposition
 * IMPORTANT: Utilise extractCoordinates() pour obtenir les bonnes coordonnées
 */
export function prepareAnnouncementsWithOffsets(announcements: Annonce[]): Array<{
  announcement: Annonce;
  position: [number, number];
  offsetIndex: number;
  totalAtLocation: number;
}> {
  const groups = groupByCoordinates(announcements);
  const result: Array<{
    announcement: Annonce;
    position: [number, number];
    offsetIndex: number;
    totalAtLocation: number;
  }> = [];

  groups.forEach((group, key) => {
    // Extraire les coordonnées de base depuis la clé (déjà validées par groupByCoordinates)
    const [baseLat, baseLng] = key.split(',').map(Number);
    
    group.forEach((announcement, index) => {
      // IMPORTANT: Utiliser extractCoordinates() pour obtenir les coordonnées correctes
      // Cela gère l'inversion, les coordonnées projetées, et la table de correspondance
      const coords = extractCoordinates(announcement);
      
      if (!coords) {
        console.warn(`[prepareAnnouncementsWithOffsets] Impossible d'extraire les coordonnées pour annonce ${announcement.id}`);
        return; // Ignorer cette annonce
      }
      
      const { lat, lng } = coords;
      
      // Calculer l'offset pour éviter la superposition
      const offsetPosition = calculateMarkerOffset(lat, lng, index, group.length);
      
      console.log(`[prepareAnnouncementsWithOffsets] Annonce ${announcement.id} (${announcement.commune?.nomCommune || 'sans commune'}):`, {
        coords: { lat, lng },
        offset: offsetPosition,
        index,
        total: group.length
      });
      
      result.push({
        announcement,
        position: offsetPosition,
        offsetIndex: index,
        totalAtLocation: group.length
      });
    });
  });

  return result;
}

/**
 * Crée une icône personnalisée avec couleur par catégorie
 */
export function createCategoryIcon(
  categoryName: string | undefined,
  isHighlighted: boolean = false
): L.Icon {
  // Couleurs par catégorie (avec fallback)
  const categoryColors: Record<string, string> = {
    'Nourriture': '#ff7875',
    'Vêtements': '#40a9ff',
    'Équipements': '#95de64',
    'Médicaments': '#ffc069',
    'Livres': '#b37feb',
    'Jouets': '#ff85c0',
    'Mobilier': '#ffd666',
    'Électronique': '#5cdbd3',
    'Autres': '#d9d9d9'
  };

  const color = categoryColors[categoryName || ''] || '#52c41a';
  const size = isHighlighted ? 35 : 28;
  
  return L.divIcon({
    className: `custom-marker-${isHighlighted ? 'highlighted' : 'normal'}`,
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: ${isHighlighted ? 18 : 14}px;
          font-weight: bold;
        ">📦</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  }) as any;
}

/**
 * Table de correspondance des communes avec leurs coordonnées WGS84 réelles
 * Utilisée quand les coordonnées de la commune sont en système projeté
 */
const COMMUNE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'TAROUDANNT': { lat: 30.4703, lng: -8.8769 },
  'TAROUDANT': { lat: 30.4703, lng: -8.8769 },
  'AGADIR': { lat: 30.4278, lng: -9.5981 },
  'CASABLANCA': { lat: 33.5731, lng: -7.5898 },
  'RABAT': { lat: 34.0209, lng: -6.8416 },
  'MARRAKECH': { lat: 31.6295, lng: -7.9811 },
  'FES': { lat: 34.0331, lng: -5.0003 },
  'TANGER': { lat: 35.7673, lng: -5.7998 },
  'MEKNES': { lat: 33.8950, lng: -5.5547 },
  'OUJDA': { lat: 34.6867, lng: -1.9114 },
  'SAFI': { lat: 32.2994, lng: -9.2372 },
  'KENITRA': { lat: 34.2611, lng: -6.5802 },
  'EL JADIDA': { lat: 33.2316, lng: -8.5004 },
  'TETOUAN': { lat: 35.5769, lng: -5.3684 },
  'BENI MELLAL': { lat: 32.3373, lng: -6.3498 },
  'NADOR': { lat: 35.1681, lng: -2.9333 },
  'KHOURIBGA': { lat: 32.8847, lng: -6.9061 },
  'SETTAT': { lat: 33.0014, lng: -7.6167 },
  'LARACHE': { lat: 35.1939, lng: -6.1556 },
  'KSAR EL KEBIR': { lat: 34.9981, lng: -5.9033 },
  'TAZA': { lat: 34.2144, lng: -4.0086 },
  'ERRACHIDIA': { lat: 31.9311, lng: -4.4247 },
  'BERKANE': { lat: 34.9167, lng: -2.3167 },
  'SIDI KACEM': { lat: 34.2333, lng: -5.7000 },
  'TAOURIRT': { lat: 34.4167, lng: -2.9000 },
  'SIDI SLIMANE': { lat: 34.2667, lng: -5.9333 },
  'GUERCIF': { lat: 34.2333, lng: -3.3500 },
  'OUED ZEM': { lat: 32.8667, lng: -6.5667 },
  'FQUIH BEN SALAH': { lat: 32.5000, lng: -6.7000 },
  'TAFRAOUT': { lat: 29.7167, lng: -8.9833 },
  'TIZNIT': { lat: 29.7167, lng: -9.7167 },
  'ESSAOUIRA': { lat: 31.5085, lng: -9.7595 },
  'AZILAL': { lat: 31.9667, lng: -6.5667 },
  'MIDELT': { lat: 32.6833, lng: -4.7333 },
  'FIGUIG': { lat: 32.1167, lng: -1.2167 },
  'OUARZAZATE': { lat: 30.9200, lng: -6.9100 },
  'ZAGORA': { lat: 30.3333, lng: -5.8333 },
  'DAKHLA': { lat: 23.7081, lng: -15.9497 },
  'LAAYOUNE': { lat: 27.1536, lng: -13.2033 },
  'SMARA': { lat: 26.7333, lng: -11.6833 },
  'BOUDENIB': { lat: 32.0500, lng: -3.6000 },
  'JERADA': { lat: 34.3167, lng: -2.1667 },
  'YOUSSOUFIA': { lat: 32.2500, lng: -8.5333 },
  'SIDI IFNI': { lat: 29.3833, lng: -10.1667 },
  'TARFAYA': { lat: 27.9500, lng: -12.9167 },
  'TAN TAN': { lat: 28.4333, lng: -11.1000 },
  'GUELMIM': { lat: 28.9833, lng: -10.0667 },
  'ASILAH': { lat: 35.4667, lng: -6.0333 },
  'CHEFCHAOUEN': { lat: 35.1667, lng: -5.2667 },
  'AL HOCEIMA': { lat: 35.2500, lng: -3.9333 },
  'NADOR': { lat: 35.1681, lng: -2.9333 },
  'TAZA': { lat: 34.2144, lng: -4.0086 },
  'IFRANE': { lat: 33.5333, lng: -5.1167 },
  'AZROU': { lat: 33.4333, lng: -5.2167 },
  'KHENIFRA': { lat: 32.9333, lng: -5.6667 },
  'DEMNATE': { lat: 31.7333, lng: -7.0000 },
  'BEN GUERIR': { lat: 32.2333, lng: -7.9500 },
  'YOUSSOUFIA': { lat: 32.2500, lng: -8.5333 },
  'SAFI': { lat: 32.2994, lng: -9.2372 },
  'EL JADIDA': { lat: 33.2316, lng: -8.5004 },
  'CASABLANCA': { lat: 33.5731, lng: -7.5898 },
  'MOHAMMEDIA': { lat: 33.6833, lng: -7.3833 },
  'TEMARA': { lat: 33.9167, lng: -6.9167 },
  'RABAT': { lat: 34.0209, lng: -6.8416 },
  'SALE': { lat: 34.0500, lng: -6.8167 },
  'KENITRA': { lat: 34.2611, lng: -6.5802 },
  'SIDI KACEM': { lat: 34.2333, lng: -5.7000 },
  'SIDI SLIMANE': { lat: 34.2667, lng: -5.9333 },
  'MEKNES': { lat: 33.8950, lng: -5.5547 },
  'FES': { lat: 34.0331, lng: -5.0003 },
  'TAZA': { lat: 34.2144, lng: -4.0086 },
  'OUJDA': { lat: 34.6867, lng: -1.9114 },
  'BERKANE': { lat: 34.9167, lng: -2.3167 },
  'NADOR': { lat: 35.1681, lng: -2.9333 },
  'AL HOCEIMA': { lat: 35.2500, lng: -3.9333 },
  'TANGER': { lat: 35.7673, lng: -5.7998 },
  'TETOUAN': { lat: 35.5769, lng: -5.3684 },
  'LARACHE': { lat: 35.1939, lng: -6.1556 },
  'KSAR EL KEBIR': { lat: 34.9981, lng: -5.9033 },
  'ASILAH': { lat: 35.4667, lng: -6.0333 },
  'CHEFCHAOUEN': { lat: 35.1667, lng: -5.2667 },
  'OUARZAZATE': { lat: 30.9200, lng: -6.9100 },
  'ZAGORA': { lat: 30.3333, lng: -5.8333 },
  'TAROUDANT': { lat: 30.4703, lng: -8.8769 },
  'TAROUDANNT': { lat: 30.4703, lng: -8.8769 },
  'AGADIR': { lat: 30.4278, lng: -9.5981 },
  'TIZNIT': { lat: 29.7167, lng: -9.7167 },
  'TAFRAOUT': { lat: 29.7167, lng: -8.9833 },
  'SIDI IFNI': { lat: 29.3833, lng: -10.1667 },
  'GUELMIM': { lat: 28.9833, lng: -10.0667 },
  'TAN TAN': { lat: 28.4333, lng: -11.1000 },
  'TARFAYA': { lat: 27.9500, lng: -12.9167 },
  'LAAYOUNE': { lat: 27.1536, lng: -13.2033 },
  'SMARA': { lat: 26.7333, lng: -11.6833 },
  'DAKHLA': { lat: 23.7081, lng: -15.9497 },
  'MARRAKECH': { lat: 31.6295, lng: -7.9811 },
  'ESSAOUIRA': { lat: 31.5085, lng: -9.7595 },
  'BENI MELLAL': { lat: 32.3373, lng: -6.3498 },
  'AZILAL': { lat: 31.9667, lng: -6.5667 },
  'KHOURIBGA': { lat: 32.8847, lng: -6.9061 },
  'SETTAT': { lat: 33.0014, lng: -7.6167 },
  'BEN GUERIR': { lat: 32.2333, lng: -7.9500 },
  'YOUSSOUFIA': { lat: 32.2500, lng: -8.5333 },
  'DEMNATE': { lat: 31.7333, lng: -7.0000 },
  'KHENIFRA': { lat: 32.9333, lng: -5.6667 },
  'MIDELT': { lat: 32.6833, lng: -4.7333 },
  'ERRACHIDIA': { lat: 31.9311, lng: -4.4247 },
  'FIGUIG': { lat: 32.1167, lng: -1.2167 },
  'BOUDENIB': { lat: 32.0500, lng: -3.6000 },
  'JERADA': { lat: 34.3167, lng: -2.1667 },
  'GUERCIF': { lat: 34.2333, lng: -3.3500 },
  'TAOURIRT': { lat: 34.4167, lng: -2.9000 },
  'OUED ZEM': { lat: 32.8667, lng: -6.5667 },
  'FQUIH BEN SALAH': { lat: 32.5000, lng: -6.7000 },
  'IFRANE': { lat: 33.5333, lng: -5.1167 },
  'AZROU': { lat: 33.4333, lng: -5.2167 },
  'TEMARA': { lat: 33.9167, lng: -6.9167 },
  'SALE': { lat: 34.0500, lng: -6.8167 },
  'MOHAMMEDIA': { lat: 33.6833, lng: -7.3833 }
};

/**
 * Trouve les coordonnées WGS84 d'une commune par son nom
 */
function getCommuneCoordinates(communeName: string): { lat: number; lng: number } | null {
  if (!communeName) return null;
  
  // Normaliser le nom (majuscules, sans accents)
  const normalized = communeName.toUpperCase().trim();
  
  // Chercher dans la table de correspondance
  const coords = COMMUNE_COORDINATES[normalized];
  if (coords) {
    console.log(`[getCommuneCoordinates] ✅ Coordonnées trouvées pour ${communeName}:`, coords);
    return coords;
  }
  
  // Essayer avec des variations
  for (const [key, value] of Object.entries(COMMUNE_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      console.log(`[getCommuneCoordinates] ✅ Coordonnées trouvées (variation) pour ${communeName}:`, value);
      return value;
    }
  }
  
  console.warn(`[getCommuneCoordinates] ⚠️ Aucune coordonnée trouvée pour ${communeName}`);
  return null;
}

/**
 * Valide que les coordonnées sont dans les limites du Maroc
 */
export function isValidMoroccoCoordinates(lat: number, lng: number): boolean {
  // Limites approximatives du Maroc
  const moroccoBounds = {
    minLat: 23.0,
    maxLat: 35.8,
    minLng: -17.0,
    maxLng: -1.1
  };
  
  return (
    lat >= moroccoBounds.minLat &&
    lat <= moroccoBounds.maxLat &&
    lng >= moroccoBounds.minLng &&
    lng <= moroccoBounds.maxLng
  );
}

/**
 * Extrait les coordonnées d'une annonce avec validation
 * Gère automatiquement l'inversion lat/lng si nécessaire
 * Détecte aussi les coordonnées en système projeté (mètres) et les convertit
 */
export function extractCoordinates(announcement: Annonce): { lat: number; lng: number } | null {
  if (!announcement.geom?.coordinates) {
    console.warn('[extractCoordinates] Annonce sans géométrie:', announcement.id);
    return null;
  }

  const [coord1, coord2] = announcement.geom.coordinates;
  
  if (!coord1 || !coord2 || isNaN(coord1) || isNaN(coord2)) {
    console.warn('[extractCoordinates] Coordonnées invalides:', { id: announcement.id, coord1, coord2 });
    return null;
  }

  console.log(`[extractCoordinates] Annonce ${announcement.id} - Coordonnées brutes: [${coord1}, ${coord2}]`);

  // Détecter si les coordonnées sont en système projeté (mètres) au lieu de degrés WGS84
  // Les coordonnées projetées sont généralement très grandes (millions)
  // Les coordonnées WGS84 pour le Maroc sont: lat ~20-36, lng ~-17 à -1
  const isProjected = Math.abs(coord1) > 1000 || Math.abs(coord2) > 1000;
  
  if (isProjected) {
    console.warn('[extractCoordinates] Coordonnées en système projeté détectées (mètres), conversion nécessaire:', {
      id: announcement.id,
      coord1,
      coord2,
      note: 'Les coordonnées semblent être en mètres, pas en degrés WGS84'
    });
    // Si c'est en système projeté, on ne peut pas convertir sans connaître le SRID exact
    // On va utiliser les coordonnées de la commune si disponibles
    if (announcement.commune?.geom?.coordinates) {
      const [commLng, commLat] = announcement.commune.geom.coordinates;
      if (commLat >= 20 && commLat <= 36 && commLng >= -17 && commLng <= -1) {
        console.log(`[extractCoordinates] Utilisation des coordonnées de la commune pour annonce ${announcement.id}`);
        return { lat: commLat, lng: commLng };
      }
    }
    // Fallback vers centre du Maroc
    console.warn('[extractCoordinates] Utilisation du centre du Maroc comme fallback');
    return { lat: 28.5, lng: -8.0 };
  }

  // PRIORITÉ: Utiliser les coordonnées de la commune si disponibles
  // Les communes ont généralement les bonnes coordonnées
  if (announcement.commune?.nomCommune) {
    const communeName = announcement.commune.nomCommune;
    
    // D'abord, essayer la table de correspondance (coordonnées WGS84 réelles)
    const knownCoords = getCommuneCoordinates(communeName);
    if (knownCoords) {
      console.log(`[extractCoordinates] ✅ Utilisation coordonnées connues pour ${communeName}:`, knownCoords);
      return knownCoords;
    }
    
    // Sinon, essayer d'extraire depuis la géométrie de la commune
    if (announcement.commune.geom?.coordinates) {
      const [commCoord1, commCoord2] = announcement.commune.geom.coordinates;
      console.log(`[extractCoordinates] Coordonnées de la commune ${communeName}: [${commCoord1}, ${commCoord2}]`);
      
      // Détecter si c'est en système projeté (mètres)
      const isProjected = Math.abs(commCoord1) > 1000 || Math.abs(commCoord2) > 1000;
      
      if (isProjected) {
        console.warn(`[extractCoordinates] ⚠️ Coordonnées de la commune ${communeName} en système projeté, utilisation de la table de correspondance échouée`);
        // Ne pas utiliser ces coordonnées projetées
      } else {
        // Essayer l'ordre [lng, lat] pour la commune
        let commLat = commCoord2;
        let commLng = commCoord1;
        
        if (isValidMoroccoCoordinates(commLat, commLng)) {
          console.log(`[extractCoordinates] ✅ Utilisation coordonnées commune [lng, lat]: lat=${commLat}, lng=${commLng}`);
          return { lat: commLat, lng: commLng };
        }
        
        // Essayer l'ordre inverse [lat, lng] pour la commune
        commLat = commCoord1;
        commLng = commCoord2;
        
        if (isValidMoroccoCoordinates(commLat, commLng)) {
          console.log(`[extractCoordinates] ✅ Utilisation coordonnées commune [lat, lng]: lat=${commLat}, lng=${commLng}`);
          return { lat: commLat, lng: commLng };
        }
      }
    }
  }

  // Si la commune n'a pas de coordonnées valides, utiliser celles de l'annonce
  // Essayer d'abord l'ordre GeoJSON standard [lng, lat]
  let lat = coord2;
  let lng = coord1;
  
  console.log(`[extractCoordinates] Essai ordre [lng, lat]: lat=${lat}, lng=${lng}`);
  
  // Vérifier si les coordonnées sont dans les limites du Maroc
  if (!isValidMoroccoCoordinates(lat, lng)) {
    // Si pas valides, essayer l'ordre inverse [lat, lng]
    console.warn('[extractCoordinates] Coordonnées hors du Maroc avec ordre [lng, lat], essai avec ordre inverse:', { 
      id: announcement.id, 
      original: { lng: coord1, lat: coord2 },
      inverted: { lat: coord1, lng: coord2 }
    });
    
    // Essayer l'ordre inverse
    lat = coord1;
    lng = coord2;
    
    console.log(`[extractCoordinates] Essai ordre [lat, lng]: lat=${lat}, lng=${lng}`);
    
    // Vérifier à nouveau
    if (!isValidMoroccoCoordinates(lat, lng)) {
      console.error('[extractCoordinates] Coordonnées invalides même après inversion:', { 
        id: announcement.id, 
        coord1, 
        coord2,
        asLngLat: { lng: coord1, lat: coord2 },
        asLatLng: { lat: coord1, lng: coord2 },
        titre: announcement.titre,
        commune: announcement.commune?.nomCommune
      });
      
      // Utiliser le centre du Maroc comme fallback
      console.warn('[extractCoordinates] Fallback vers centre du Maroc');
      return { lat: 28.5, lng: -8.0 };
    } else {
      console.log(`[extractCoordinates] ✅ Coordonnées valides après inversion pour annonce ${announcement.id}`);
    }
  } else {
    console.log(`[extractCoordinates] ✅ Coordonnées valides (ordre [lng, lat]) pour annonce ${announcement.id}`);
  }

  return { lat, lng };
}

