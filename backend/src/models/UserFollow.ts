import mongoose, { Document, Schema } from 'mongoose';

export interface IUserFollow extends Document {
  _id: string;
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
}

const userFollowSchema = new Schema<IUserFollow>({
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
  timestamps: true
});

// Compound index to ensure unique follower-following combinations
userFollowSchema.index({ follower: 1, following: 1 }, { unique: true });
userFollowSchema.index({ follower: 1, createdAt: -1 });
userFollowSchema.index({ following: 1, createdAt: -1 });

export const UserFollow = mongoose.model<IUserFollow>('UserFollow', userFollowSchema);

