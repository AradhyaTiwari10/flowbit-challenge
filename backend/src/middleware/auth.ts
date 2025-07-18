import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@/utils/jwt';
import { JwtPayload, UserRole, RequestWithUser } from '@/types';
import { AuditLog } from '@/models/AuditLog';
import { User } from '@/models/User';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Authorization header missing'
      });
      return;
    }

    const token = JwtService.extractTokenFromHeader(authHeader);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization header format'
      });
      return;
    }

    // Verify token
    const payload = JwtService.verifyAccessToken(token);
    
    if (!JwtService.validatePayload(payload)) {
      res.status(401).json({
        success: false,
        error: 'Invalid token payload'
      });
      return;
    }

    // Check if user still exists and is active
    const user = await User.findById(payload.userId).select('+isActive +deletedAt');
    
    if (!user || !user.isActive || user.deletedAt) {
      res.status(401).json({
        success: false,
        error: 'User account is inactive or deleted'
      });
      return;
    }

    // Attach user and customerId to request
    req.user = payload;
    req.customerId = payload.customerId;

    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role(s)
 */
export const authorize = (requiredRoles: UserRole | UserRole[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (!JwtService.hasRole(req.user.role, requiredRoles)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Admin authorization middleware
 * Checks if user is admin or super admin
 */
export const requireAdmin = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  if (!JwtService.isAdmin(req.user.role)) {
    res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
    return;
  }

  next();
};

/**
 * Super admin authorization middleware
 * Checks if user is super admin
 */
export const requireSuperAdmin = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  if (!JwtService.isSuperAdmin(req.user.role)) {
    res.status(403).json({
      success: false,
      error: 'Super admin access required'
    });
    return;
  }

  next();
};

/**
 * Tenant isolation middleware
 * Ensures users can only access their own tenant's data
 */
export const tenantIsolation = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  if (!req.user || !req.customerId) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  // For super admins, allow cross-tenant access if explicitly requested
  if (JwtService.isSuperAdmin(req.user.role) && req.headers['x-tenant-id']) {
    req.customerId = req.headers['x-tenant-id'] as string;
    return next();
  }

  // Ensure user can only access their own tenant
  if (req.user.customerId !== req.customerId) {
    res.status(403).json({
      success: false,
      error: 'Cross-tenant access not allowed'
    });
    return;
  }

  next();
};

/**
 * Audit logging middleware
 * Logs user actions for audit trail
 */
export const auditLog = (action: string, resourceType: string) => {
  return async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      // Log the action after response is sent
      if (req.user && res.statusCode < 400) {
        const resourceId = req.params.id || req.body.id;
        
        AuditLog.logEvent({
          customerId: req.user.customerId,
          userId: req.user.userId,
          action: action as any,
          resourceType,
          resourceId,
          details: {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            userAgent: req.get('User-Agent') || 'Unknown',
            ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
          },
          ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown'
        }).catch(error => {
          console.error('Audit logging failed:', error);
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // This would typically integrate with Redis for distributed rate limiting
  // For now, we'll implement a basic in-memory rate limiter
  
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  
  // In a real implementation, this would be stored in Redis
  // For demo purposes, we'll use a simple check
  next();
};

/**
 * Optional authentication middleware
 * Similar to authenticate but doesn't fail if no token is provided
 */
export const optionalAuth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = JwtService.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return next();
    }

    const payload = JwtService.verifyAccessToken(token);
    
    if (JwtService.validatePayload(payload)) {
      const user = await User.findById(payload.userId).select('+isActive +deletedAt');
      
      if (user && user.isActive && !user.deletedAt) {
        req.user = payload;
        req.customerId = payload.customerId;
      }
    }
  } catch (error) {
    // Silently ignore authentication errors for optional auth
  }
  
  next();
}; 