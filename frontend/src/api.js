import axios from 'axios';

// Configuration de l'URL de base
// Utilise la variable d'environnement VITE_API_URL si elle existe, sinon localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

// --- Fonctions d'aide exportées pour les composants ---

export const getStatsOverview = async () => {
  const response = await api.get('/stats/overview');
  return response.data;
};

export const getTopPlayers = async (attribute = "finishing", position = null, limit = 10) => {
  const response = await api.get('/stats/top-players', { 
    params: { attribute, position, limit } 
  });
  return response.data;
};

export const getNationalities = async (limit = 10) => {
  const response = await api.get('/stats/nationalities', { 
    params: { limit } 
  });
  return response.data;
};

export const getPositions = async () => {
  const response = await api.get('/stats/positions');
  return response.data;
};