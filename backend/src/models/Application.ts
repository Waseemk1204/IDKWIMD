import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  _id: string;
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  coverLetter: string;
  resume?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  appliedDate: Date;
  reviewedDate?: Date;
  notes?: string;
  employerNotes?: string;
  interviewScheduled?: Date;
  interviewNotes?: string;
  salaryExpectation?: number;
  availability?: string;
  portfolio?: string;
  linkedinProfile?: string;
  githubProfile?: string;
  otherLinks?: string[];
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted' | 'rejected' | 'none';
}

const applicationSchema = new Schema<IApplication>({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot be more than 1000 characters'],
    default: ''
  },
  resume: {
    type: String // URL to uploaded resume
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  reviewedDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  employerNotes: {
    type: String,
    maxlength: [500, 'Employer notes cannot be more than 500 characters']
  },
  interviewScheduled: {
    type: Date
  },
  interviewNotes: {
    type: String,
    maxlength: [1000, 'Interview notes cannot be more than 1000 characters']
  },
  salaryExpectation: {
    type: Number,
    min: [0, 'Salary expectation cannot be negative']
  },
  availability: {
    type: String,
    maxlength: [200, 'Availability cannot be more than 200 characters']
  },
  portfolio: {
    type: String
  },
  linkedinProfile: {
    type: String
  },
  githubProfile: {
    type: String
  },
  otherLinks: [{
    type: String
  }],
  offerAmount: {
    type: Number,
    min: [0, 'Offer amount cannot be negative']
  },
  offerStatus: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'none'],
    default: 'none'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
applicationSchema.index({ applicant: 1, appliedDate: -1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ status: 1, appliedDate: -1 });

// Virtual for days since applied
applicationSchema.virtual('daysSinceApplied').get(function () {
  const now = new Date();
  const applied = new Date(this.appliedDate);
  const diffTime = Math.abs(now.getTime() - applied.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update reviewed date when status changes
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status !== 'pending' && !this.reviewedDate) {
    this.reviewedDate = new Date();
  }
  next();
});

export default mongoose.model<IApplication>('Application', applicationSchema);
