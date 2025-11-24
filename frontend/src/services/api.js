// src/services/api.js - Service API pour SokrStat FM2023
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================
// PLAYERS
// ==================

export const getPlayers = async (params = {}) => {
  try {
    const response = await api.get('/players', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

export const getPlayer = async (id) => {
  try {
    const response = await api.get(`/players/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
};

export const searchPlayers = async (query, limit = 20) => {
  try {
    const response = await api.get('/search', {
      params: { q: query, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching players:', error);
    throw error;
  }
};

// ==================
// COMPARISON
// ==================

export const comparePlayers = async (playerIds) => {
  try {
    const response = await api.post('/compare', {
      players: playerIds
    });
    return response.data;
  } catch (error) {
    console.error('Error comparing players:', error);
    throw error;
  }
};

// ==================
// STATISTICS
// ==================

export const getStatsOverview = async () => {
  try {
    const response = await api.get('/stats/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats overview:', error);
    throw error;
  }
};

export const getTopPlayers = async (attribute = 'finishing', position = null, limit = 10) => {
  try {
    const params = { attribute, limit };
    if (position) params.position = position;
    
    const response = await api.get('/stats/top-players', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching top players:', error);
    throw error;
  }
};

export const getNationalities = async (limit = 20) => {
  try {
    const response = await api.get('/stats/nationalities', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nationalities:', error);
    throw error;
  }
};

export const getClubs = async (limit = 20) => {
  try {
    const response = await api.get('/stats/clubs', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching clubs:', error);
    throw error;
  }
};

export const getPositions = async () => {
  try {
    const response = await api.get('/stats/positions');
    return response.data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
};

// ==================
// FILTERS
// ==================

export const listNationalities = async () => {
  try {
    const response = await api.get('/filters/nationalities');
    return response.data;
  } catch (error) {
    console.error('Error fetching nationality list:', error);
    throw error;
  }
};

export const listClubs = async () => {
  try {
    const response = await api.get('/filters/clubs');
    return response.data;
  } catch (error) {
    console.error('Error fetching club list:', error);
    throw error;
  }
};

export const listPositions = async () => {
  try {
    const response = await api.get('/filters/positions');
    return response.data;
  } catch (error) {
    console.error('Error fetching position list:', error);
    throw error;
  }
};

// ==================
// EXPORT
// ==================

export const exportPlayers = async (options = {}) => {
  try {
    const response = await api.post('/export/csv', options, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const extension = options.format === 'excel' ? 'xlsx' : 'csv';
    link.setAttribute('download', `sokrstat_export.${extension}`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export default {
  getPlayers,
  getPlayer,
  searchPlayers,
  comparePlayers,
  getStatsOverview,
  getTopPlayers,
  getNationalities,
  getClubs,
  getPositions,
  listNationalities,
  listClubs,
  listPositions,
  exportPlayers,
};