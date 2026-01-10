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
 * Si la quantité > 1, génère plusieurs markers (un par unité)
 */
export function prepareAnnouncementsWithOffsets(
  announcements: Annonce[], 
  currentZoom?: number,
  minZoomForMultipleMarkers: number = 10
): Array<{
  announcement: Annonce;
  position: [number, number];
  offsetIndex: number;
  totalAtLocation: number;
  quantityIndex: number; // Toujours 0 maintenant (1 marker = 1 annonce)
  totalQuantity: number; // Quantité totale de l'annonce (pour affichage dans le badge)
}> {
  const groups = groupByCoordinates(announcements);
  const result: Array<{
    announcement: Annonce;
    position: [number, number];
    offsetIndex: number;
    totalAtLocation: number;
    quantityIndex: number;
    totalQuantity: number;
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
      
      // UN SEUL MARKER PAR ANNONCE, peu importe la quantité
      // La quantité sera affichée dans le popup, pas comme plusieurs markers
      const offsetPosition = calculateMarkerOffset(lat, lng, index, group.length);
      
      result.push({
        announcement,
        position: offsetPosition,
        offsetIndex: index,
        totalAtLocation: group.length,
        quantityIndex: 0,
        totalQuantity: announcement.quatite || 1
      });
    });
  });

  return result;
}

/**
 * Crée une icône personnalisée avec couleur par catégorie
 * Amélioré avec effet hover et support des markers multiples
 */
