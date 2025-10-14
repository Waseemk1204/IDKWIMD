import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityCategory extends Document {
  _id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  color?: string;
  parentCategory?: mongoose.Types.ObjectId;
  subcategories: mongoose.Types.ObjectId[];
  isActive: boolean;
  postCount: number;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const communityCategorySchema = new Schema<ICommunityCategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot be more than 100 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'CommunityCategory',
    default: null
  },
  subcategories: [{
    type: Schema.Types.ObjectId,
    ref: 'CommunityCategory'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  postCount: {
    type: Number,
    default: 0
  },
  memberCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
communityCategorySchema.index({ slug: 1 });
communityCategorySchema.index({ parentCategory: 1 });
communityCategorySchema.index({ isActive: 1 });
communityCategorySchema.index({ postCount: -1 });

// Pre-save hook to generate slug
communityCategorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Virtual for full path
communityCategorySchema.virtual('fullPath').get(function() {
  return this.parentCategory ? `${this.parentCategory.toString()} > ${this.name}` : this.name;
});

export const CommunityCategory = mongoose.model<ICommunityCategory>('CommunityCategory', communityCategorySchema);

