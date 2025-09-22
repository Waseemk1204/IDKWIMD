import mongoose, { Document, Schema } from 'mongoose';

export interface IBookmark extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  targetType: 'post' | 'job' | 'user' | 'company';
  targetId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['post', 'job', 'user', 'company'],
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bookmarkSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, createdAt: -1 });
bookmarkSchema.index({ targetType: 1, targetId: 1 });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
