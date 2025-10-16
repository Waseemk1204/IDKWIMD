import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  conversation: mongoose.Types.ObjectId;
  channel?: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'job_context' | 'community_context' | 'call_start' | 'call_end' | 'screen_share';
  attachments?: {
    url: string;
    filename: string;
    fileType: string;
    fileSize: number;
    thumbnailUrl?: string;
  }[];
  isRead: boolean;
  readAt?: Date;
  readBy?: mongoose.Types.ObjectId[];
  editedAt?: Date;
  isEdited: boolean;
  replyTo?: mongoose.Types.ObjectId;
  threadId?: mongoose.Types.ObjectId;
  reactions?: {
    reactionType: string;
    count: number;
    users: mongoose.Types.ObjectId[];
  }[];
  context?: {
    jobId?: mongoose.Types.ObjectId;
    communityPostId?: mongoose.Types.ObjectId;
    connectionId?: mongoose.Types.ObjectId;
    applicationId?: mongoose.Types.ObjectId;
    callId?: string;
    callDuration?: number;
    callType?: 'audio' | 'video';
  };
  mentions?: mongoose.Types.ObjectId[];
  isPinned?: boolean;
  pinnedAt?: Date;
  pinnedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: function() { return !this.channel; }
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: function() { return !this.conversation; }
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot be more than 2000 characters'],
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'job_context', 'community_context', 'call_start', 'call_end', 'screen_share'],
    default: 'text'
  },
  attachments: [{
    url: { type: String, required: true },
    filename: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    thumbnailUrl: { type: String }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  editedAt: {
    type: Date
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  threadId: {
    type: Schema.Types.ObjectId,
    ref: 'MessageThread'
  },
  reactions: [{
    reactionType: {
      type: String,
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry', 'thumbs_up', 'lightbulb', 'checkmark', 'question', 'fire', 'rocket', 'eyes', 'party']
    },
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  context: {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job'
    },
    communityPostId: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityPost'
    },
    connectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Connection'
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application'
    },
    callId: {
      type: String
    },
    callDuration: {
      type: Number
    },
    callType: {
      type: String,
      enum: ['audio', 'video']
    }
  },
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedAt: {
    type: Date
  },
  pinnedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ isRead: 1 });

// Pre-save middleware to set readAt when isRead changes
messageSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  
  if (this.isModified('content') && this.isNew === false) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  
  next();
});

export default mongoose.model<IMessage>('Message', messageSchema);
