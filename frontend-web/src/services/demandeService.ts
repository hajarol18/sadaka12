import { api } from '../utils/api';
import type { Demande } from '../types/api';

const BASE_URL = '/api/v1';

/**
 * Récupère toutes les demandes d'un utilisateur
 */
export async function getDemandesByUser(userId: number): Promise<Demande[]> {
  try {
    const response = await api.get(`${BASE_URL}/demandes/user/${userId}`);
    let data = response.data;
    
    // S'assurer que c'est un tableau
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if ('value' in data) {
        data = data.value;
      }
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('[getDemandesByUser] Erreur:', error);
    return [];
  }
}

/**
 * Récupère toutes les demandes pour une annonce
 */
export async function getDemandesByAnnonce(annonceId: number): Promise<Demande[]> {
  try {
    const response = await api.get(`${BASE_URL}/demandes/annonce/${annonceId}`);
    let data = response.data;
    
    // S'assurer que c'est un tableau
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if ('value' in data) {
        data = data.value;
      }
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('[getDemandesByAnnonce] Erreur:', error);
    return [];
  }
}

/**
 * Crée une nouvelle demande
 */
export async function createDemande(annonceId: number, userId: number): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.append('id_annonce', annonceId.toString());
    params.append('id_user', userId.toString());
    
    const response = await api.post(`${BASE_URL}/demandea`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.status === 200 || response.data === 1;
  } catch (error: any) {
    console.error('[createDemande] Erreur:', error);
    throw error;
  }
}

/**
 * Supprime une demande
 */
export async function deleteDemande(demandeId: number): Promise<void> {
  await api.delete(`${BASE_URL}/demande/${demandeId}`);
}

/**
 * Vérifie si un utilisateur a fait une demande récente (dans les 30 derniers jours) pour une annonce
 */
export async function hasRecentDemande(annonceId: number, userId: number): Promise<boolean> {
  try {
    const demandes = await getDemandesByUser(userId);
    
    // Filtrer les demandes pour cette annonce
    const demandesPourAnnonce = demandes.filter((d: any) => {
      const annonceIdFromDemande = d.annonce?.id || d.annonce_id || d.annonceId;
      return annonceIdFromDemande === annonceId;
    });
    
    if (demandesPourAnnonce.length === 0) {
      return false;
    }
    
    // Vérifier si une demande a été faite dans les 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const hasRecent = demandesPourAnnonce.some((d: any) => {
      if (!d.date) {
        // Si pas de date, considérer comme récent (pour sécurité)
        return true;
      }
      
      const demandeDate = new Date(d.date);
      return demandeDate >= thirtyDaysAgo;
    });
    
    return hasRecent;
  } catch (error: any) {
    console.error('[hasRecentDemande] Erreur:', error);
    // En cas d'erreur, retourner true pour bloquer (sécurité)
    return true;
  }
}

