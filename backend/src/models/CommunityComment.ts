import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityComment extends Document {
  _id: string;
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId;
  replies: mongoose.Types.ObjectId[];
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  isApproved: boolean;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const communityCommentSchema = new Schema<ICommunityComment>({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'CommunityComment',
    default: null
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'CommunityComment'
  }],
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
communityCommentSchema.index({ post: 1, createdAt: -1 });
communityCommentSchema.index({ author: 1 });
communityCommentSchema.index({ parentComment: 1 });
communityCommentSchema.index({ isDeleted: 1 });
communityCommentSchema.index({ isApproved: 1 });
communityCommentSchema.index({ likedBy: 1 });

// Virtual for reply count
communityCommentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Virtual for time ago
communityCommentSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - this.createdAt.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Pre-save hook to sync likes count with likedBy array
communityCommentSchema.pre('save', function(next) {
  if (this.isModified('likedBy')) {
    this.likes = this.likedBy.length;
  }
  next();
});

export const CommunityComment = mongoose.model<ICommunityComment>('CommunityComment', communityCommentSchema);
