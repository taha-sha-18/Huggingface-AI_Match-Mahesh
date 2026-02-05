import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Get the backend URL for API requests
 * Priority order:
 * 1. Constants.expoConfig.extra.backendUrl (from app.config.js - works in production builds)
 * 2. process.env.EXPO_PUBLIC_BACKEND_URL (works in Expo Go dev mode)
 * 3. Hardcoded production fallback (last resort for built APKs)
 */
const getBackendUrl = (): string => {
  // Try expo config first (this is bundled into production builds)
  const configUrl = Constants.expoConfig?.extra?.backendUrl;
  if (configUrl) {
    console.log('[API] Using backend URL from app.config.js:', configUrl);
    return configUrl;
  }
  
  // Try environment variable (works in Expo Go)
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (envUrl) {
    console.log('[API] Using backend URL from env:', envUrl);
    return envUrl;
  }
  
  // Production fallback - IMPORTANT: Update this for your deployment
  const fallbackUrl = 'https://embed-match.preview.emergentagent.com';
  console.log('[API] Using fallback backend URL:', fallbackUrl);
  return fallbackUrl;
};

const BACKEND_URL = getBackendUrl();

// Log configuration for debugging
console.log('[API] Configuration:', {
  backendUrl: BACKEND_URL,
  platform: Platform.OS,
  isExpoGo: Constants.appOwnership === 'expo',
  expoConfig: Constants.expoConfig?.extra ? 'present' : 'missing',
});

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

export default api;
