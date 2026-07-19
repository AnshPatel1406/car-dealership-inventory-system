// src/services/api.ts
// Centralized Axios instance that communicates with the backend API.
// Automatically attaches the JWT token from localStorage to every request.

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to every outgoing request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (payload: { name: string; email: string; password: string }) =>
    api.post('/auth/register', payload),

  login: (payload: { email: string; password: string }) =>
    api.post('/auth/login', payload),

  googleAuth: (credential: string) =>
    api.post('/auth/google', { credential }),
};

// ─── Vehicles ──────────────────────────────────────────────────────────────

export interface VehiclePayload {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export const vehiclesAPI = {
  getAll: () =>
    api.get('/vehicles'),

  search: (params: Record<string, string>) =>
    api.get('/vehicles/search', { params }),

  create: (payload: VehiclePayload) =>
    api.post('/vehicles', payload),

  update: (id: string, payload: Partial<VehiclePayload>) =>
    api.put(`/vehicles/${id}`, payload),

  remove: (id: string) =>
    api.delete(`/vehicles/${id}`),

  removeAll: () =>
    api.delete('/vehicles'),

  purchase: (id: string) =>
    api.post(`/vehicles/${id}/purchase`),

  restock: (id: string, quantity: number) =>
    api.post(`/vehicles/${id}/restock`, { quantity }),

  exportCSV: () =>
    api.get('/vehicles/export', { responseType: 'blob' }),

  importCSV: (csvText: string) =>
    api.post('/vehicles/import', csvText, { headers: { 'Content-Type': 'text/csv' } }),
};

export default api;
