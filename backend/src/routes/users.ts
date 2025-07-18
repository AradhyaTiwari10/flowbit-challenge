import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '@/models/User';
import { RequestWithUser } from '@/types';

const router = Router();

/**
 * @route   GET /api/me/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
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
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/me/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .trim(),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .trim(),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
], async (req: RequestWithUser, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { firstName, lastName, avatar } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update profile fields
    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (avatar !== undefined) user.profile.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id.toString(),
        customerId: user.customerId,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/me/screens
 * @desc    Get available screens for current user's tenant and role
 * @access  Private
 */
router.get('/screens', async (req: RequestWithUser, res) => {
  try {
    const customerId = req.user?.customerId;
    const userRole = req.user?.role;
    
    if (!customerId || !userRole) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get tenant configuration
    const tenantConfig = getTenantConfig(customerId);
    
    if (!tenantConfig) {
      return res.status(404).json({
        success: false,
        error: 'Tenant configuration not found'
      });
    }

    // Filter screens based on user role
    const availableScreens = tenantConfig.screens.filter(screen => 
      screen.permissions.includes(userRole)
    );

    res.status(200).json({
      success: true,
      data: {
        tenant: {
          name: tenantConfig.name,
          theme: tenantConfig.theme
        },
        screens: availableScreens
      }
    });
  } catch (error) {
    console.error('Get screens error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/me/audit-logs
 * @desc    Get audit logs for current user
 * @access  Private
 */
router.get('/audit-logs', async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.userId;
    const customerId = req.user?.customerId;
    
    if (!userId || !customerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const action = req.query.action as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const auditLogs = await (await import('@/models/AuditLog')).AuditLog.findByTenant(customerId, {
      userId,
      action: action as any,
      startDate,
      endDate,
      page,
      limit,
      sort: '-timestamp'
    });

    const total = await (await import('@/models/AuditLog')).AuditLog.countByTenant(customerId, {
      userId,
      action: action as any,
      ...(startDate && endDate && {
        timestamp: { $gte: startDate, $lte: endDate }
      })
    });

    res.status(200).json({
      success: true,
      data: auditLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Helper function to get tenant configuration
function getTenantConfig(customerId: string) {
  const tenantConfigs = {
    'LogisticsCo': {
      name: 'Logistics Corporation',
      theme: 'blue',
      screens: [
        {
          id: 'support-tickets',
          name: 'Support Tickets',
          url: '/support-tickets',
          icon: 'ticket',
          permissions: ['User', 'Admin']
        },
        {
          id: 'admin-dashboard',
          name: 'Admin Dashboard',
          url: '/admin',
          icon: 'dashboard',
          permissions: ['Admin']
        }
      ]
    },
    'RetailGmbH': {
      name: 'Retail GmbH',
      theme: 'green',
      screens: [
        {
          id: 'support-tickets',
          name: 'Customer Support',
          url: '/support-tickets',
          icon: 'support',
          permissions: ['User', 'Admin']
        }
      ]
    }
  };

  return tenantConfigs[customerId as keyof typeof tenantConfigs];
}

export default router; 