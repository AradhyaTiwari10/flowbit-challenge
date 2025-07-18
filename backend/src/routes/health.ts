import { Router } from 'express';
import { databaseService } from '@/config/database';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }
  });
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with database status
 * @access  Public
 */
router.get('/detailed', async (req, res) => {
  try {
    const dbHealth = await databaseService.getHealthStatus();
    
    res.status(200).json({
      success: true,
      data: {
        status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: dbHealth,
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   GET /api/health/ready
 * @desc    Readiness probe for Kubernetes
 * @access  Public
 */
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await databaseService.getHealthStatus();
    
    if (dbHealth.status === 'healthy') {
      res.status(200).json({
        success: true,
        status: 'ready'
      });
    } else {
      res.status(503).json({
        success: false,
        status: 'not ready',
        reason: 'Database not healthy'
      });
    }
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'not ready',
      reason: 'Health check failed'
    });
  }
});

/**
 * @route   GET /api/health/live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'alive'
  });
});

export default router; 