import { Router } from 'express';
import { User } from '@/models/User';
import { AuditLog } from '@/models/AuditLog';
import { Ticket } from '@/models/Ticket';
import { RequestWithUser } from '@/types';
import { auditLog } from '@/middleware/auth';

const router = Router();

/**
 * @route   GET /api/admin/users
 * @desc    Get all users for current tenant
 * @access  Admin
 */
router.get('/users', async (req: RequestWithUser, res) => {
  try {
    const customerId = req.customerId;
    
    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

    const query: any = { customerId };
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive;

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs for current tenant
 * @access  Admin
 */
router.get('/audit-logs', async (req: RequestWithUser, res) => {
  try {
    const customerId = req.customerId;
    
    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const action = req.query.action as string;
    const userId = req.query.userId as string;
    const resourceType = req.query.resourceType as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const auditLogs = await AuditLog.findByTenant(customerId, {
      action: action as any,
      userId,
      resourceType,
      startDate,
      endDate,
      page,
      limit,
      sort: '-timestamp'
    });

    const total = await AuditLog.countByTenant(customerId, {
      action: action as any,
      userId,
      resourceType,
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

/**
 * @route   GET /api/admin/analytics
 * @desc    Get analytics data for current tenant
 * @access  Admin
 */
router.get('/analytics', async (req: RequestWithUser, res) => {
  try {
    const customerId = req.customerId;
    
    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    // Get ticket statistics
    const ticketStats = await Ticket.aggregate([
      {
        $match: {
          customerId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $match: { customerId }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);

    // Get audit summary
    const auditSummary = await AuditLog.getAuditSummary(customerId, startDate, endDate);

    // Calculate ticket trends
    const ticketTrends = await Ticket.aggregate([
      {
        $match: {
          customerId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        tickets: {
          byStatus: ticketStats,
          trends: ticketTrends,
          total: ticketStats.reduce((sum, stat) => sum + stat.count, 0)
        },
        users: {
          byRole: userStats,
          total: userStats.reduce((sum, stat) => sum + stat.count, 0),
          active: userStats.reduce((sum, stat) => sum + stat.active, 0)
        },
        audit: {
          summary: auditSummary,
          total: auditSummary.reduce((sum, stat) => sum + stat.count, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/admin/users/:id/deactivate
 * @desc    Deactivate a user
 * @access  Admin
 */
router.post('/users/:id/deactivate', auditLog('USER_UPDATE', 'User'), async (req: RequestWithUser, res) => {
  try {
    const customerId = req.customerId;
    const userId = req.params.id;
    
    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const user = await User.findOne({
      _id: userId,
      customerId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user?.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot deactivate your own account'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/admin/users/:id/activate
 * @desc    Activate a user
 * @access  Admin
 */
router.post('/users/:id/activate', auditLog('USER_UPDATE', 'User'), async (req: RequestWithUser, res) => {
  try {
    const customerId = req.customerId;
    const userId = req.params.id;
    
    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const user = await User.findOne({
      _id: userId,
      customerId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 