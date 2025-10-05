import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityBadge extends Document {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'contribution' | 'expertise' | 'leadership' | 'mentorship' | 'special';
  requirements: {
    type: 'points' | 'posts' | 'comments' | 'likes' | 'helpful' | 'expert' | 'mentorship' | 'events';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'alltime';
  };
  isActive: boolean;
  isRare: boolean;
  awardedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const communityBadgeSchema = new Schema<ICommunityBadge>({
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    trim: true,
    maxlength: [50, 'Badge name cannot be more than 50 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Badge description is required'],
    maxlength: [200, 'Description cannot be more than 200 characters'],
    trim: true
  },
  icon: {
    type: String,
    required: [true, 'Badge icon is required'],
    trim: true
  },
  color: {
    type: String,
    required: [true, 'Badge color is required'],
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  category: {
    type: String,
    enum: ['contribution', 'expertise', 'leadership', 'mentorship', 'special'],
    required: true
  },
  requirements: {
    type: {
      type: String,
      enum: ['points', 'posts', 'comments', 'likes', 'helpful', 'expert', 'mentorship', 'events'],
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 1
    },
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'alltime'],
      default: 'alltime'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRare: {
    type: Boolean,
    default: false
  },
  awardedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
communityBadgeSchema.index({ category: 1 });
communityBadgeSchema.index({ isActive: 1 });
communityBadgeSchema.index({ awardedCount: -1 });

// Virtual for rarity percentage
communityBadgeSchema.virtual('rarityPercentage').get(function() {
  if (this.awardedCount === 0) return 0;
  // This would need total user count from database
  // For now, return a placeholder
  return Math.min((this.awardedCount / 1000) * 100, 100);
});

export const CommunityBadge = mongoose.model<ICommunityBadge>('CommunityBadge', communityBadgeSchema);

