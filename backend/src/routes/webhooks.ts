import { Router } from 'express';
import crypto from 'crypto';
import { Ticket } from '@/models/Ticket';
import { AuditLog } from '@/models/AuditLog';
import { auditLog } from '@/middleware/auth';

const router = Router();

/**
 * @route   POST /api/webhook/ticket-done
 * @desc    Webhook endpoint for n8n workflow completion
 * @access  Public (with signature verification)
 */
router.post('/ticket-done', auditLog('WEBHOOK_RECEIVED', 'Webhook'), async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-webhook-secret'] as string;
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET || 'your-webhook-secret';
    
    if (!signature || signature !== webhookSecret) {
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const { ticketId, status, assignedTo, workflowId, metadata } = req.body;

    if (!ticketId || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ticketId, status'
      });
    }

    // Find and update the ticket
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Update ticket status
    ticket.status = status;
    if (assignedTo) {
      ticket.assignedTo = assignedTo;
    }
    if (workflowId) {
      ticket.workflowId = workflowId;
    }

    await ticket.save();

    // Log the webhook event
    await AuditLog.logEvent({
      customerId: ticket.customerId,
      userId: 'system', // System action
      action: 'WORKFLOW_TRIGGER',
      resourceType: 'Ticket',
      resourceId: ticketId,
      details: {
        status,
        assignedTo,
        workflowId,
        metadata
      },
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      userAgent: req.get('User-Agent') || 'n8n-webhook'
    });

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: {
        ticketId,
        status,
        updatedAt: ticket.updatedAt
      }
    });
  } catch (error) {
    console.error('Webhook ticket-done error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/webhook/n8n-status
 * @desc    Webhook endpoint for n8n workflow status updates
 * @access  Public (with signature verification)
 */
router.post('/n8n-status', async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-webhook-secret'] as string;
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET || 'your-webhook-secret';
    
    if (!signature || signature !== webhookSecret) {
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const { workflowId, status, executionId, error } = req.body;

    if (!workflowId || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: workflowId, status'
      });
    }

    // Log the workflow status update
    await AuditLog.logEvent({
      customerId: 'system', // System-wide event
      userId: 'system',
      action: 'WORKFLOW_TRIGGER',
      resourceType: 'Workflow',
      resourceId: workflowId,
      details: {
        status,
        executionId,
        error,
        timestamp: new Date().toISOString()
      },
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      userAgent: req.get('User-Agent') || 'n8n-webhook'
    });

    res.status(200).json({
      success: true,
      message: 'Workflow status logged successfully'
    });
  } catch (error) {
    console.error('Webhook n8n-status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/webhook/test
 * @desc    Test webhook endpoint for development
 * @access  Public
 */
router.post('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Webhook test successful',
    data: {
      timestamp: new Date().toISOString(),
      headers: req.headers,
      body: req.body
    }
  });
});

export default router; 