import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  thumbnail: string;
  status: 'draft' | 'published' | 'archived';
  publishedDate?: Date;
  views: number;
  likes: number;
  comments: mongoose.Types.ObjectId[];
  isFeatured: boolean;
  readingTime: number;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
}

const blogSchema = new Schema<IBlog>({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Blog title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    maxlength: [10000, 'Blog content cannot be more than 10000 characters']
  },
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    maxlength: [500, 'Blog excerpt cannot be more than 500 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Blog category is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    required: [true, 'Blog thumbnail is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedDate: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  readingTime: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  seoTitle: {
    type: String,
    maxlength: [60, 'SEO title cannot be more than 60 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot be more than 160 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
blogSchema.index({ status: 1, publishedDate: -1 });
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isFeatured: 1, publishedDate: -1 });
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for days since published
blogSchema.virtual('daysSincePublished').get(function() {
  if (!this.publishedDate) return null;
  const now = new Date();
  const published = new Date(this.publishedDate);
  const diffTime = Math.abs(now.getTime() - published.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate slug and calculate reading time
blogSchema.pre('save', function(next) {
  // Generate slug from title
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Calculate reading time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedDate) {
    this.publishedDate = new Date();
  }

  next();
});

export default mongoose.model<IBlog>('Blog', blogSchema);
