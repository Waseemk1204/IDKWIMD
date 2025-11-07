import mongoose, { Document, Schema } from 'mongoose';

export interface IEnhancedNotification extends Document {
  _id: string;
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  
  // Core notification data
  type: 'connection_request' | 'connection_accepted' | 'job_application' | 'job_approved' | 'job_rejected' | 'job_match' | 'message' | 'message_reaction' | 'verification_approved' | 'verification_rejected' | 'payment_received' | 'payment_sent' | 'system' | 'community_like' | 'community_comment' | 'community_mention' | 'cross_module_activity' | 'gang_job_post' | 'community_connection' | 'job_gang_recommendation' | 'unified_activity_summary' | 'cross_module_mention';
  
  title: string;
  message: string;
  
  // Rich content
  richContent?: {
    image?: string;
    avatar?: string;
    preview?: string;
    actionButtons?: Array<{
      label: string;
      action: string;
      url?: string;
      style?: 'primary' | 'secondary' | 'danger';
    }>;
    metadata?: {
      jobTitle?: string;
      companyName?: string;
      amount?: number;
      connectionName?: string;
      postTitle?: string;
      [key: string]: any;
    };
  };
  
  // Context and related data
  context?: {
    module: 'jobs' | 'community' | 'gang' | 'messaging' | 'wallet' | 'profile';
    relatedEntity?: {
      type: 'job' | 'post' | 'message' | 'connection' | 'application' | 'transaction';
      id: mongoose.Types.ObjectId;
      title?: string;
      url?: string;
    };
    crossModuleContext?: {
      sourceModule: string;
      targetModule: string;
      connectionStrength?: number;
      mutualConnections?: number;
      sharedInterests?: string[];
      activityRelevance?: number;
    };
  };
  
  // Delivery and tracking
  delivery: {
    channels: Array<'push' | 'email' | 'sms' | 'inApp'>;
    status: {
      push?: 'pending' | 'sent' | 'delivered' | 'failed';
      email?: 'pending' | 'sent' | 'delivered' | 'failed';
      sms?: 'pending' | 'sent' | 'delivered' | 'failed';
      inApp?: 'pending' | 'sent' | 'delivered' | 'failed';
    };
    sentAt?: Date;
    deliveredAt?: Date;
    failedAt?: Date;
    failureReason?: string;
  };
  
  // User interaction tracking
  interaction: {
    isRead: boolean;
    readAt?: Date;
    clickedAt?: Date;
    actionTaken?: string;
    dismissedAt?: Date;
    feedback?: 'positive' | 'negative' | 'neutral';
  };
  
  // Smart features
  smart: {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    relevanceScore: number; // 0-100
    groupingId?: string; // For smart grouping
    digestId?: string; // For digest notifications
    aiGenerated: boolean;
    personalizedContent?: string;
  };
  
  // Expiration and cleanup
  expiresAt?: Date;
  autoDeleteAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  timeAgo: string;
  isExpired: boolean;
}

const enhancedNotificationSchema = new Schema<IEnhancedNotification>({
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
      'connection_request', 'connection_accepted', 'job_application', 'job_approved', 
      'job_rejected', 'job_match', 'message', 'message_reaction', 'verification_approved', 
      'verification_rejected', 'payment_received', 'payment_sent', 'system', 
      'community_like', 'community_comment', 'community_mention', 'cross_module_activity', 
      'gang_job_post', 'community_connection', 'job_gang_recommendation', 
      'unified_activity_summary', 'cross_module_mention'
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
  
  richContent: {
    image: String,
    avatar: String,
    preview: String,
    actionButtons: [{
      label: { type: String, required: true },
      action: { type: String, required: true },
      url: String,
      style: { type: String, enum: ['primary', 'secondary', 'danger'], default: 'primary' }
    }],
    metadata: Schema.Types.Mixed
  },
  
  context: {
    module: {
      type: String,
      enum: ['jobs', 'community', 'gang', 'messaging', 'wallet', 'profile'],
      required: true
    },
    relatedEntity: {
      type: {
        type: String,
        enum: ['job', 'post', 'message', 'connection', 'application', 'transaction']
      },
      id: Schema.Types.ObjectId,
      title: String,
      url: String
    },
    crossModuleContext: {
      sourceModule: String,
      targetModule: String,
      connectionStrength: { type: Number, min: 0, max: 100 },
      mutualConnections: { type: Number, default: 0 },
      sharedInterests: [String],
      activityRelevance: { type: Number, min: 0, max: 100 }
    }
  },
  
  delivery: {
    channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
    status: {
      push: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'] },
      email: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'] },
      sms: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'] },
      inApp: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'] }
    },
    sentAt: Date,
    deliveredAt: Date,
    failedAt: Date,
    failureReason: String
  },
  
  interaction: {
    isRead: { type: Boolean, default: false },
    readAt: Date,
    clickedAt: Date,
    actionTaken: String,
    dismissedAt: Date,
    feedback: { type: String, enum: ['positive', 'negative', 'neutral'] }
  },
  
  smart: {
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    relevanceScore: { type: Number, min: 0, max: 100, default: 50 },
    groupingId: String,
    digestId: String,
    aiGenerated: { type: Boolean, default: false },
    personalizedContent: String
  },
  
  expiresAt: Date,
  autoDeleteAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual properties
enhancedNotificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now.getTime() - this.createdAt.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

enhancedNotificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt ? new Date() > this.expiresAt : false;
});

// Indexes for better query performance
enhancedNotificationSchema.index({ recipient: 1, createdAt: -1 });
enhancedNotificationSchema.index({ recipient: 1, 'interaction.isRead': 1 });
enhancedNotificationSchema.index({ type: 1, 'context.module': 1 });
enhancedNotificationSchema.index({ 'smart.priority': 1, 'smart.relevanceScore': -1 });
enhancedNotificationSchema.index({ 'smart.groupingId': 1 });
enhancedNotificationSchema.index({ 'smart.digestId': 1 });
enhancedNotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
enhancedNotificationSchema.index({ autoDeleteAt: 1 }, { expireAfterSeconds: 0 });

export const EnhancedNotification = mongoose.model<IEnhancedNotification>('EnhancedNotification', enhancedNotificationSchema);
