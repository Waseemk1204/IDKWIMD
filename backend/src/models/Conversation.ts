import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  _id: string;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  isActive: boolean;
  title?: string;
  conversationType: 'direct' | 'group' | 'job_related' | 'community_related' | 'gang_related';
  job?: mongoose.Types.ObjectId;
  communityPost?: mongoose.Types.ObjectId;
  gangId?: mongoose.Types.ObjectId;
  metadata?: {
    connectionStrength?: number;
    sharedInterests?: string[];
    lastActivity?: Date;
    messageCount?: number;
    unreadCount?: { [userId: string]: number };
  };
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  conversationType: {
    type: String,
    enum: ['direct', 'group', 'job_related', 'community_related', 'gang_related'],
    default: 'direct'
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job'
  },
  communityPost: {
    type: Schema.Types.ObjectId,
    ref: 'CommunityPost'
  },
  gangId: {
    type: Schema.Types.ObjectId,
    ref: 'Gang'
  },
  metadata: {
    connectionStrength: {
      type: Number,
      min: 0,
      max: 100
    },
    sharedInterests: [{
      type: String,
      trim: true
    }],
    lastActivity: {
      type: Date
    },
    messageCount: {
      type: Number,
      default: 0
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {}
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ isActive: 1 });
conversationSchema.index({ conversationType: 1 });

// Virtual for participant count
conversationSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Pre-save middleware to ensure at least 2 participants
conversationSchema.pre('save', function(next) {
  if (this.participants.length < 2) {
    return next(new Error('Conversation must have at least 2 participants'));
  }
  next();
});

export default mongoose.model<IConversation>('Conversation', conversationSchema);
