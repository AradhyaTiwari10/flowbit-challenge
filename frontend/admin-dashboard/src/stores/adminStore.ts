import { create } from 'zustand';
import { User, Ticket, AuditLog, DashboardStats, CreateUserData, UpdateUserData, UserFilters } from '../types';
import apiService from '../services/api';

interface AdminState {
  // Dashboard
  dashboardStats: DashboardStats | null;
  
  // Users
  users: User[];
  currentUser: User | null;
  
  // Tickets
  tickets: Ticket[];
  currentTicket: Ticket | null;
  
  // Audit Logs
  auditLogs: AuditLog[];
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Pagination
  total: number;
  page: number;
  totalPages: number;
  filters: UserFilters;
  
  // Actions
  fetchDashboardStats: () => Promise<void>;
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  createUser: (data: CreateUserData) => Promise<void>;
  updateUser: (id: string, data: UpdateUserData) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  fetchTickets: (filters?: any) => Promise<void>;
  updateTicket: (id: string, data: any) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  fetchAuditLogs: (filters?: any) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  setCurrentTicket: (ticket: Ticket | null) => void;
  setFilters: (filters: UserFilters) => void;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  dashboardStats: null,
  users: [],
  currentUser: null,
  tickets: [],
  currentTicket: null,
  auditLogs: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,
  filters: {},

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await apiService.getDashboardStats();
      set({ dashboardStats: stats, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch dashboard stats',
        loading: false,
      });
    }
  },

  fetchUsers: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const result = await apiService.getUsers(filters);
      set({
        users: result.users,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        filters,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch users',
        loading: false,
      });
    }
  },

  fetchUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const user = await apiService.getUser(id);
      set({ currentUser: user, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch user',
        loading: false,
      });
    }
  },

  createUser: async (data: CreateUserData) => {
    set({ loading: true, error: null });
    try {
      const newUser = await apiService.createUser(data);
      set((state) => ({
        users: [newUser, ...state.users],
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create user',
        loading: false,
      });
    }
  },

  updateUser: async (id: string, data: UpdateUserData) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await apiService.updateUser(id, data);
      set((state) => ({
        users: state.users.map((user) =>
          user._id === id ? updatedUser : user
        ),
        currentUser: state.currentUser?._id === id ? updatedUser : state.currentUser,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update user',
        loading: false,
      });
    }
  },

  deleteUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiService.deleteUser(id);
      set((state) => ({
        users: state.users.filter((user) => user._id !== id),
        currentUser: state.currentUser?._id === id ? null : state.currentUser,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete user',
        loading: false,
      });
    }
  },

  fetchTickets: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const result = await apiService.getTickets(filters);
      set({
        tickets: result.tickets,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch tickets',
        loading: false,
      });
    }
  },

  updateTicket: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      const updatedTicket = await apiService.updateTicket(id, data);
      set((state) => ({
        tickets: state.tickets.map((ticket) =>
          ticket._id === id ? updatedTicket : ticket
        ),
        currentTicket: state.currentTicket?._id === id ? updatedTicket : state.currentTicket,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update ticket',
        loading: false,
      });
    }
  },

  deleteTicket: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiService.deleteTicket(id);
      set((state) => ({
        tickets: state.tickets.filter((ticket) => ticket._id !== id),
        currentTicket: state.currentTicket?._id === id ? null : state.currentTicket,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete ticket',
        loading: false,
      });
    }
  },

  fetchAuditLogs: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const result = await apiService.getAuditLogs(filters);
      set({
        auditLogs: result.logs,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch audit logs',
        loading: false,
      });
    }
  },

  setCurrentUser: (user: User | null) => {
    set({ currentUser: user });
  },

  setCurrentTicket: (ticket: Ticket | null) => {
    set({ currentTicket: ticket });
  },

  setFilters: (filters: UserFilters) => {
    set({ filters });
  },

  clearError: () => {
    set({ error: null });
  },
})); 