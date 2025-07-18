export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'super_admin';
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  createdBy: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  tenantId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  ticketsByStatus: { status: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
  ticketsByCategory: { category: string; count: number }[];
  recentActivity: AuditLog[];
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  password: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
} 