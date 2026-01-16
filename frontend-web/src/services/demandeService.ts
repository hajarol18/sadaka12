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
    console.log(`[getDemandesByAnnonce] ⚠️ Appel API pour annonce ${annonceId}`);
    const response = await api.get(`${BASE_URL}/demandes/annonce/${annonceId}`);
    console.log(`[getDemandesByAnnonce] ⚠️ Réponse brute:`, response);
    let data = response.data;
    console.log(`[getDemandesByAnnonce] ⚠️ response.data:`, data);
    
    // S'assurer que c'est un tableau
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if ('value' in data) {
        data = data.value;
        console.log(`[getDemandesByAnnonce] ⚠️ Données extraites de value:`, data);
      }
    }
    
    const result = Array.isArray(data) ? data : [];
    console.log(`[getDemandesByAnnonce] ⚠️ Résultat final:`, result.length, 'demandes');
    
    // Log détaillé de chaque demande
    result.forEach((d: any, index: number) => {
      console.log(`[getDemandesByAnnonce] ⚠️ ===== DEMANDE ${index + 1} =====`);
      console.log(`[getDemandesByAnnonce] ⚠️ ID:`, d.id);
      console.log(`[getDemandesByAnnonce] ⚠️ Status brut:`, d.status);
      console.log(`[getDemandesByAnnonce] ⚠️ Status type:`, typeof d.status);
      console.log(`[getDemandesByAnnonce] ⚠️ quantiteAssignee:`, d.quantiteAssignee);
      console.log(`[getDemandesByAnnonce] ⚠️ quantite_assignee:`, d.quantite_assignee);
      console.log(`[getDemandesByAnnonce] ⚠️ Tous les champs:`, Object.keys(d));
      console.log(`[getDemandesByAnnonce] ⚠️ Objet complet:`, JSON.stringify(d, null, 2));
      console.log(`[getDemandesByAnnonce] ⚠️ ====================`);
    });
    
    return result;
  } catch (error: any) {
    console.error('[getDemandesByAnnonce] Erreur:', error);
    return [];
  }
}

/**
 * Crée une nouvelle demande
 * Note: Selon le cahier des charges, un utilisateur peut être donateur ET bénéficiaire
 * MAIS il ne peut pas faire de demande sur sa propre annonce
 */
export async function createDemande(annonceId: number, userId: number): Promise<boolean> {
  try {
    console.log('[createDemande] Création demande: annonceId=' + annonceId + ', userId=' + userId);
    const params = new URLSearchParams();
    params.append('id_annonce', annonceId.toString());
    params.append('id_user', userId.toString());
    
    const response = await api.post(`${BASE_URL}/demandea`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Le backend retourne maintenant un objet JSON avec {success: true/false, message: "..."}
    const success = response.status === 200 && (response.data?.success === true || response.data === 1 || response.data === true);
    if (success) {
      console.log('[createDemande] Demande créée avec succès');
      return true;
    } else {
      const errorMsg = response.data?.message || 'Échec de la création de la demande';
      console.warn('[createDemande] Réponse inattendue:', response.data);
      throw new Error(errorMsg);
    }
  } catch (error: any) {
    console.error('[createDemande] Erreur:', error);
    // Si l'erreur est de cooldown (429 Too Many Requests)
    if (error?.response?.status === 429) {
      const errorMessage = error?.response?.data?.message || 'Vous êtes en cooldown. Réessayez plus tard.';
      const customError = new Error(errorMessage);
      (customError as any).status = 429;
      throw customError;
    }
    // Si l'erreur est du backend (400 Bad Request)
    if (error?.response?.status === 400 && error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    // Si l'erreur est "vous ne pouvez pas faire de demande sur votre propre annonce"
    if (error?.response?.data?.message?.includes('propre annonce')) {
      throw new Error('Vous ne pouvez pas faire de demande sur votre propre annonce');
    }
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
    console.log('[hasRecentDemande] Vérification demande récente: annonceId=' + annonceId + ', userId=' + userId);
    const demandes = await getDemandesByUser(userId);
    
    // S'assurer que demandes est un tableau
    if (!Array.isArray(demandes)) {
      console.warn('[hasRecentDemande] demandes n\'est pas un tableau:', demandes);
      return false;
    }
    
    console.log('[hasRecentDemande] Nombre total de demandes pour l\'utilisateur:', demandes.length);
    
    // Filtrer les demandes pour cette annonce
    const demandesPourAnnonce = demandes.filter((d: any) => {
      const annonceIdFromDemande = d.annonce?.id || d.annonce_id || d.annonceId || (d.annonce && typeof d.annonce === 'object' ? d.annonce.id : null);
      const matches = annonceIdFromDemande === annonceId || annonceIdFromDemande?.toString() === annonceId.toString();
      if (matches) {
        console.log('[hasRecentDemande] Demande trouvée pour cette annonce:', {
          demandeId: d.id,
          annonceId: annonceIdFromDemande,
          date: d.date
        });
      }
      return matches;
    });
    
    console.log('[hasRecentDemande] Nombre de demandes pour cette annonce:', demandesPourAnnonce.length);
    
    if (!Array.isArray(demandesPourAnnonce) || demandesPourAnnonce.length === 0) {
      console.log('[hasRecentDemande] Aucune demande trouvée pour cette annonce');
      return false;
    }
    
    // Vérifier si une demande a été faite dans les 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const hasRecent = demandesPourAnnonce.some((d: any) => {
      if (!d.date) {
        // Si pas de date, considérer comme récent (pour sécurité)
        console.warn('[hasRecentDemande] Demande sans date, considérée comme récente:', d.id);
        return true;
      }
      
      const demandeDate = new Date(d.date);
      const isRecent = demandeDate >= thirtyDaysAgo;
      
      if (isRecent) {
        console.log('[hasRecentDemande] Demande récente trouvée (moins de 30 jours):', {
          demandeId: d.id,
          date: d.date,
          daysAgo: Math.floor((new Date().getTime() - demandeDate.getTime()) / (1000 * 60 * 60 * 24))
        });
      }
      
      return isRecent;
    });
    
    console.log('[hasRecentDemande] Résultat:', hasRecent);
    return hasRecent;
  } catch (error: any) {
    console.error('[hasRecentDemande] Erreur:', error);
    // En cas d'erreur, retourner true pour bloquer (sécurité)
    return true;
  }
}

/**
 * Assigner une quantité à une demande (par le donateur)
 * @param demandeId ID de la demande
 * @param quantite Quantité à assigner
 * @param donnateurId ID du donateur (pour vérification)
 */
export async function assignDemande(demandeId: number, quantite: number, donnateurId: number): Promise<boolean> {
  try {
    console.log('[assignDemande] Assignation: demandeId=' + demandeId + ', quantite=' + quantite + ', donnateurId=' + donnateurId);
    const params = new URLSearchParams();
    params.append('quantite', quantite.toString());
    params.append('donnateur_id', donnateurId.toString());
    
    const response = await api.put(`${BASE_URL}/demande/${demandeId}/assign`, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const success = response.status === 200 && response.data?.success === true;
    if (success) {
      console.log('[assignDemande] ✅ Quantité assignée avec succès');
    } else {
      console.warn('[assignDemande] Réponse inattendue:', response.data);
    }
    return success;
  } catch (error: any) {
    console.error('[assignDemande] Erreur:', error);
    if (error?.response?.status === 400 && error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

