import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  User, 
  Ticket, 
  TenantConfig, 
  CreateTicketRequest, 
  UpdateTicketRequest,
  ApiResponse,
  PaginatedResponse
} from '@/types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.api = axios.create({
      baseURL: `${this.baseURL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('accessToken', response.data.accessToken);
              
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(data: LoginRequest): Promise<AxiosResponse<ApiResponse<LoginResponse>>> {
    return this.api.post('/auth/login', data);
  }

  async refreshToken(refreshToken: string): Promise<AxiosResponse<ApiResponse<{ accessToken: string; expiresIn: number }>>> {
    return this.api.post('/auth/refresh', { refreshToken });
  }

  async logout(): Promise<AxiosResponse<ApiResponse>> {
    return this.api.post('/auth/logout');
  }

  // User endpoints
  async getProfile(): Promise<AxiosResponse<ApiResponse<User>>> {
    return this.api.get('/me/profile');
  }

  async updateProfile(data: Partial<User['profile']>): Promise<AxiosResponse<ApiResponse<User>>> {
    return this.api.put('/me/profile', data);
  }

  async getScreens(): Promise<AxiosResponse<ApiResponse<{ tenant: TenantConfig; screens: any[] }>>> {
    return this.api.get('/me/screens');
  }

  // Ticket endpoints
  async getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
  }): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Ticket>>>> {
    return this.api.get('/tickets', { params });
  }

  async getTicket(id: string): Promise<AxiosResponse<ApiResponse<Ticket>>> {
    return this.api.get(`/tickets/${id}`);
  }

  async createTicket(data: CreateTicketRequest): Promise<AxiosResponse<ApiResponse<Ticket>>> {
    return this.api.post('/tickets', data);
  }

  async updateTicket(id: string, data: UpdateTicketRequest): Promise<AxiosResponse<ApiResponse<Ticket>>> {
    return this.api.put(`/tickets/${id}`, data);
  }

  async deleteTicket(id: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.delete(`/tickets/${id}`);
  }

  // Admin endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  }): Promise<AxiosResponse<ApiResponse<PaginatedResponse<User>>>> {
    return this.api.get('/admin/users', { params });
  }

  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AxiosResponse<ApiResponse<PaginatedResponse<any>>>> {
    return this.api.get('/admin/audit-logs', { params });
  }

  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.api.get('/admin/analytics', { params });
  }

  async deactivateUser(id: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.post(`/admin/users/${id}/deactivate`);
  }

  async activateUser(id: string): Promise<AxiosResponse<ApiResponse>> {
    return this.api.post(`/admin/users/${id}/activate`);
  }

  // Health check
  async getHealth(): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.api.get('/health');
  }

  // Utility methods
  setAuthToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  setRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }

  clearAuthTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

export const apiService = new ApiService();
export default apiService; 