export interface User {
  _id: string;
  customerId: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
}

export type UserRole = 'Admin' | 'User' | 'SuperAdmin';

export interface Ticket {
  _id: string;
  customerId: string;
  userId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  workflowId?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
  timeSinceCreation?: number;
}

export type TicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TenantConfig {
  name: string;
  theme: string;
  screens: Screen[];
}

export interface Screen {
  id: string;
  name: string;
  url: string;
  icon: string;
  permissions: UserRole[];
}

export interface LoginRequest {
  email: string;
  password: string;
  customerId: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  assignedTo?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  tenant: TenantConfig | null;
  theme: string;
  sidebarOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface MicroFrontendModule {
  default: React.ComponentType<any>;
}

export interface MicroFrontendProps {
  user: User;
  tenant: TenantConfig;
  onNavigate: (path: string) => void;
} 