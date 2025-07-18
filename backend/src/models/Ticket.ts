import mongoose, { Document, Schema } from 'mongoose';
import { Ticket as TicketType, TicketStatus, TicketPriority } from '@/types';

export interface TicketDocument extends Document, Omit<TicketType, '_id'> {}

const ticketSchema = new Schema<TicketDocument>({
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
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['Open', 'InProgress', 'Resolved', 'Closed'],
      message: 'Status must be Open, InProgress, Resolved, or Closed'
    },
    default: 'Open',
    index: true
  },
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High', 'Critical'],
      message: 'Priority must be Low, Medium, High, or Critical'
    },
    default: 'Medium',
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  workflowId: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
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
ticketSchema.index({ customerId: 1, status: 1 });
ticketSchema.index({ customerId: 1, priority: 1 });
ticketSchema.index({ customerId: 1, assignedTo: 1 });
ticketSchema.index({ customerId: 1, userId: 1 });
ticketSchema.index({ customerId: 1, category: 1 });
ticketSchema.index({ customerId: 1, createdAt: -1 });

// Index for soft delete queries
ticketSchema.index({ customerId: 1, deletedAt: 1 });

// Query middleware to exclude soft-deleted documents by default
ticketSchema.pre(/^find/, function(next) {
  if (this.getQuery().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
  next();
});

// Populate middleware for common queries
ticketSchema.pre(/^find/, function(next) {
  if (this.getQuery().populate !== false) {
    this.populate('userId', 'profile.firstName profile.lastName email')
      .populate('assignedTo', 'profile.firstName profile.lastName email');
  }
  next();
});

// Static method to find tickets by tenant
ticketSchema.statics.findByTenant = function(customerId: string, options: {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  userId?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
} = {}) {
  const query: any = { customerId };
  
  if (options.status) query.status = options.status;
  if (options.priority) query.priority = options.priority;
  if (options.assignedTo) query.assignedTo = options.assignedTo;
  if (options.userId) query.userId = options.userId;
  if (options.category) query.category = options.category;

  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  const sort = options.sort || '-createdAt';

  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('userId', 'profile.firstName profile.lastName email')
    .populate('assignedTo', 'profile.firstName profile.lastName email');
};

// Static method to count tickets by tenant
ticketSchema.statics.countByTenant = function(customerId: string, filters: any = {}) {
  const query = { customerId, ...filters };
  return this.countDocuments(query);
};

// Instance method to update status
ticketSchema.methods.updateStatus = function(status: TicketStatus, assignedTo?: string) {
  this.status = status;
  if (assignedTo) {
    this.assignedTo = assignedTo;
  }
  return this.save();
};

// Instance method to assign ticket
ticketSchema.methods.assignTo = function(userId: string) {
  this.assignedTo = userId;
  return this.save();
};

// Virtual for isOverdue (tickets open for more than 7 days)
ticketSchema.virtual('isOverdue').get(function() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return this.status === 'Open' && this.createdAt < sevenDaysAgo;
});

// Virtual for timeSinceCreation
ticketSchema.virtual('timeSinceCreation').get(function() {
  const now = new Date();
  const diffInMs = now.getTime() - this.createdAt.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  return diffInDays;
});

// Ensure virtuals are included in JSON output
ticketSchema.set('toJSON', { virtuals: true });

export const Ticket = mongoose.model<TicketDocument>('Ticket', ticketSchema); 