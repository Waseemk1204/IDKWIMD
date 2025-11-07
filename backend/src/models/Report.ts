import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  _id: string;
  reporterId: mongoose.Types.ObjectId;
  targetType: 'user' | 'post' | 'job' | 'comment' | 'message';
  targetId: mongoose.Types.ObjectId;
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'fake_profile' | 'scam' | 'violence' | 'hate_speech' | 'other';
  description: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Moderation
  moderatorId?: mongoose.Types.ObjectId;
  moderatorNotes?: string;
  actionTaken?: 'warning' | 'content_removed' | 'user_suspended' | 'user_banned' | 'no_action';
  
  // Metadata
  metadata?: Record<string, any>;
  
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
  reporterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['user', 'post', 'job', 'comment', 'message'],
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    enum: ['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'scam', 'violence', 'hate_speech', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Moderation
  moderatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatorNotes: {
    type: String,
    maxlength: [1000, 'Moderator notes cannot be more than 1000 characters']
  },
  actionTaken: {
    type: String,
    enum: ['warning', 'content_removed', 'user_suspended', 'user_banned', 'no_action']
  },
  
  // Metadata
  metadata: {
    type: Schema.Types.Mixed
  },
  
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ moderatorId: 1 });
reportSchema.index({ reason: 1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);
