import mongoose, { Document, Schema } from 'mongoose';

export interface IContract extends Document {
  _id: string;
  job: mongoose.Types.ObjectId;
  employer: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
  application: mongoose.Types.ObjectId;
  
  // Contract terms
  hourlyRate: number;
  hoursPerWeek: number;
  duration: string; // e.g., "3 months", "6 weeks"
  totalEstimatedCost: number; // Total locked amount
  weeklyPayment: number;
  
  // Status tracking
  status: 'pending' | 'active' | 'completed' | 'terminated';
  startDate: Date;
  endDate?: Date;
  actualEndDate?: Date;
  
  // Payment tracking
  lockedAmount: number; // Amount locked in employer's wallet
  paidAmount: number; // Total amount paid out
  remainingAmount: number; // Remaining locked amount
  
  // Timesheet tracking
  approvedTimesheets: number;
  totalHoursWorked: number;
  
  // Experience tracking
  experienceAddedToProfile: boolean;
  
  // Termination
  terminationReason?: string;
  terminatedBy?: mongoose.Types.ObjectId;
  terminationDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const contractSchema = new Schema<IContract>({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  employer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  application: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  
  // Contract terms
  hourlyRate: {
    type: Number,
    required: true,
    min: [0, 'Hourly rate cannot be negative']
  },
  hoursPerWeek: {
    type: Number,
    required: true,
    min: [1, 'Hours per week must be at least 1']
  },
  duration: {
    type: String,
    required: true
  },
  totalEstimatedCost: {
    type: Number,
    required: true,
    min: [0, 'Total cost cannot be negative']
  },
  weeklyPayment: {
    type: Number,
    required: true,
    min: [0, 'Weekly payment cannot be negative']
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'terminated'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  
  // Payment tracking
  lockedAmount: {
    type: Number,
    required: true,
    default: 0
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    default: 0
  },
  
  // Timesheet tracking
  approvedTimesheets: {
    type: Number,
    default: 0
  },
  totalHoursWorked: {
    type: Number,
    default: 0
  },
  
  // Experience tracking
  experienceAddedToProfile: {
    type: Boolean,
    default: false
  },
  
  // Termination
  terminationReason: {
    type: String,
    maxlength: [500, 'Termination reason cannot be more than 500 characters']
  },
  terminatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  terminationDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
contractSchema.index({ job: 1, employee: 1 }, { unique: true });
contractSchema.index({ employer: 1, status: 1 });
contractSchema.index({ employee: 1, status: 1 });
contractSchema.index({ status: 1, startDate: -1 });

// Virtual for contract progress percentage
contractSchema.virtual('progressPercentage').get(function() {
  if (this.totalEstimatedCost === 0) return 0;
  return Math.round((this.paidAmount / this.totalEstimatedCost) * 100);
});

// Pre-save middleware to calculate remainingAmount
contractSchema.pre('save', function(next) {
  this.remainingAmount = this.lockedAmount - this.paidAmount;
  next();
});

export default mongoose.model<IContract>('Contract', contractSchema);

