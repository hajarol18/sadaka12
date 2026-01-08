import { api } from '../utils/api';
import type { Annonce, Annonce_Perso, Annonce_Fcategorie } from '../types/api';

const BASE_URL = '/api/v1';

/**
 * Récupère toutes les annonces approuvées
 */
export async function getAnnonces(): Promise<Annonce[]> {
  try {
    console.log('[getAnnonces] Appel API:', `${BASE_URL}/annonces`);
    const response = await api.get(`${BASE_URL}/annonces`);
    console.log('[getAnnonces] Réponse brute:', response);
    console.log('[getAnnonces] response.data:', response.data);
    
    let data = response.data;
    
    // Si la réponse est un objet avec 'value', extraire le tableau
    if (data && typeof data === 'object' && !Array.isArray(data) && 'value' in data) {
      data = data.value;
      console.log('[getAnnonces] Données extraites de value:', data);
    }
    
    // S'assurer que c'est un tableau
    const annonces = Array.isArray(data) ? data : Array.from(data || []);
    console.log('[getAnnonces] Annonces finales:', annonces.length, annonces);
    
    return annonces;
  } catch (error: any) {
    console.error('[getAnnonces] Erreur:', error);
    console.error('[getAnnonces] Erreur détaillée:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });
    return [];
  }
}

/**
 * Récupère toutes les annonces en cours de traitement
 */
export async function getAnnoncesEnCours(): Promise<Annonce[]> {
  const response = await api.get(`${BASE_URL}/annonces/encours`);
  return response.data;
}

/**
 * Récupère les annonces formatées pour le filtrage
 */
export async function getAnnoncesForFilter(): Promise<Annonce_Perso[]> {
  const response = await api.get(`${BASE_URL}/annonces_perso`);
  return response.data;
}

/**
 * Récupère une annonce par son ID
 */
export async function getAnnonceById(id: number): Promise<Annonce | null> {
  const response = await api.get(`${BASE_URL}/annonce/${id}`);
  return response.data || null;
}

/**
 * Récupère les annonces d'un utilisateur
 */
export async function getAnnoncesByUser(userId: number): Promise<Annonce[]> {
  try {
    const response = await api.get(`${BASE_URL}/annonces/user/${userId}`);
    let data = response.data;
    
    // S'assurer que c'est un tableau
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if ('value' in data) {
        data = data.value;
      }
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    console.error('[getAnnoncesByUser] Erreur:', error);
    return [];
  }
}

/**
 * Récupère les annonces d'une commune
 */
export async function getAnnoncesByCommune(communeId: number): Promise<Annonce[]> {
  const response = await api.get(`${BASE_URL}/annonces/commune/${communeId}`);
  return response.data;
}

/**
 * Récupère les annonces d'une catégorie
 */
export async function getAnnoncesByCategorie(categorieId: number): Promise<Annonce[]> {
  const response = await api.get(`${BASE_URL}/annonces/categorie/${categorieId}`);
  return response.data;
}

/**
 * Ajoute une nouvelle annonce
 * Note: Le backend attend des form-urlencoded avec @RequestParam
 */
export async function createAnnonce(data: {
  coordinates: [number, number]; // [longitude, latitude]
  titre: string;
  desc: string;
  categorie: number;
  commune: number;
  donnateur: number;
  photo: string;
  quatite?: number; // Quantité (optionnel pour compatibilité)
}): Promise<number> {
  // Spring @RequestParam avec List<Double> attend les paramètres répétés
  const params = new URLSearchParams();
  params.append('titre', data.titre);
  params.append('desc', data.desc);
  params.append('categorie', data.categorie.toString());
  params.append('commune', data.commune.toString());
  params.append('donnateur', data.donnateur.toString());
  params.append('photo', data.photo || '');
  // Pour les listes, Spring attend des paramètres répétés
  params.append('coordinates', data.coordinates[0].toString());
  params.append('coordinates', data.coordinates[1].toString());
  // Note: quatite n'est pas encore supporté par le backend dans le POST

  const response = await api.post(`${BASE_URL}/annonce`, params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

/**
 * Modifie une annonce existante
 */
export async function updateAnnonce(
  id: number,
  data: {
    coordinates: [number, number];
    titre: string;
    desc: string;
    categorie: number;
    commune: number;
    photo: string;
  }
): Promise<number> {
  const params = new URLSearchParams();
  params.append('titre', data.titre);
  params.append('desc', data.desc);
  params.append('categorie', data.categorie.toString());
  params.append('commune', data.commune.toString());
  params.append('photo', data.photo);
  // Pour les listes, Spring attend des paramètres répétés
  params.append('coordinates', data.coordinates[0].toString());
  params.append('coordinates', data.coordinates[1].toString());

  const response = await api.put(`${BASE_URL}/annonce/update/${id}`, params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

/**
 * Supprime une annonce (change le status à "annulée")
 */
export async function deleteAnnonce(id: number): Promise<void> {
  await api.put(`${BASE_URL}/annonce/delete/${id}`);
}

/**
 * Approuve une annonce (change le status à "approuvée")
 */
export async function approveAnnonce(id: number): Promise<void> {
  await api.put(`${BASE_URL}/annonce/approve/${id}`);
}

/**
 * Rejette une annonce (change le status à "rejetée")
 */
export async function rejectAnnonce(id: number): Promise<void> {
  await api.put(`${BASE_URL}/annonce/rejecte/${id}`);
}

/**
 * Marque une annonce comme attribuée
 */
export async function attributeAnnonce(id: number): Promise<void> {
  await api.put(`${BASE_URL}/annonce/attribute/${id}`);
}

/**
 * Récupère les annonces groupées par date
 */
export async function getAnnoncesByDate(): Promise<any[]> {
  const response = await api.get(`${BASE_URL}/annonce/date`);
  return response.data;
}

/**
 * Récupère les annonces groupées par famille de catégorie
 */
export async function getAnnoncesByFamille(): Promise<Annonce_Fcategorie[]> {
  const response = await api.get(`${BASE_URL}/annonce/famille`);
  return response.data;
}

/**
 * Récupère les annonces les plus proches d'une position utilisateur
 */
export async function getAnnoncesNearUser(
  userLocation: [number, number] // [longitude, latitude]
): Promise<Annonce[]> {
  // Spring @RequestParam avec List<Double> attend les paramètres répétés
  // Format: ?userlocation=lon&userlocation=lat
  const url = `${BASE_URL}/annonces/near?userlocation=${userLocation[0]}&userlocation=${userLocation[1]}`;
  const response = await api.get(url);
  return response.data;
}

