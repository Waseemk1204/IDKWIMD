import mongoose, { Document, Schema } from 'mongoose';

export interface IUserBookmark extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
}

const userBookmarkSchema = new Schema<IUserBookmark>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-post combinations
userBookmarkSchema.index({ user: 1, post: 1 }, { unique: true });
userBookmarkSchema.index({ user: 1, createdAt: -1 });

export const UserBookmark = mongoose.model<IUserBookmark>('UserBookmark', userBookmarkSchema);

