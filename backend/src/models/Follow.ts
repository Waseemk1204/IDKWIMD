import mongoose, { Document, Schema } from 'mongoose';

export interface IFollow extends Document {
  _id: string;
  follower: mongoose.Types.ObjectId; // Employee who is following
  following: mongoose.Types.ObjectId; // Employer being followed
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<IFollow>({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 });
followSchema.index({ follower: 1 });

// Pre-save middleware to ensure users can't follow themselves
followSchema.pre('save', function(next) {
  if (this.follower.toString() === this.following.toString()) {
    const error = new Error('Users cannot follow themselves');
    return next(error);
  }
  next();
});

export const Follow = mongoose.model<IFollow>('Follow', followSchema);
