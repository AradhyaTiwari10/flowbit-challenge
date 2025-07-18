import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, Ticket, AuditLog, DashboardStats, CreateUserData, UpdateUserData, UserFilters } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
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
              const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
                { refreshToken }
              );

              const { accessToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    const response: AxiosResponse<DashboardStats> = await this.api.get('/admin/dashboard');
    return response.data;
  }

  // User management endpoints
  async getUsers(filters: UserFilters = {}): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<{ users: User[]; total: number; page: number; totalPages: number }> = 
      await this.api.get(`/admin/users?${params.toString()}`);
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/admin/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/admin/users', data);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/admin/users/${id}`);
  }

  // Ticket management endpoints
  async getTickets(filters: any = {}): Promise<{ tickets: Ticket[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<{ tickets: Ticket[]; total: number; page: number; totalPages: number }> = 
      await this.api.get(`/admin/tickets?${params.toString()}`);
    return response.data;
  }

  async updateTicket(id: string, data: any): Promise<Ticket> {
    const response: AxiosResponse<Ticket> = await this.api.put(`/admin/tickets/${id}`, data);
    return response.data;
  }

  async deleteTicket(id: string): Promise<void> {
    await this.api.delete(`/admin/tickets/${id}`);
  }

  // Audit log endpoints
  async getAuditLogs(filters: any = {}): Promise<{ logs: AuditLog[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<{ logs: AuditLog[]; total: number; page: number; totalPages: number }> = 
      await this.api.get(`/admin/audit-logs?${params.toString()}`);
    return response.data;
  }

  // System endpoints
  async getSystemHealth(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 