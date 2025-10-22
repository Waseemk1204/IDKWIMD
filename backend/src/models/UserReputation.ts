import mongoose, { Document, Schema } from 'mongoose';

export interface IUserReputation extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  totalPoints: number;
  level: number;
  badges: mongoose.Types.ObjectId[];
  contributions: {
    postsCreated: number;
    commentsWritten: number;
    postsLiked: number;
    commentsLiked: number;
    helpfulVotes: number;
    expertAnswers: number;
    mentorshipSessions: number;
    eventsHosted: number;
  };
  reputationHistory: Array<{
    points: number;
    reason: string;
    source: 'post' | 'comment' | 'like' | 'helpful' | 'expert' | 'mentorship' | 'event';
    sourceId: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userReputationSchema = new Schema<IUserReputation>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  badges: [{
    type: Schema.Types.ObjectId,
    ref: 'CommunityBadge'
  }],
  contributions: {
    postsCreated: { type: Number, default: 0 },
    commentsWritten: { type: Number, default: 0 },
    postsLiked: { type: Number, default: 0 },
    commentsLiked: { type: Number, default: 0 },
    helpfulVotes: { type: Number, default: 0 },
    expertAnswers: { type: Number, default: 0 },
    mentorshipSessions: { type: Number, default: 0 },
    eventsHosted: { type: Number, default: 0 }
  },
  reputationHistory: [{
    points: { type: Number, required: true },
    reason: { type: String, required: true },
    source: { 
      type: String, 
      enum: ['post', 'comment', 'like', 'helpful', 'expert', 'mentorship', 'event'],
      required: true 
    },
    sourceId: { type: Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userReputationSchema.index({ user: 1 });
userReputationSchema.index({ totalPoints: -1 });
userReputationSchema.index({ level: -1 });
userReputationSchema.index({ lastActivity: -1 });

// Virtual for level name
userReputationSchema.virtual('levelName').get(function() {
  const levels = [
    'Newcomer', 'Contributor', 'Regular', 'Helper', 'Expert', 'Mentor', 
    'Leader', 'Champion', 'Legend', 'Master'
  ];
  return levels[Math.min(this.level - 1, levels.length - 1)] || 'Master';
});

// Virtual for next level points
userReputationSchema.virtual('nextLevelPoints').get(function() {
  return Math.pow(this.level, 2) * 100;
});

// Virtual for progress to next level
userReputationSchema.virtual('levelProgress').get(function() {
  const currentLevelPoints = Math.pow(this.level - 1, 2) * 100;
  const nextLevelPoints = Math.pow(this.level, 2) * 100;
  const progressPoints = this.totalPoints - currentLevelPoints;
  const totalNeeded = nextLevelPoints - currentLevelPoints;
  return Math.min((progressPoints / totalNeeded) * 100, 100);
});

// Method to add reputation points
userReputationSchema.methods.addReputation = function(
  points: number, 
  reason: string, 
  source: string, 
  sourceId: mongoose.Types.ObjectId
) {
  this.totalPoints += points;
  this.lastActivity = new Date();
  
  // Add to history
  this.reputationHistory.push({
    points,
    reason,
    source: source as any,
    sourceId,
    createdAt: new Date()
  });
  
  // Check for level up
  const newLevel = Math.floor(Math.sqrt(this.totalPoints / 100)) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
  }
  
  return this.save();
};

// Method to update contribution count
userReputationSchema.methods.updateContribution = function(type: string, increment: number = 1) {
  if (this.contributions[type] !== undefined) {
    this.contributions[type] += increment;
    this.lastActivity = new Date();
  }
  return this.save();
};

export const UserReputation = mongoose.model<IUserReputation>('UserReputation', userReputationSchema);

