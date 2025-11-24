import axios from 'axios';
import { CryptoService } from '../utils/crypto/encryption';

const API_BASE_URL = 'https://sankrypt-backend.onrender.com/api';

// Axios instance without API key, we'll attach dynamically
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout
});

// Interceptor to attach API key and auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  const apiKey = localStorage.getItem('user_api_key');

  // Add Bearer token if exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add API key if exists
  if (apiKey) {
    config.headers['X-API-KEY'] = apiKey;
  }

  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhance error message for better debugging
    if (error.response) {
      // Server responded with error status
      error.message = error.response.data?.error || error.response.data?.message || error.message;
      error.status = error.response.status;
    } else if (error.request) {
      // Request made but no response received
      error.message = 'Network error: Unable to connect to server';
      error.status = 0;
    }
    return Promise.reject(error);
  }
);

export interface LoginData {
  email: string;
  auth_key_hash: string;
}

export interface RegisterData {
  email: string;
  auth_key_hash: string;
}

export interface VaultItem {
  id?: string;
  category: string;
  encrypted_data: string;
  data_hash: string;
  created_at?: string;
  last_accessed_at?: string;
}

class ApiService {
  // Public routes: no API key needed
  async register(data: RegisterData) {
    const response = await api.post('/register', data);

    // Store tokens and per-user API key
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      if (response.data.user.api_key) {
        localStorage.setItem('user_api_key', response.data.user.api_key);
      }
    }

    return response.data;
  }

  async login(data: LoginData) {
    const response = await api.post('/login', data);

    // Store tokens and per-user API key
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      if (response.data.user.api_key) {
        localStorage.setItem('user_api_key', response.data.user.api_key);
      }
    }

    return response.data;
  }

  // Protected routes: API key is automatically attached
  async logout() {
    const response = await api.post('/logout');

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_api_key');

    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/user');
    return response.data;
  }

  // Vault methods
  async getVaults() {
    const response = await api.get('/vault');
    return response.data;
  }

  async getVaultItem(id: string) {
    const response = await api.get(`/vault/${id}`);
    return response.data;
  }

  async createVaultItem(data: Omit<VaultItem, 'id'>) {
    const response = await api.post('/vault', data);
    return response.data;
  }

  async updateVaultItem(id: string, data: { encrypted_data: string; encryption_salt: string; data_hash: string }) {
    const response = await api.put(`/vault/${id}`, data);
    return response.data;
  }

  async deleteVaultItem(id: string) {
    const response = await api.delete(`/vault/${id}`);
    return response.data;
  }

  async getVaultByCategory(category: string) {
    const response = await api.get(`/vault/category/${category}`);
    return response.data;
  }

  async changePassword(data: { current_auth_hash: string; new_auth_hash: string }) {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  }

  async updateUserPreferences(data: any) {
    const response = await api.put('/user/preferences', data);
    return response.data;
  }

  async getSecuritySettings() {
    const response = await api.get('/user/security-settings');
    return response.data;
  }
}

export const apiService = new ApiService();