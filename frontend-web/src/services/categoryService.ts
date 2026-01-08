import { api } from '../utils/api';
import type { Category } from '../types/api';

const BASE_URL = '/api/v1';

/**
 * Récupère toutes les catégories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    console.log('[getCategories] Appel API:', `${BASE_URL}/categories`);
    const response = await api.get(`${BASE_URL}/categories`);
    console.log('[getCategories] Réponse brute:', response);
    console.log('[getCategories] response.data:', response.data);
    console.log('[getCategories] Type de response.data:', typeof response.data);
    console.log('[getCategories] Est un tableau?', Array.isArray(response.data));
    
    let data = response.data;
    
    // Si la réponse est un objet avec 'value', extraire le tableau
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      if ('value' in data) {
        data = data.value;
        console.log('[getCategories] Données extraites de value:', data);
      } else if ('data' in data) {
        data = data.data;
        console.log('[getCategories] Données extraites de data:', data);
      }
    }
    
    // Convertir en tableau si nécessaire
    let categories: Category[] = [];
    if (Array.isArray(data)) {
      categories = data;
    } else if (data && typeof data === 'object') {
      // Si c'est un objet Iterable ou similaire, essayer de le convertir
      try {
        categories = Array.from(data as any);
      } catch (e) {
        console.warn('[getCategories] Impossible de convertir en tableau:', e);
        categories = [];
      }
    } else {
      categories = [];
    }
    
    // Mapper les champs si nécessaire (name -> nom)
    const mappedCategories = categories.map((cat: any) => {
      const nom = cat.nom || cat.name || (cat.getName && cat.getName()) || '';
      console.log('[getCategories] Mapping cat:', { id: cat.id, nom, name: cat.name, famille: cat.famille });
      return {
        id: cat.id,
        nom: nom,
        famille: cat.famille
      };
    });
    
    console.log('[getCategories] Catégories finales:', mappedCategories.length, mappedCategories);
    return mappedCategories;
  } catch (error: any) {
    console.error('[getCategories] Erreur complète:', error);
    console.error('[getCategories] Erreur détaillée:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      url: error?.config?.url
    });
    return [];
  }
}

/**
 * Récupère les catégories d'une famille
 */
export async function getCategoriesByFamille(familleId: number): Promise<any[]> {
  const response = await api.get(`${BASE_URL}/categories/${familleId}`);
  return response.data;
}

/**
 * Crée une nouvelle catégorie
 */
export async function createCategory(category: Omit<Category, 'id'>): Promise<Category> {
  const response = await api.post(`${BASE_URL}/categorie`, category);
  return response.data;
}

/**
 * Supprime une catégorie
 */
export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`${BASE_URL}/categorie/${id}`);
}


