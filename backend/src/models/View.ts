import mongoose, { Document, Schema } from 'mongoose';

export interface IView extends Document {
  _id: string;
  userId?: mongoose.Types.ObjectId; // Optional for anonymous views
  sessionId?: string; // For anonymous tracking
  targetType: 'post' | 'job' | 'profile';
  targetId: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const viewSchema = new Schema<IView>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String
  },
  targetType: {
    type: String,
    enum: ['post', 'job', 'profile'],
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
viewSchema.index({ targetType: 1, targetId: 1 });
viewSchema.index({ userId: 1, targetType: 1, targetId: 1 });
viewSchema.index({ sessionId: 1, targetType: 1, targetId: 1 });
viewSchema.index({ createdAt: -1 });

// Compound index to prevent duplicate views from same user/session
viewSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });
viewSchema.index({ sessionId: 1, targetType: 1, targetId: 1 }, { unique: true, partialFilterExpression: { sessionId: { $exists: true } } });

export const View = mongoose.model<IView>('View', viewSchema);
