import mongoose, { Document, Schema } from 'mongoose';

export interface IChannel extends Document {
  _id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'announcement';
  createdBy: mongoose.Types.ObjectId;
  members: {
    user: mongoose.Types.ObjectId;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: Date;
    permissions?: {
      canPost: boolean;
      canReact: boolean;
      canPin: boolean;
      canInvite: boolean;
    };
  }[];
  topic?: string;
  purpose?: string;
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  messageCount: number;
  unreadCount?: { [userId: string]: number };
  settings: {
    allowFileUploads: boolean;
    allowReactions: boolean;
    allowThreads: boolean;
    allowMentions: boolean;
    slowMode?: number; // seconds between messages
    requireApproval: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>({
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    maxlength: [50, 'Channel name cannot be more than 50 characters'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    trim: true
  },
  type: {
    type: String,
    enum: ['public', 'private', 'announcement'],
    default: 'public'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      canPost: {
        type: Boolean,
        default: true
      },
      canReact: {
        type: Boolean,
        default: true
      },
      canPin: {
        type: Boolean,
        default: false
      },
      canInvite: {
        type: Boolean,
        default: false
      }
    }
  }],
  topic: {
    type: String,
    maxlength: [200, 'Topic cannot be more than 200 characters'],
    trim: true
  },
  purpose: {
    type: String,
    maxlength: [500, 'Purpose cannot be more than 500 characters'],
    trim: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  archivedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
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
  },
  settings: {
    allowFileUploads: {
      type: Boolean,
      default: true
    },
    allowReactions: {
      type: Boolean,
      default: true
    },
    allowThreads: {
      type: Boolean,
      default: true
    },
    allowMentions: {
      type: Boolean,
      default: true
    },
    slowMode: {
      type: Number,
      min: 0,
      max: 300 // 5 minutes max
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
channelSchema.index({ name: 1 }, { unique: true });
channelSchema.index({ type: 1 });
channelSchema.index({ 'members.user': 1 });
channelSchema.index({ isArchived: 1 });
channelSchema.index({ lastMessageAt: -1 });

// Virtual for member count
channelSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for admin count
channelSchema.virtual('adminCount').get(function() {
  return this.members.filter(member => member.role === 'admin').length;
});

// Pre-save middleware to ensure creator is admin
channelSchema.pre('save', function(next) {
  if (this.isNew) {
    const creatorMember = this.members.find(member => 
      member.user.toString() === this.createdBy.toString()
    );
    if (creatorMember) {
      creatorMember.role = 'admin';
      creatorMember.permissions = {
        canPost: true,
        canReact: true,
        canPin: true,
        canInvite: true
      };
    }
  }
  next();
});

export default mongoose.model<IChannel>('Channel', channelSchema);
