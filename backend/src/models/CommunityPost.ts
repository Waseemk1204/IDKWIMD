import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityPost extends Document {
  _id: string;
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  type: 'discussion' | 'question' | 'insight' | 'announcement' | 'project' | 'mentorship';
  tags: string[];
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  views: number;
  isPinned: boolean;
  isFeatured: boolean;
  status: 'active' | 'archived' | 'deleted' | 'pending';
  professionalContext?: {
    industry?: string;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    relatedSkills?: string[];
    jobRelevance?: boolean;
    projectConnection?: mongoose.Types.ObjectId;
  };
  engagement: {
    helpfulVotes: number;
    expertEndorsements: number;
    shares: number;
    bookmarks: number;
  };
  mentorship?: {
    isMentorshipRequest: boolean;
    menteeLevel?: 'beginner' | 'intermediate' | 'advanced';
    preferredMentorSkills?: string[];
    mentorshipType?: 'career' | 'technical' | 'business' | 'general';
  };
  createdAt: Date;
  updatedAt: Date;
}

const communityPostSchema = new Schema<ICommunityPost>({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Post title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Post content cannot be more than 5000 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'CommunityCategory',
    required: true
  },
  type: {
    type: String,
    enum: ['discussion', 'question', 'insight', 'announcement', 'project', 'mentorship'],
    default: 'discussion'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'CommunityComment'
  }],
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted', 'pending'],
    default: 'active'
  },
  professionalContext: {
    industry: {
      type: String,
      trim: true
    },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    relatedSkills: [{
      type: String,
      trim: true
    }],
    jobRelevance: {
      type: Boolean,
      default: false
    },
    projectConnection: {
      type: Schema.Types.ObjectId,
      ref: 'Job'
    }
  },
  engagement: {
    helpfulVotes: { type: Number, default: 0 },
    expertEndorsements: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 }
  },
  mentorship: {
    isMentorshipRequest: {
      type: Boolean,
      default: false
    },
    menteeLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    preferredMentorSkills: [{
      type: String,
      trim: true
    }],
    mentorshipType: {
      type: String,
      enum: ['career', 'technical', 'business', 'general']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
communityPostSchema.index({ status: 1, createdAt: -1 });
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ category: 1 });
communityPostSchema.index({ type: 1 });
communityPostSchema.index({ tags: 1 });
communityPostSchema.index({ likes: -1 });
communityPostSchema.index({ likedBy: 1 });
communityPostSchema.index({ 'professionalContext.industry': 1 });
communityPostSchema.index({ 'professionalContext.skillLevel': 1 });
communityPostSchema.index({ 'professionalContext.relatedSkills': 1 });
communityPostSchema.index({ 'mentorship.isMentorshipRequest': 1 });
communityPostSchema.index({ isFeatured: 1, createdAt: -1 });
communityPostSchema.index({ isPinned: 1, createdAt: -1 });

// Virtual for comment count
communityPostSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for time ago
communityPostSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - this.createdAt.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Virtual for engagement score
communityPostSchema.virtual('engagementScore').get(function() {
  return this.likes + (this.engagement.helpfulVotes * 2) + (this.engagement.expertEndorsements * 3) + 
         (this.engagement.shares * 1.5) + (this.engagement.bookmarks * 1) + (this.views * 0.1);
});

// Virtual for is trending
communityPostSchema.virtual('isTrending').get(function() {
  const hoursSinceCreation = (new Date().getTime() - this.createdAt.getTime()) / (1000 * 60 * 60);
  return this.engagementScore > 10 && hoursSinceCreation < 24;
});

// Virtual for professional relevance score
communityPostSchema.virtual('professionalRelevanceScore').get(function() {
  let score = 0;
  if (this.professionalContext?.jobRelevance) score += 5;
  if (this.professionalContext?.relatedSkills?.length) score += this.professionalContext.relatedSkills.length;
  if (this.mentorship?.isMentorshipRequest) score += 3;
  if (this.type === 'insight' || this.type === 'question') score += 2;
  return score;
});

// Pre-save hook to sync likes count with likedBy array
communityPostSchema.pre('save', function(next) {
  if (this.isModified('likedBy')) {
    this.likes = this.likedBy.length;
  }
  next();
});

// Method to add helpful vote
communityPostSchema.methods.addHelpfulVote = function(userId: mongoose.Types.ObjectId) {
  if (!this.likedBy.includes(userId)) {
    this.likedBy.push(userId);
    this.engagement.helpfulVotes += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add expert endorsement
communityPostSchema.methods.addExpertEndorsement = function(userId: mongoose.Types.ObjectId) {
  this.engagement.expertEndorsements += 1;
  return this.save();
};

// Method to increment views
communityPostSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to bookmark post
communityPostSchema.methods.bookmark = function() {
  this.engagement.bookmarks += 1;
  return this.save();
};

// Method to share post
communityPostSchema.methods.share = function() {
  this.engagement.shares += 1;
  return this.save();
};

// Static method to get trending posts
communityPostSchema.statics.getTrendingPosts = function(limit: number = 10) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.find({
    status: 'active',
    createdAt: { $gte: oneDayAgo }
  })
  .sort({ 'engagementScore': -1, createdAt: -1 })
  .limit(limit)
  .populate('author', 'name email profilePhoto role')
  .populate('category', 'name slug');
};

// Static method to get posts by professional context
communityPostSchema.statics.getPostsByProfessionalContext = function(
  industry?: string, 
  skillLevel?: string, 
  skills?: string[]
) {
  const query: any = { status: 'active' };
  
  if (industry) {
    query['professionalContext.industry'] = industry;
  }
  
  if (skillLevel) {
    query['professionalContext.skillLevel'] = skillLevel;
  }
  
  if (skills && skills.length > 0) {
    query['professionalContext.relatedSkills'] = { $in: skills };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('author', 'name email profilePhoto role')
    .populate('category', 'name slug');
};

export const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);
