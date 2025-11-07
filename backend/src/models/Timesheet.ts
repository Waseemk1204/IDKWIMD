import mongoose, { Document, Schema } from 'mongoose';

export interface ITimesheet extends Document {
  _id: string;
  jobId: mongoose.Types.ObjectId;
  freelancerId: mongoose.Types.ObjectId;
  weekNumber: number;
  date: Date;
  hoursWorked: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  blockchainTxHash?: string;
  paidAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const timesheetSchema = new Schema<ITimesheet>({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  weekNumber: { type: Number, required: true, min: [1, 'Week number must be at least 1'] },
  date: { type: Date, required: true, default: Date.now },
  hoursWorked: { type: Number, required: true, min: [0.5, 'Hours worked must be at least 0.5'], max: [20, 'Hours worked cannot exceed 20 per week'] },
  description: { type: String, required: [true, 'Work description is required'], maxlength: [1000, 'Description cannot be more than 1000 characters'] },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String, maxlength: [500, 'Rejection reason cannot be more than 500 characters'] },
  blockchainTxHash: { type: String, sparse: true },
  paidAmount: { type: Number, min: [0, 'Paid amount cannot be negative'] }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

timesheetSchema.index({ jobId: 1, weekNumber: 1 }, { unique: true });
timesheetSchema.index({ freelancerId: 1, createdAt: -1 });
timesheetSchema.index({ status: 1, createdAt: -1 });
timesheetSchema.index({ blockchainTxHash: 1 }, { sparse: true });

timesheetSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'approved' && !this.approvedAt) this.approvedAt = new Date();
    if (this.status === 'rejected' && !this.rejectedAt) this.rejectedAt = new Date();
  }
  next();
});

export default mongoose.model<ITimesheet>('Timesheet', timesheetSchema);