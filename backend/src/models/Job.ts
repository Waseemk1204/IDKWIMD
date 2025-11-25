import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  hourlyRate: number;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  hoursPerWeek: string;
  duration: string;
  skills: string[];
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  category: string;
  status: 'active' | 'paused' | 'closed' | 'draft';
  urgency: 'low' | 'medium' | 'high';
  employer: mongoose.Types.ObjectId;
  applications: mongoose.Types.ObjectId[];
  maxApplications?: number;
  applicationDeadline?: Date;
  startDate?: Date;
  endDate?: Date;
  isRemote: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior';
  postedDate: Date;
  updatedAt: Date;
  views: number;
  isFeatured: boolean;
  tags: string[];
}

const jobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Job description cannot be more than 2000 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [0, 'Hourly rate cannot be negative']
  },
  minHourlyRate: {
    type: Number,
    min: [0, 'Minimum hourly rate cannot be negative']
  },
  maxHourlyRate: {
    type: Number,
    min: [0, 'Maximum hourly rate cannot be negative'],
    validate: {
      validator: function (this: IJob, value: number) {
        return !this.minHourlyRate || !value || value >= this.minHourlyRate;
      },
      message: 'Maximum hourly rate must be greater than or equal to minimum hourly rate'
    }
  },
  hoursPerWeek: {
    type: String,
    required: [true, 'Hours per week is required'],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Job duration is required'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true,
    required: true
  }],
  requirements: [{
    type: String,
    trim: true,
    required: true
  }],
  responsibilities: [{
    type: String,
    trim: true,
    required: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: [true, 'Job category is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'draft'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  employer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applications: [{
    type: Schema.Types.ObjectId,
    ref: 'Application'
  }],
  maxApplications: {
    type: Number,
    min: [1, 'Max applications must be at least 1']
  },
  applicationDeadline: {
    type: Date
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior'],
    default: 'entry'
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
jobSchema.index({ status: 1, postedDate: -1 });
jobSchema.index({ employer: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ isFeatured: 1, postedDate: -1 });
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

// Virtual property for total applications count
jobSchema.virtual('totalApplications').get(function () {
  return this.applications?.length || 0;
});

// Virtual for days since posted
jobSchema.virtual('daysSincePosted').get(function () {
  const now = new Date();
  const posted = new Date(this.postedDate);
  const diffTime = Math.abs(now.getTime() - posted.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update tags based on skills and category
jobSchema.pre('save', function (next) {
  if (this.isModified('skills') || this.isModified('category')) {
    this.tags = [...new Set([...this.skills, this.category])];
  }
  next();
});

export default mongoose.model<IJob>('Job', jobSchema);
