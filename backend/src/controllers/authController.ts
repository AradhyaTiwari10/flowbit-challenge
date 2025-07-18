import { Request, Response } from 'express';
import { User } from '@/models/User';
import { JwtService } from '@/utils/jwt';
import { AuditLog } from '@/models/AuditLog';
import { LoginRequest, LoginResponse, ApiResponse } from '@/types';
import { body, validationResult } from 'express-validator';

export class AuthController {
  /**
   * User login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      const { email, password, customerId }: LoginRequest = req.body;

      const user = await User.findByEmailAndTenant(email, customerId);
      
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      user.lastLogin = new Date();
      await user.save();

      const tokenPayload = {
        customerId: user.customerId,
        role: user.role,
        userId: user._id.toString(),
        email: user.email
      };

      const { accessToken, refreshToken, expiresIn } = JwtService.generateTokenPair(tokenPayload);

      await AuditLog.logEvent({
        customerId: user.customerId,
        userId: user._id.toString(),
        action: 'LOGIN',
        resourceType: 'User',
        resourceId: user._id.toString(),
        details: { email: user.email, role: user.role },
        ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown'
      });

      const response: LoginResponse = {
        accessToken,
        refreshToken,
        user: {
          _id: user._id.toString(),
          customerId: user.customerId,
          email: user.email,
          role: user.role,
          profile: user.profile,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };

      res.status(200).json({
        success: true,
        data: response,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
        return;
      }

      const payload = JwtService.verifyRefreshToken(refreshToken);
      
      if (!JwtService.validatePayload(payload)) {
        res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
        return;
      }

      const user = await User.findById(payload.userId).select('+isActive +deletedAt');
      
      if (!user || !user.isActive || user.deletedAt) {
        res.status(401).json({
          success: false,
          error: 'User account is inactive or deleted'
        });
        return;
      }

      const tokenPayload = {
        customerId: user.customerId,
        role: user.role,
        userId: user._id.toString(),
        email: user.email
      };

      const { accessToken, expiresIn } = JwtService.generateTokenPair(tokenPayload);

      res.status(200).json({
        success: true,
        data: { accessToken, expiresIn },
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  }

  /**
   * User logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader) {
        const token = JwtService.extractTokenFromHeader(authHeader);
        
        if (token) {
          const payload = JwtService.decodeToken(token);
          
          if (payload) {
            await AuditLog.logEvent({
              customerId: payload.customerId,
              userId: payload.userId,
              action: 'LOGOUT',
              resourceType: 'User',
              resourceId: payload.userId,
              details: { email: payload.email, role: payload.role },
              ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
              userAgent: req.get('User-Agent') || 'Unknown'
            });
          }
        }
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

// Validation rules
export const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('customerId').notEmpty().withMessage('Customer ID is required')
];

export const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
]; 