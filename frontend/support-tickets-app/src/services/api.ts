import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Ticket, CreateTicketData, UpdateTicketData, TicketFilters, Comment } from '../types';

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

  // Ticket endpoints
  async getTickets(filters: TicketFilters = {}): Promise<{ tickets: Ticket[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<{ tickets: Ticket[]; total: number; page: number; totalPages: number }> = 
      await this.api.get(`/tickets?${params.toString()}`);
    return response.data;
  }

  async getTicket(id: string): Promise<Ticket> {
    const response: AxiosResponse<Ticket> = await this.api.get(`/tickets/${id}`);
    return response.data;
  }

  async createTicket(data: CreateTicketData): Promise<Ticket> {
    const response: AxiosResponse<Ticket> = await this.api.post('/tickets', data);
    return response.data;
  }

  async updateTicket(id: string, data: UpdateTicketData): Promise<Ticket> {
    const response: AxiosResponse<Ticket> = await this.api.put(`/tickets/${id}`, data);
    return response.data;
  }

  async deleteTicket(id: string): Promise<void> {
    await this.api.delete(`/tickets/${id}`);
  }

  // Comment endpoints
  async addComment(ticketId: string, content: string): Promise<Comment> {
    const response: AxiosResponse<Comment> = await this.api.post(`/tickets/${ticketId}/comments`, { content });
    return response.data;
  }

  async updateComment(ticketId: string, commentId: string, content: string): Promise<Comment> {
    const response: AxiosResponse<Comment> = await this.api.put(`/tickets/${ticketId}/comments/${commentId}`, { content });
    return response.data;
  }

  async deleteComment(ticketId: string, commentId: string): Promise<void> {
    await this.api.delete(`/tickets/${ticketId}/comments/${commentId}`);
  }

  // User endpoints
  async getCurrentUser(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/users/me');
    return response.data;
  }

  async getUsers(): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/users');
    return response.data;
  }

  // File upload
  async uploadAttachment(ticketId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<any> = await this.api.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 