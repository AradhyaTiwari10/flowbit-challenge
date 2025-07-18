export interface User {
  _id: string;
  customerId: string;
  email: string;
  password: string;
  role: UserRole;
  profile: UserProfile;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
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
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type TicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AuditLog {
  _id: string;
  customerId: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'TICKET_CREATE' 
  | 'TICKET_UPDATE' 
  | 'TICKET_DELETE'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'ADMIN_ACCESS'
  | 'WORKFLOW_TRIGGER'
  | 'WEBHOOK_RECEIVED';

export interface JwtPayload {
  customerId: string;
  role: UserRole;
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

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
  user: Omit<User, 'password'>;
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

export interface WebhookPayload {
  ticketId: string;
  status: TicketStatus;
  assignedTo?: string;
  workflowId: string;
  metadata?: Record<string, any>;
}

export interface N8nWorkflowTrigger {
  customerId: string;
  ticketId: string;
  priority: TicketPriority;
  category: string;
  userId: string;
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
  customerId?: string;
}

export interface DatabaseConfig {
  uri: string;
  options: {
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
  };
}

export interface RedisConfig {
  url: string;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
}

export interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
} 