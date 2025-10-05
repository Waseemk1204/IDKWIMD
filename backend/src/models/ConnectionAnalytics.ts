import mongoose, { Document, Schema } from 'mongoose';

export interface IConnectionAnalytics extends Document {
  _id: string;
  connectionId: mongoose.Types.ObjectId; // Reference to Connection
  user1: mongoose.Types.ObjectId; // First user in connection
  user2: mongoose.Types.ObjectId; // Second user in connection
  
  // Interaction metrics
  messageCount: number; // Number of messages exchanged
  lastInteraction: Date; // Last time they interacted
  interactionFrequency: number; // Interactions per week
  
  // Connection strength (0-100)
  strength: number;
  
  // Activity metrics
  sharedJobApplications: number; // Jobs both applied to
  mutualConnections: number; // Number of shared connections
  skillEndorsements: number; // Skills endorsed by each other
  
  // Engagement metrics
  profileViews: number; // Times users viewed each other's profiles
  contentInteractions: number; // Likes, comments on each other's posts
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const connectionAnalyticsSchema = new Schema<IConnectionAnalytics>({
  connectionId: {
    type: Schema.Types.ObjectId,
    ref: 'Connection',
    required: true,
    unique: true
  },
  user1: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Interaction metrics
  messageCount: {
    type: Number,
    default: 0
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  interactionFrequency: {
    type: Number,
    default: 0
  },
  
  // Connection strength
  strength: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  
  // Activity metrics
  sharedJobApplications: {
    type: Number,
    default: 0
  },
  mutualConnections: {
    type: Number,
    default: 0
  },
  skillEndorsements: {
    type: Number,
    default: 0
  },
  
  // Engagement metrics
  profileViews: {
    type: Number,
    default: 0
  },
  contentInteractions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
connectionAnalyticsSchema.index({ connectionId: 1 });
connectionAnalyticsSchema.index({ user1: 1, user2: 1 });
connectionAnalyticsSchema.index({ strength: -1 });
connectionAnalyticsSchema.index({ lastInteraction: -1 });

// Virtual for connection strength category
connectionAnalyticsSchema.virtual('strengthCategory').get(function() {
  if (this.strength >= 80) return 'strong';
  if (this.strength >= 60) return 'good';
  if (this.strength >= 40) return 'moderate';
  return 'weak';
});

// Method to calculate connection strength
connectionAnalyticsSchema.methods.calculateStrength = function() {
  let strength = 50; // Base strength
  
  // Message frequency bonus
  if (this.messageCount > 50) strength += 20;
  else if (this.messageCount > 20) strength += 15;
  else if (this.messageCount > 10) strength += 10;
  else if (this.messageCount > 5) strength += 5;
  
  // Recent interaction bonus
  const daysSinceLastInteraction = (Date.now() - this.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastInteraction < 7) strength += 15;
  else if (daysSinceLastInteraction < 30) strength += 10;
  else if (daysSinceLastInteraction < 90) strength += 5;
  
  // Mutual connections bonus
  if (this.mutualConnections > 10) strength += 10;
  else if (this.mutualConnections > 5) strength += 7;
  else if (this.mutualConnections > 2) strength += 5;
  
  // Shared activities bonus
  if (this.sharedJobApplications > 5) strength += 10;
  else if (this.sharedJobApplications > 2) strength += 5;
  
  // Skill endorsements bonus
  if (this.skillEndorsements > 5) strength += 10;
  else if (this.skillEndorsements > 2) strength += 5;
  
  // Profile views bonus
  if (this.profileViews > 20) strength += 5;
  else if (this.profileViews > 10) strength += 3;
  
  // Content interactions bonus
  if (this.contentInteractions > 10) strength += 5;
  else if (this.contentInteractions > 5) strength += 3;
  
  this.strength = Math.min(100, Math.max(0, strength));
  return this.strength;
};

// Pre-save middleware to calculate strength
connectionAnalyticsSchema.pre('save', function(next) {
  this.calculateStrength();
  next();
});

export const ConnectionAnalytics = mongoose.model<IConnectionAnalytics>('ConnectionAnalytics', connectionAnalyticsSchema);

