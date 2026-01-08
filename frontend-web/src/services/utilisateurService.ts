import { api } from '../utils/api';
import type { Utilisateur } from '../types/api';

const BASE_URL = '/api/v1';

/**
 * Récupère tous les utilisateurs
 */
export async function getUtilisateurs(): Promise<Utilisateur[]> {
  try {
    console.log('[getUtilisateurs] Appel API:', `${BASE_URL}/utilisateurs`);
    const response = await api.get(`${BASE_URL}/utilisateurs`);
    console.log('[getUtilisateurs] Réponse brute:', response);
    console.log('[getUtilisateurs] response.data:', response.data);
    
    let data = response.data;
    
    // Si la réponse est un objet avec 'value', extraire le tableau
    if (data && typeof data === 'object' && !Array.isArray(data) && 'value' in data) {
      data = data.value;
      console.log('[getUtilisateurs] Données extraites de value:', data);
    }
    
    // S'assurer que c'est un tableau
    const utilisateurs = Array.isArray(data) ? data : [];
    console.log('[getUtilisateurs] Utilisateurs finaux:', utilisateurs.length, 'utilisateurs');
    
    return utilisateurs;
  } catch (error: any) {
    console.error('[getUtilisateurs] Erreur:', error);
    console.error('[getUtilisateurs] Erreur détaillée:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });
    return [];
  }
}

/**
 * Supprime un utilisateur (si endpoint existe)
 */
export async function deleteUtilisateur(userId: number): Promise<void> {
  try {
    await api.delete(`${BASE_URL}/utilisateur/${userId}`);
  } catch (error: any) {
    console.error('[deleteUtilisateur] Erreur:', error);
    throw error;
  }
}

