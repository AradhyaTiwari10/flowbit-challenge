import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginRequest } from '@/types';
import apiService from '@/services/api';

interface AuthStore extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiService.login(data);
          
          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken, user } = response.data.data;
            
            // Store tokens
            apiService.setAuthToken(accessToken);
            apiService.setRefreshToken(refreshToken);
            
            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error(response.data.error || 'Login failed');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
        }
      },

      refreshUser: async () => {
        try {
          set({ isLoading: true });
          
          const response = await apiService.getProfile();
          
          if (response.data.success && response.data.data) {
            set({
              user: response.data.data,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Failed to refresh user data');
          }
        } catch (error) {
          console.error('Refresh user error:', error);
          set({ isLoading: false });
          
          // If refresh fails, clear auth and redirect to login
          if (error instanceof Error && error.message.includes('401')) {
            get().clearAuth();
          }
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        apiService.setAuthToken(accessToken);
        apiService.setRefreshToken(refreshToken);
        
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        apiService.clearAuthTokens();
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 