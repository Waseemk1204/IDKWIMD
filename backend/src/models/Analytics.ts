import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  _id: string;
  date: Date;
  metric: string;
  value: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>({
  date: {
    type: Date,
    required: true
  },
  metric: {
    type: String,
    required: true,
    enum: [
      'daily_active_users',
      'monthly_active_users',
      'new_registrations',
      'job_posts_created',
      'applications_submitted',
      'connections_made',
      'posts_created',
      'comments_created',
      'likes_given',
      'messages_sent',
      'profile_views',
      'search_queries',
      'revenue_generated',
      'payment_success_rate'
    ]
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
analyticsSchema.index({ date: 1, metric: 1 }, { unique: true });
analyticsSchema.index({ metric: 1, date: -1 });
analyticsSchema.index({ date: -1 });

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);
