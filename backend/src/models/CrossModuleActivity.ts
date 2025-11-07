import mongoose, { Document, Schema } from 'mongoose';

export interface ICrossModuleActivity extends Document {
  userId: mongoose.Types.ObjectId;
  module: 'jobs' | 'community' | 'gang' | 'messaging' | 'wallet' | 'timesheet';
  action: string;
  targetId?: mongoose.Types.ObjectId;
  targetType?: 'job' | 'post' | 'user' | 'message' | 'connection' | 'transaction';
  metadata: {
    jobId?: mongoose.Types.ObjectId;
    postId?: mongoose.Types.ObjectId;
    connectionId?: mongoose.Types.ObjectId;
    messageId?: mongoose.Types.ObjectId;
    transactionId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  impactScore: number; // 0-100, how much this affects other modules
  createdAt: Date;
  updatedAt: Date;
}

const crossModuleActivitySchema = new Schema<ICrossModuleActivity>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  module: {
    type: String,
    enum: ['jobs', 'community', 'gang', 'messaging', 'wallet', 'timesheet'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId
  },
  targetType: {
    type: String,
    enum: ['job', 'post', 'user', 'message', 'connection', 'transaction']
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  impactScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
crossModuleActivitySchema.index({ userId: 1, createdAt: -1 });
crossModuleActivitySchema.index({ module: 1, action: 1 });
crossModuleActivitySchema.index({ targetId: 1, targetType: 1 });
crossModuleActivitySchema.index({ impactScore: -1 });

export const CrossModuleActivity = mongoose.model<ICrossModuleActivity>('CrossModuleActivity', crossModuleActivitySchema);

