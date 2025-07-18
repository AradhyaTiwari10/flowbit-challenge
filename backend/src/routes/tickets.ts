import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Ticket } from '@/models/Ticket';
import { RequestWithUser } from '@/types';
import { auditLog } from '@/middleware/auth';

const router = Router();

/**
 * @route   GET /api/tickets
 * @desc    Get tickets for current tenant
 * @access  Private
 */
router.get('/', async (req: RequestWithUser, res) => {
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
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const category = req.query.category as string;
    const assignedTo = req.query.assignedTo as string;

    const tickets = await Ticket.findByTenant(customerId, {
      status: status as any,
      priority: priority as any,
      category,
      assignedTo,
      page,
      limit,
      sort: '-createdAt'
    });

    const total = await Ticket.countByTenant(customerId, {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(assignedTo && { assignedTo })
    });

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/tickets
 * @desc    Create a new ticket
 * @access  Private
 */
router.post('/', [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('description')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters')
    .trim(),
  body('priority')
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be Low, Medium, High, or Critical'),
  body('category')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters')
    .trim()
], auditLog('TICKET_CREATE', 'Ticket'), async (req: RequestWithUser, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const customerId = req.customerId;
    const userId = req.user?.userId;
    
    if (!customerId || !userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { title, description, priority, category } = req.body;

    const ticket = new Ticket({
      customerId,
      userId,
      title,
      description,
      priority,
      category,
      status: 'Open'
    });

    await ticket.save();

    // Trigger n8n workflow
    try {
      await triggerN8nWorkflow({
        customerId,
        ticketId: ticket._id.toString(),
        priority,
        category,
        userId
      });
    } catch (workflowError) {
      console.error('Failed to trigger n8n workflow:', workflowError);
      // Don't fail the request if workflow fails
    }

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Ticket created successfully'
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/tickets/:id
 * @desc    Get a specific ticket
 * @access  Private
 */
router.get('/:id', async (req: RequestWithUser, res) => {
  try {
    const customerId = req.customerId;
    const ticketId = req.params.id;
    
    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const ticket = await Ticket.findOne({
      _id: ticketId,
      customerId
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/tickets/:id
 * @desc    Update a ticket
 * @access  Private
 */
router.put('/:id', [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['Open', 'InProgress', 'Resolved', 'Closed'])
    .withMessage('Status must be Open, InProgress, Resolved, or Closed'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be Low, Medium, High, or Critical'),
  body('category')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters')
    .trim(),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('AssignedTo must be a valid user ID')
], auditLog('TICKET_UPDATE', 'Ticket'), async (req: RequestWithUser, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const customerId = req.customerId;
    const ticketId = req.params.id;
    
    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const ticket = await Ticket.findOne({
      _id: ticketId,
      customerId
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Update fields
    const { title, description, status, priority, category, assignedTo } = req.body;
    
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (category) ticket.category = category;
    if (assignedTo) ticket.assignedTo = assignedTo;

    await ticket.save();

    res.status(200).json({
      success: true,
      data: ticket,
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/tickets/:id
 * @desc    Soft delete a ticket
 * @access  Private
 */
router.delete('/:id', auditLog('TICKET_DELETE', 'Ticket'), async (req: RequestWithUser, res) => {
  try {
    const customerId = req.customerId;
    const ticketId = req.params.id;
    
    if (!customerId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const ticket = await Ticket.findOne({
      _id: ticketId,
      customerId
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Soft delete
    ticket.deletedAt = new Date();
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Helper function to trigger n8n workflow
async function triggerN8nWorkflow(data: {
  customerId: string;
  ticketId: string;
  priority: string;
  category: string;
  userId: string;
}) {
  try {
    const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET || 'your-webhook-secret';
    
    const response = await fetch(`${n8nUrl}/webhook/ticket-created`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    console.log('n8n workflow triggered successfully');
  } catch (error) {
    console.error('Failed to trigger n8n workflow:', error);
    throw error;
  }
}

export default router; 