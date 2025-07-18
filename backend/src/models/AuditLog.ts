import mongoose, { Document, Schema } from 'mongoose';
import { AuditLog as AuditLogType, AuditAction } from '@/types';

export interface AuditLogDocument extends Document, Omit<AuditLogType, '_id'> {}

const auditLogSchema = new Schema<AuditLogDocument>({
  customerId: {
    type: String,
    required: [true, 'Customer ID is required'],
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  action: {
    type: String,
    enum: {
      values: [
        'LOGIN',
        'LOGOUT',
        'TICKET_CREATE',
        'TICKET_UPDATE',
        'TICKET_DELETE',
        'USER_CREATE',
        'USER_UPDATE',
        'ADMIN_ACCESS',
        'WORKFLOW_TRIGGER',
        'WEBHOOK_RECEIVED'
      ],
      message: 'Invalid audit action'
    },
    required: [true, 'Action is required'],
    index: true
  },
  resourceType: {
    type: String,
    required: [true, 'Resource type is required'],
    trim: true,
    maxlength: [50, 'Resource type cannot exceed 50 characters']
  },
  resourceId: {
    type: String,
    trim: true,
    maxlength: [100, 'Resource ID cannot exceed 100 characters']
  },
  details: {
    type: Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
    trim: true
  },
  userAgent: {
    type: String,
    required: [true, 'User agent is required'],
    trim: true,
    maxlength: [500, 'User agent cannot exceed 500 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false, // We use our own timestamp field
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for tenant isolation and common queries
auditLogSchema.index({ customerId: 1, action: 1 });
auditLogSchema.index({ customerId: 1, userId: 1 });
auditLogSchema.index({ customerId: 1, resourceType: 1 });
auditLogSchema.index({ customerId: 1, timestamp: -1 });
auditLogSchema.index({ customerId: 1, action: 1, timestamp: -1 });

// TTL index to automatically delete old audit logs (keep for 1 year)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// Populate middleware for user information
auditLogSchema.pre(/^find/, function(next) {
  if (this.getQuery().populate !== false) {
    this.populate('userId', 'profile.firstName profile.lastName email role');
  }
  next();
});

// Static method to find audit logs by tenant
auditLogSchema.statics.findByTenant = function(customerId: string, options: {
  action?: AuditAction;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sort?: string;
} = {}) {
  const query: any = { customerId };
  
  if (options.action) query.action = options.action;
  if (options.userId) query.userId = options.userId;
  if (options.resourceType) query.resourceType = options.resourceType;
  if (options.resourceId) query.resourceId = options.resourceId;
  
  if (options.startDate || options.endDate) {
    query.timestamp = {};
    if (options.startDate) query.timestamp.$gte = options.startDate;
    if (options.endDate) query.timestamp.$lte = options.endDate;
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;
  const sort = options.sort || '-timestamp';

  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('userId', 'profile.firstName profile.lastName email role');
};

// Static method to count audit logs by tenant
auditLogSchema.statics.countByTenant = function(customerId: string, filters: any = {}) {
  const query = { customerId, ...filters };
  return this.countDocuments(query);
};

// Static method to get audit summary by tenant
auditLogSchema.statics.getAuditSummary = function(customerId: string, startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        customerId,
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        users: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        action: '$_id',
        count: 1,
        uniqueUsers: { $size: '$users' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to log an audit event
auditLogSchema.statics.logEvent = function(data: {
  customerId: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}) {
  return this.create({
    ...data,
    timestamp: new Date()
  });
};

// Instance method to get formatted timestamp
auditLogSchema.methods.getFormattedTimestamp = function() {
  return this.timestamp.toISOString();
};

// Virtual for human-readable action
auditLogSchema.virtual('actionLabel').get(function() {
  const actionLabels: Record<AuditAction, string> = {
    LOGIN: 'User Login',
    LOGOUT: 'User Logout',
    TICKET_CREATE: 'Ticket Created',
    TICKET_UPDATE: 'Ticket Updated',
    TICKET_DELETE: 'Ticket Deleted',
    USER_CREATE: 'User Created',
    USER_UPDATE: 'User Updated',
    ADMIN_ACCESS: 'Admin Access',
    WORKFLOW_TRIGGER: 'Workflow Triggered',
    WEBHOOK_RECEIVED: 'Webhook Received'
  };
  
  return actionLabels[this.action] || this.action;
});

// Ensure virtuals are included in JSON output
auditLogSchema.set('toJSON', { virtuals: true });

export const AuditLog = mongoose.model<AuditLogDocument>('AuditLog', auditLogSchema); 