export function createCategoryIcon(
  categoryName: string | undefined,
  isHighlighted: boolean = false,
  isHovered: boolean = false,
  quantityIndex: number = 0,
  totalQuantity: number = 1
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
  
  // Taille selon l'état ET la quantité (markers plus grands si quantité plus grande)
  // Taille de base selon la quantité: 28px pour qty=1, +2px par unité supplémentaire (max 48px)
  const baseSize = 28 + Math.min((totalQuantity - 1) * 2, 20); // Max 48px
  let size = baseSize;
  if (isHighlighted) size = Math.min(baseSize + 6, 50); // Max 50px
  if (isHovered && !isHighlighted) size = Math.min(baseSize + 3, 45); // Max 45px
  
  // Émojis selon la catégorie
  const categoryEmojis: Record<string, string> = {
    'Nourriture': '🍞',
    'Vêtements': '👕',
    'Équipements': '🔧',
    'Médicaments': '💊',
    'Livres': '📚',
    'Jouets': '🧸',
    'Mobilier': '🪑',
    'Électronique': '📱',
    'Autres': '📦'
  };
  
  const emoji = categoryEmojis[categoryName || ''] || '📦';
  
  // Afficher TOUJOURS un badge avec la quantité sur le marker (même si c'est 1)
  // S'assurer que totalQuantity est au moins 1
  const quantity = totalQuantity && totalQuantity > 0 ? totalQuantity : 1;
  const showQuantityBadge = true; // TOUJOURS afficher le badge
  
  return L.divIcon({
    className: `custom-marker ${isHighlighted ? 'highlighted' : ''} ${isHovered ? 'hovered' : ''}`,
    html: `
      <div class="marker-container" style="
        position: relative;
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: ${isHighlighted ? '4px' : isHovered ? '3.5px' : '3px'} solid white;
        box-shadow: ${isHovered ? '0 5px 15px rgba(0,0,0,0.5)' : isHighlighted ? '0 4px 12px rgba(24, 144, 255, 0.6)' : '0 3px 10px rgba(0,0,0,0.4)'};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 1.0;
        cursor: pointer;
        z-index: ${isHovered || isHighlighted ? 1000 : 100};
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: ${size * 0.55}px;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0,0,0,0.4);
          line-height: 1;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        ">${emoji}</div>
        ${showQuantityBadge ? `
          <div style="
            position: absolute;
            top: -10px;
            right: -10px;
            background: ${quantity > 1 ? 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' : 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'};
            color: white;
            border-radius: 50%;
            width: ${quantity > 99 ? '26px' : '24px'};
            height: ${quantity > 99 ? '26px' : '24px'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${quantity > 99 ? '9px' : quantity > 9 ? '10px' : '12px'};
            font-weight: bold;
            border: 3px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3);
            transform: rotate(45deg);
            z-index: 1001;
            min-width: ${quantity > 99 ? '26px' : '24px'};
          ">
            <span style="transform: rotate(-45deg);">${quantity}</span>
          </div>
        ` : ''}
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
 * Nettoyée pour enlever les doublons
 */
const COMMUNE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'AGADIR': { lat: 30.4278, lng: -9.5981 },
  'AL HOCEIMA': { lat: 35.2500, lng: -3.9333 },
  'ASILAH': { lat: 35.4667, lng: -6.0333 },
  'AZILAL': { lat: 31.9667, lng: -6.5667 },
  'AZROU': { lat: 33.4333, lng: -5.2167 },
  'BEN GUERIR': { lat: 32.2333, lng: -7.9500 },
  'BENI MELLAL': { lat: 32.3373, lng: -6.3498 },
  'BERKANE': { lat: 34.9167, lng: -2.3167 },
  'BOUDENIB': { lat: 32.0500, lng: -3.6000 },
  'CASABLANCA': { lat: 33.5731, lng: -7.5898 },
  'CHEFCHAOUEN': { lat: 35.1667, lng: -5.2667 },
  'DAKHLA': { lat: 23.7081, lng: -15.9497 },
  'DEMNATE': { lat: 31.7333, lng: -7.0000 },
  'EL JADIDA': { lat: 33.2316, lng: -8.5004 },
  'ERRACHIDIA': { lat: 31.9311, lng: -4.4247 },
  'ESSAOUIRA': { lat: 31.5085, lng: -9.7595 },
  'FES': { lat: 34.0331, lng: -5.0003 },
  'FIGUIG': { lat: 32.1167, lng: -1.2167 },
  'FQUIH BEN SALAH': { lat: 32.5000, lng: -6.7000 },
  'GUELMIM': { lat: 28.9833, lng: -10.0667 },
  'GUERCIF': { lat: 34.2333, lng: -3.3500 },
  'IFRANE': { lat: 33.5333, lng: -5.1167 },
  'JERADA': { lat: 34.3167, lng: -2.1667 },
  'KENITRA': { lat: 34.2611, lng: -6.5802 },
  'KHENIFRA': { lat: 32.9333, lng: -5.6667 },
  'KHOURIBGA': { lat: 32.8847, lng: -6.9061 },
  'KSAR EL KEBIR': { lat: 34.9981, lng: -5.9033 },
  'LAAYOUNE': { lat: 27.1536, lng: -13.2033 },
  'LARACHE': { lat: 35.1939, lng: -6.1556 },
  'MARRAKECH': { lat: 31.6295, lng: -7.9811 },
  'MEKNES': { lat: 33.8950, lng: -5.5547 },
  'MIDELT': { lat: 32.6833, lng: -4.7333 },
  'MOHAMMEDIA': { lat: 33.6833, lng: -7.3833 },
  'NADOR': { lat: 35.1681, lng: -2.9333 },
  'OUARZAZATE': { lat: 30.9200, lng: -6.9100 },
  'OUED ZEM': { lat: 32.8667, lng: -6.5667 },
  'OUJDA': { lat: 34.6867, lng: -1.9114 },
  'RABAT': { lat: 34.0209, lng: -6.8416 },
  'SAFI': { lat: 32.2994, lng: -9.2372 },
  'SALE': { lat: 34.0500, lng: -6.8167 },
  'SETTAT': { lat: 33.0014, lng: -7.6167 },
  'SIDI IFNI': { lat: 29.3833, lng: -10.1667 },
  'SIDI KACEM': { lat: 34.2333, lng: -5.7000 },
  'SIDI SLIMANE': { lat: 34.2667, lng: -5.9333 },
  'SMARA': { lat: 26.7333, lng: -11.6833 },
  'TAFRAOUT': { lat: 29.7167, lng: -8.9833 },
  'TAN TAN': { lat: 28.4333, lng: -11.1000 },
  'TANGER': { lat: 35.7673, lng: -5.7998 },
  'TARFAYA': { lat: 27.9500, lng: -12.9167 },
  'TAROUDANT': { lat: 30.4703, lng: -8.8769 },
  'TAROUDANNT': { lat: 30.4703, lng: -8.8769 }, // Variante orthographique
  'TAOURIRT': { lat: 34.4167, lng: -2.9000 },
  'TAZA': { lat: 34.2144, lng: -4.0086 },
  'TEMARA': { lat: 33.9167, lng: -6.9167 },
  'TETOUAN': { lat: 35.5769, lng: -5.3684 },
  'TIZNIT': { lat: 29.7167, lng: -9.7167 },
  'YOUSSOUFIA': { lat: 32.2500, lng: -8.5333 },
  'ZAGORA': { lat: 30.3333, lng: -5.8333 }
};

/**
 * Trouve les coordonnées WGS84 d'une commune par son nom
 * Recherche améliorée avec normalisation et correspondances partielles
 */
function getCommuneCoordinates(communeName: string): { lat: number; lng: number } | null {
  if (!communeName || !communeName.trim()) return null;
  
  // Normaliser le nom (majuscules, sans accents, sans espaces multiples)
  const normalize = (str: string) => {
    return str
      .toUpperCase()
      .trim()
      .replace(/\s+/g, ' ') // Espaces multiples -> un seul
      .replace(/[ÉÈÊË]/g, 'E')
      .replace(/[ÀÂ]/g, 'A')
      .replace(/[Ô]/g, 'O')
      .replace(/[ÎÏ]/g, 'I')
      .replace(/[ÙÛ]/g, 'U');
  };
  
  const normalized = normalize(communeName);
  
  // 1. Recherche exacte
  const exactMatch = COMMUNE_COORDINATES[normalized];
  if (exactMatch) {
    console.log(`[getCommuneCoordinates] ✅ EXACTE: ${communeName} ->`, exactMatch);
    return exactMatch;
  }
  
  // 2. Recherche sans accents et variations
  for (const [key, value] of Object.entries(COMMUNE_COORDINATES)) {
    const normalizedKey = normalize(key);
    if (normalized === normalizedKey) {
      console.log(`[getCommuneCoordinates] ✅ NORMALISE: ${communeName} -> ${key}:`, value);
      return value;
    }
  }
  
  // 3. Recherche par inclusion (communeName contient la clé ou vice versa)
  for (const [key, value] of Object.entries(COMMUNE_COORDINATES)) {
    const normalizedKey = normalize(key);
    if (normalized.includes(normalizedKey) || normalizedKey.includes(normalized)) {
      // Vérifier que la correspondance est significative (au moins 3 caractères)
      const minLength = Math.min(normalized.length, normalizedKey.length);
      if (minLength >= 3) {
        console.log(`[getCommuneCoordinates] ✅ INCLUSION: ${communeName} -> ${key}:`, value);
        return value;
      }
    }
  }
  
  // 4. Recherche par mots (si le nom de la commune contient plusieurs mots)
  const words = normalized.split(/\s+/).filter(w => w.length >= 3);
  for (const word of words) {
    for (const [key, value] of Object.entries(COMMUNE_COORDINATES)) {
      const normalizedKey = normalize(key);
      if (normalizedKey.includes(word) || word.includes(normalizedKey)) {
        console.log(`[getCommuneCoordinates] ✅ MOT: ${communeName} (mot: ${word}) -> ${key}:`, value);
        return value;
      }
    }
  }
  
  console.warn(`[getCommuneCoordinates] ⚠️ AUCUNE correspondance pour "${communeName}" (normalisé: "${normalized}")`);
  return null;
}

/**
 * Valide que les coordonnées sont dans les limites du Maroc
 * Plus strict : rejette tout ce qui pourrait être en Algérie ou ailleurs
 */
export function isValidMoroccoCoordinates(lat: number, lng: number): boolean {
  // Limites STRICTES du Maroc (avec marge de sécurité pour éviter l'Algérie)
  const moroccoBounds = {
    minLat: 21.0,   // Sud (Dakhla)
    maxLat: 36.0,   // Nord (Tanger/Ceuta)
    minLng: -17.0,  // Ouest (côte atlantique)
    maxLng: -1.0    // Est (frontière Algérie, en évitant de dépasser)
  };
  
  // Validation stricte
  if (lat < moroccoBounds.minLat || lat > moroccoBounds.maxLat) {
    return false;
  }
  if (lng < moroccoBounds.minLng || lng > moroccoBounds.maxLng) {
    return false;
  }
  
  // Rejeter spécifiquement les zones d'Algérie connues
  // Algérie: lng généralement > -1.0 (plus à l'est), mais aussi certaines zones frontalières
  // Tindouf (Algérie) est autour de lat 27.6, lng -8.1 (frontière sud-ouest)
  // Rejeter si on est trop à l'est (Algérie orientale)
  if (lng > -0.5) {
    return false; // Trop à l'est, probablement Algérie
  }
  
  return true;
}

/**
 * Extrait les coordonnées d'une annonce avec validation STRICTE
 * PRIORITÉ ABSOLUE: Table de correspondance des communes
 * GARANTIT que toutes les coordonnées sont au Maroc
 */
export function extractCoordinates(announcement: Annonce): { lat: number; lng: number } | null {
  // ÉTAPE 1: PRIORITÉ ABSOLUE - Table de correspondance des communes
  // C'est la source la plus fiable, toujours utiliser en premier
  if (announcement.commune?.nomCommune) {
    const communeName = announcement.commune.nomCommune.trim();
    const knownCoords = getCommuneCoordinates(communeName);
    
    if (knownCoords && isValidMoroccoCoordinates(knownCoords.lat, knownCoords.lng)) {
      console.log(`[extractCoordinates] ✅ PRIORITÉ: Coordonnées connues pour ${communeName}:`, knownCoords);
      return knownCoords;
    }
    
    // Si la commune n'est pas dans la table, essayer des variations du nom
    const variations = [
      communeName.toUpperCase(),
      communeName.replace(/[ÉÈÊË]/g, 'E').replace(/[ÀÂ]/g, 'A').toUpperCase(),
      communeName.split(' ')[0].toUpperCase(), // Premier mot
    ];
    
    for (const variation of variations) {
      const variantCoords = getCommuneCoordinates(variation);
      if (variantCoords && isValidMoroccoCoordinates(variantCoords.lat, variantCoords.lng)) {
        console.log(`[extractCoordinates] ✅ VARIATION: Coordonnées trouvées pour "${variation}" (original: ${communeName}):`, variantCoords);
        return variantCoords;
      }
    }
  }

  // ÉTAPE 2: Si pas de commune ou pas dans la table, essayer la géométrie de l'annonce
  if (!announcement.geom?.coordinates) {
    console.warn(`[extractCoordinates] ⚠️ Annonce ${announcement.id} sans géométrie, utilisation du centre du Maroc`);
    return { lat: 28.5, lng: -8.0 };
  }

  const [coord1, coord2] = announcement.geom.coordinates;
  
  if (!coord1 || !coord2 || isNaN(coord1) || isNaN(coord2)) {
    console.warn(`[extractCoordinates] ⚠️ Coordonnées NaN pour annonce ${announcement.id}, utilisation du centre du Maroc`);
    return { lat: 28.5, lng: -8.0 };
  }

  // Détecter si les coordonnées sont en système projeté (mètres)
  // Les coordonnées WGS84 pour le Maroc: lat ~21-36, lng ~-17 à -1
  const isProjected = Math.abs(coord1) > 1000 || Math.abs(coord2) > 1000;
  
  if (isProjected) {
    console.warn(`[extractCoordinates] ⚠️ Coordonnées projetées détectées pour annonce ${announcement.id}: [${coord1}, ${coord2}]`);
    // Si projeté, on ne peut pas les utiliser directement
    // Fallback vers centre du Maroc ou commune
    if (announcement.commune?.nomCommune) {
      const defaultCoords = { lat: 32.0, lng: -6.0 }; // Centre géographique Maroc
      console.log(`[extractCoordinates] Utilisation coordonnées par défaut pour commune ${announcement.commune.nomCommune}`);
      return defaultCoords;
    }
    return { lat: 28.5, lng: -8.0 };
  }

  // ÉTAPE 3: Essayer les deux ordres possibles [lng, lat] et [lat, lng]
  // Essayer [lng, lat] d'abord (standard GeoJSON)
  let lat = coord2;
  let lng = coord1;
  
  if (isValidMoroccoCoordinates(lat, lng)) {
    console.log(`[extractCoordinates] ✅ Ordre [lng, lat] valide pour annonce ${announcement.id}: lat=${lat}, lng=${lng}`);
    return { lat, lng };
  }
  
  // Essayer l'ordre inverse [lat, lng]
  lat = coord1;
  lng = coord2;
  
  if (isValidMoroccoCoordinates(lat, lng)) {
    console.log(`[extractCoordinates] ✅ Ordre [lat, lng] valide pour annonce ${announcement.id}: lat=${lat}, lng=${lng}`);
    return { lat, lng };
  }

  // ÉTAPE 4: Si rien ne fonctionne, fallback sécurisé
  console.error(`[extractCoordinates] ❌ Coordonnées invalides pour annonce ${announcement.id}:`, {
    coord1,
    coord2,
    titre: announcement.titre,
    commune: announcement.commune?.nomCommune,
    note: 'Les coordonnées sont hors du Maroc ou invalides, utilisation du centre par défaut'
  });
  
  // Utiliser le centre du Maroc comme fallback absolu
  return { lat: 28.5, lng: -8.0 };
}

