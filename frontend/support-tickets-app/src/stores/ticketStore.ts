import { create } from 'zustand';
import { Ticket, CreateTicketData, UpdateTicketData, TicketFilters } from '../types';
import apiService from '../services/api';

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  filters: TicketFilters;
  
  // Actions
  fetchTickets: (filters?: TicketFilters) => Promise<void>;
  fetchTicket: (id: string) => Promise<void>;
  createTicket: (data: CreateTicketData) => Promise<void>;
  updateTicket: (id: string, data: UpdateTicketData) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  setCurrentTicket: (ticket: Ticket | null) => void;
  setFilters: (filters: TicketFilters) => void;
  clearError: () => void;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,
  filters: {},

  fetchTickets: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const result = await apiService.getTickets(filters);
      set({
        tickets: result.tickets,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        filters,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch tickets',
        loading: false,
      });
    }
  },

  fetchTicket: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const ticket = await apiService.getTicket(id);
      set({ currentTicket: ticket, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch ticket',
        loading: false,
      });
    }
  },

  createTicket: async (data: CreateTicketData) => {
    set({ loading: true, error: null });
    try {
      const newTicket = await apiService.createTicket(data);
      set((state) => ({
        tickets: [newTicket, ...state.tickets],
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create ticket',
        loading: false,
      });
    }
  },

  updateTicket: async (id: string, data: UpdateTicketData) => {
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

  setCurrentTicket: (ticket: Ticket | null) => {
    set({ currentTicket: ticket });
  },

  setFilters: (filters: TicketFilters) => {
    set({ filters });
  },

  clearError: () => {
    set({ error: null });
  },
})); 