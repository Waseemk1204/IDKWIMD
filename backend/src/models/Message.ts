import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'job_context' | 'community_context';
  attachments?: string[];
  isRead: boolean;
  readAt?: Date;
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
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
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
    enum: ['text', 'image', 'file', 'system', 'job_context', 'community_context'],
    default: 'text'
  },
  attachments: [{
    type: String // URLs to uploaded files
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
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
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry', 'thumbs_up', 'lightbulb', 'checkmark', 'question']
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
    }
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
