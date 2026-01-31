import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import api from '../utils/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: async (token) => {
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
    } else {
      await AsyncStorage.removeItem('auth_token');
    }
    set({ token });
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { user, token } = response.data;
      
      await get().setToken(token);
      set({ user, isAuthenticated: true });
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  register: async (email, password, name) => {
    try {
      const response = await api.post('/api/auth/register', { email, password, name });
      const { user, token } = response.data;
      
      await get().setToken(token);
      set({ user, isAuthenticated: true });
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isAuthenticated: true });
        // Refresh user data from server
        await get().refreshUser();
      }
    } catch (error) {
      console.error('Load user error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      const user = response.data;
      set({ user, isAuthenticated: true });
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, logout
      await get().logout();
    }
  },
}));
