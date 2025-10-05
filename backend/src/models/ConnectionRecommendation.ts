import mongoose, { Document, Schema } from 'mongoose';

export interface IConnectionRecommendation extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId; // User getting recommendations
  recommendedUserId: mongoose.Types.ObjectId; // User being recommended
  
  // Recommendation reasons
  reasons: Array<{
    type: 'mutual_connections' | 'shared_skills' | 'same_location' | 'same_company' | 'similar_experience' | 'recent_activity';
    weight: number; // 0-100, how important this reason is
    details?: string; // Additional details about the reason
  }>;
  
  // Recommendation score (0-100)
  score: number;
  
  // Metadata
  algorithmVersion: string; // Track which algorithm generated this recommendation
  createdAt: Date;
  expiresAt: Date; // Recommendations expire after 7 days
  
  // Status
  status: 'active' | 'dismissed' | 'connected' | 'expired';
  dismissedAt?: Date;
  connectedAt?: Date;
}

const connectionRecommendationSchema = new Schema<IConnectionRecommendation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recommendedUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  reasons: [{
    type: {
      type: String,
      enum: ['mutual_connections', 'shared_skills', 'same_location', 'same_company', 'similar_experience', 'recent_activity'],
      required: true
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    details: {
      type: String,
      maxlength: 200
    }
  }],
  
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  algorithmVersion: {
    type: String,
    default: '1.0'
  },
  
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  
  status: {
    type: String,
    enum: ['active', 'dismissed', 'connected', 'expired'],
    default: 'active'
  },
  
  dismissedAt: {
    type: Date
  },
  
  connectedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
connectionRecommendationSchema.index({ userId: 1, status: 1, score: -1 });
connectionRecommendationSchema.index({ recommendedUserId: 1 });
connectionRecommendationSchema.index({ expiresAt: 1 });
connectionRecommendationSchema.index({ userId: 1, recommendedUserId: 1 }, { unique: true });

// Virtual for recommendation category
connectionRecommendationSchema.virtual('category').get(function() {
  if (this.score >= 80) return 'high';
  if (this.score >= 60) return 'medium';
  return 'low';
});

// Method to check if recommendation is expired
connectionRecommendationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Method to dismiss recommendation
connectionRecommendationSchema.methods.dismiss = function() {
  this.status = 'dismissed';
  this.dismissedAt = new Date();
  return this.save();
};

// Method to mark as connected
connectionRecommendationSchema.methods.markAsConnected = function() {
  this.status = 'connected';
  this.connectedAt = new Date();
  return this.save();
};

// Static method to clean up expired recommendations
connectionRecommendationSchema.statics.cleanupExpired = async function() {
  return this.updateMany(
    { 
      expiresAt: { $lt: new Date() },
      status: 'active'
    },
    { 
      status: 'expired' 
    }
  );
};

export const ConnectionRecommendation = mongoose.model<IConnectionRecommendation>('ConnectionRecommendation', connectionRecommendationSchema);

