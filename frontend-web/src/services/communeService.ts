import { api } from '../utils/api';
import type { Commune } from '../types/api';

const BASE_URL = '/api/v1';

/**
 * Récupère toutes les communes
 */
export async function getCommunes(): Promise<Commune[]> {
  try {
    console.log('[getCommunes] Appel API:', `${BASE_URL}/communes`);
    const response = await api.get(`${BASE_URL}/communes`);
    console.log('[getCommunes] Réponse brute:', response);
    console.log('[getCommunes] response.data:', response.data);
    console.log('[getCommunes] Type de response.data:', typeof response.data);
    console.log('[getCommunes] Est un tableau?', Array.isArray(response.data));
    
    let data = response.data;
    
    // Si la réponse est un objet avec 'value', extraire le tableau
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if ('value' in data) {
        data = data.value;
        console.log('[getCommunes] Données extraites de value:', data);
      } else if ('data' in data) {
        data = data.data;
        console.log('[getCommunes] Données extraites de data:', data);
      }
    }
    
    // Convertir en tableau si nécessaire
    let communes: Commune[] = [];
    if (Array.isArray(data)) {
      communes = data;
    } else if (data && typeof data === 'object') {
      // Si c'est un objet Iterable ou similaire, essayer de le convertir
      try {
        communes = Array.from(data as any);
      } catch (e) {
        console.warn('[getCommunes] Impossible de convertir en tableau:', e);
        communes = [];
      }
    } else {
      communes = [];
    }
    
    // Mapper les champs si nécessaire
    const mappedCommunes = communes.map((comm: any) => {
      const nomCommune = comm.nomCommune || comm.nomcommune || comm.libelle || comm.name || '';
      const gid = comm.gid || comm.id;
      const typeCommun = comm.typeCommun || comm.typecommun || comm.type || '';
      
      console.log('[getCommunes] Mapping comm:', { 
        gid, 
        nomCommune, 
        typeCommun,
        original: comm 
      });
      
      return {
        gid: gid,
        nomCommune: nomCommune,
        typeCommun: typeCommun,
        geom: comm.geom
      };
    });
    
    console.log('[getCommunes] Communes finales:', mappedCommunes.length, mappedCommunes);
    return mappedCommunes;
  } catch (error: any) {
    console.error('[getCommunes] Erreur complète:', error);
    console.error('[getCommunes] Erreur détaillée:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      url: error?.config?.url
    });
    
    // Si erreur réseau, suggérer de démarrer le backend
    if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
      console.error('[getCommunes] ⚠️ Backend non accessible. Démarrer avec: .\\DEMARRER_BACKEND.ps1');
    }
    
    return [];
  }
}


