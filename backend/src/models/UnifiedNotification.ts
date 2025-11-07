import mongoose, { Document, Schema } from 'mongoose';

export interface IUnifiedNotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'cross_module_activity' | 'gang_job_post' | 'community_connection' | 'job_gang_recommendation' | 'unified_activity_summary' | 'cross_module_mention';
  title: string;
  message: string;
  data: {
    sourceModule: 'jobs' | 'community' | 'gang' | 'messaging' | 'wallet';
    targetModule: 'jobs' | 'community' | 'gang' | 'messaging' | 'wallet';
    sourceId?: mongoose.Types.ObjectId;
    targetId?: mongoose.Types.ObjectId;
    crossModuleContext?: {
      connectionStrength?: number;
      mutualConnections?: number;
      sharedInterests?: string[];
      activityRelevance?: number;
    };
    [key: string]: any;
  };
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const unifiedNotificationSchema = new Schema<IUnifiedNotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'cross_module_activity',
      'gang_job_post',
      'community_connection',
      'job_gang_recommendation',
      'unified_activity_summary',
      'cross_module_mention'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  data: {
    sourceModule: {
      type: String,
      enum: ['jobs', 'community', 'gang', 'messaging', 'wallet'],
      required: true
    },
    targetModule: {
      type: String,
      enum: ['jobs', 'community', 'gang', 'messaging', 'wallet'],
      required: true
    },
    sourceId: {
      type: Schema.Types.ObjectId
    },
    targetId: {
      type: Schema.Types.ObjectId
    },
    crossModuleContext: {
      connectionStrength: {
        type: Number,
        min: 0,
        max: 100
      },
      mutualConnections: {
        type: Number,
        default: 0
      },
      sharedInterests: [{
        type: String
      }],
      activityRelevance: {
        type: Number,
        min: 0,
        max: 100
      }
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
unifiedNotificationSchema.index({ recipient: 1, createdAt: -1 });
unifiedNotificationSchema.index({ recipient: 1, isRead: 1 });
unifiedNotificationSchema.index({ type: 1, sourceModule: 1, targetModule: 1 });
unifiedNotificationSchema.index({ 'data.crossModuleContext.connectionStrength': -1 });

export const UnifiedNotification = mongoose.model<IUnifiedNotification>('UnifiedNotification', unifiedNotificationSchema);

