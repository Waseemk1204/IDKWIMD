import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogBookmark extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  createdAt: Date;
}

const blogBookmarkSchema = new Schema<IBlogBookmark>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  }
}, {
  timestamps: true
});

// Create compound index to ensure one bookmark per user per blog
blogBookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });

export default mongoose.model<IBlogBookmark>('BlogBookmark', blogBookmarkSchema);
