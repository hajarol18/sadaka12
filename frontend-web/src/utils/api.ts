import axios from 'axios';
import { handleMock } from './mock';

// baseURL vide car le proxy dans vite.config.ts gère déjà /api
// Les services utilisent déjà /api/v1, donc on ne veut pas de double /api
const baseURL = '';
const TOKEN_KEY = 'sadaka_web_token';

export const api = axios.create({
  baseURL,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Désactiver les mocks pour les endpoints /api/v1 (backend réel)
    const url = response.config?.url || '';
    if (url.includes('/api/v1')) {
      // Ne pas utiliser les mocks pour les vraies API
      return response;
    }
    return response;
  },
  async (error) => {
    const url = error.config?.url || '';
    
    // Pour les endpoints /api/v1, ne PAS utiliser les mocks
    if (url.includes('/api/v1')) {
      const message = error?.response?.data?.message || error?.message || 'Erreur réseau';
      return Promise.reject(new Error(message));
    }
    
    // Utiliser les mocks par défaut pour la démonstration (si backend non disponible)
    // Les mocks sont activés par défaut (VITE_USE_MOCKS='1') pour permettre une démo sans backend
    const useMocks = String(import.meta.env.VITE_USE_MOCKS || '1') === '1';
    const isNetwork = !error.response; // Erreur réseau = backend non disponible
    
    // Si mocks activés OU backend non disponible → utiliser les mocks
    if (useMocks || isNetwork) {
      try {
        const mock = await handleMock(error.config || {});
        return Promise.resolve({
          ...mock,
          config: error.config,
          headers: {},
          statusText: 'OK'
        } as any);
      } catch (e) {
        // fallthrough to original error
      }
    }
    const message = error?.response?.data?.message || error?.message || 'Erreur réseau';
    return Promise.reject(new Error(message));
  }
);
