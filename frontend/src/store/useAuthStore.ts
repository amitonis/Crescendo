import { create } from 'zustand';
import api from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    role: 'artist' | 'fan';
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface AuthResponse {
  success: boolean;
  user: User;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    const user = response.data.user;

    set({
      user,
      isAuthenticated: true,
    });
  },

  register: async (data) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    const user = response.data.user;

    set({
      user,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await api.post('/auth/logout');

    set({
      user: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    try {
      const response = await api.get<AuthResponse>('/auth/me');
      const user = response.data.user;

      set({
        user,
        isAuthenticated: true,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
