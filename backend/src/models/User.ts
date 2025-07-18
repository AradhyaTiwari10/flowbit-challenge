import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as UserType, UserRole } from '@/types';

export interface UserDocument extends Document, Omit<UserType, '_id'> {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userProfileSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    trim: true
  }
}, { _id: false });

const userSchema = new Schema<UserDocument>({
  customerId: {
    type: String,
    required: [true, 'Customer ID is required'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['Admin', 'User', 'SuperAdmin'],
      message: 'Role must be Admin, User, or SuperAdmin'
    },
    default: 'User'
  },
  profile: {
    type: userProfileSchema,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Compound index for tenant isolation and email uniqueness
userSchema.index({ customerId: 1, email: 1 }, { unique: true });

// Index for soft delete queries
userSchema.index({ customerId: 1, deletedAt: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-update middleware to hash password on updates
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;
  
  if (update.password) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      update.password = await bcrypt.hash(update.password, saltRounds);
    } catch (error) {
      return next(error as Error);
    }
  }
  
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Static method to find active users by tenant
userSchema.statics.findActiveByTenant = function(customerId: string) {
  return this.find({
    customerId,
    deletedAt: null,
    isActive: true
  }).select('-password');
};

// Static method to find user by email within tenant
userSchema.statics.findByEmailAndTenant = function(email: string, customerId: string) {
  return this.findOne({
    email: email.toLowerCase(),
    customerId,
    deletedAt: null
  }).select('+password');
};

// Query middleware to exclude soft-deleted documents by default
userSchema.pre(/^find/, function(next) {
  if (this.getQuery().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
  next();
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });

export const User = mongoose.model<UserDocument>('User', userSchema); 