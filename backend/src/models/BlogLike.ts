import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogLike extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  createdAt: Date;
}

const blogLikeSchema = new Schema<IBlogLike>({
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

// Create compound index to ensure one like per user per blog
blogLikeSchema.index({ user: 1, blog: 1 }, { unique: true });

export default mongoose.model<IBlogLike>('BlogLike', blogLikeSchema);
