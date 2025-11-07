import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboardingDraft extends Document {
  userId: mongoose.Types.ObjectId;
  role: 'employee' | 'employer';
  currentStep: number;
  data: {
    // Basic info
    fullName?: string;
    email?: string;
    phone?: string;
    headline?: string;
    location?: string;
    about?: string;
    profilePhoto?: string;

    // Experience (employee)
    experiences?: Array<{
      company: string;
      title: string;
      from?: Date;
      to?: Date;
      description?: string;
      current: boolean;
    }>;

    // Education (employee)
    education?: Array<{
      institution: string;
      degree: string;
      field: string;
      from?: Date;
      to?: Date;
      current: boolean;
    }>;

    // Skills and preferences (employee)
    skills?: string[];
    jobPreferences?: {
      jobType?: string[];
      categories?: string[];
      locations?: string[];
      salaryMin?: number;
      salaryMax?: number;
      availability?: string;
    };

    // Company info (employer)
    companyInfo?: {
      companyName?: string;
      companyWebsite?: string;
      companySize?: string;
      industry?: string;
      headquarters?: string;
      description?: string;
      companyLogo?: string;
    };

    // Hiring needs (employer)
    hiringNeeds?: {
      roles?: string[];
      skills?: string[];
      budgetMin?: number;
      budgetMax?: number;
      urgency?: string;
    };

    // Resume data
    resumeData?: {
      fileName?: string;
      uploadedAt?: Date;
      parsedData?: any;
    };
  };
  completionPercentage: number;
  isCompleted: boolean;
  lastSavedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  calculateCompletion(): number;
}

const onboardingDraftSchema = new Schema<IOnboardingDraft>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: ['employee', 'employer'],
      required: true
    },
    currentStep: {
      type: Number,
      default: 0,
      min: 0
    },
    data: {
      // Basic info
      fullName: String,
      email: String,
      phone: String,
      headline: String,
      location: String,
      about: String,
      profilePhoto: String,

      // Experience (employee) - not required in draft
      experiences: [{
        company: String,
        title: String,
        from: Date,
        to: Date,
        description: String,
        current: { type: Boolean, default: false }
      }],

      // Education (employee) - not required in draft
      education: [{
        institution: String,
        degree: String,
        field: String,
        from: Date,
        to: Date,
        current: { type: Boolean, default: false }
      }],

      // Skills and preferences (employee)
      skills: [String],
      jobPreferences: {
        jobType: [String],
        categories: [String],
        locations: [String],
        salaryMin: Number,
        salaryMax: Number,
        availability: String
      },

      // Company info (employer)
      companyInfo: {
        companyName: String,
        companyWebsite: String,
        companySize: String,
        industry: String,
        headquarters: String,
        description: String,
        companyLogo: String
      },

      // Hiring needs (employer)
      hiringNeeds: {
        roles: [String],
        skills: [String],
        budgetMin: Number,
        budgetMax: Number,
        urgency: String
      },

      // Resume data
      resumeData: {
        fileName: String,
        uploadedAt: Date,
        parsedData: Schema.Types.Mixed
      }
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    lastSavedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient queries
onboardingDraftSchema.index({ userId: 1, role: 1 }, { unique: true });

// Method to calculate completion percentage
onboardingDraftSchema.methods.calculateCompletion = function(): number {
  const data = this.data;
  let completedFields = 0;
  let totalFields = 0;

  if (this.role === 'employee') {
    // Basic info (5 fields)
    totalFields += 5;
    if (data.fullName) completedFields++;
    if (data.email) completedFields++;
    if (data.phone) completedFields++;
    if (data.headline) completedFields++;
    if (data.location) completedFields++;

    // Experience
    totalFields += 1;
    if (data.experiences && data.experiences.length > 0) completedFields++;

    // Education
    totalFields += 1;
    if (data.education && data.education.length > 0) completedFields++;

    // Skills
    totalFields += 1;
    if (data.skills && data.skills.length >= 3) completedFields++;

    // Job preferences
    totalFields += 2;
    if (data.jobPreferences?.jobType && data.jobPreferences.jobType.length > 0) completedFields++;
    if (data.jobPreferences?.categories && data.jobPreferences.categories.length > 0) completedFields++;
  } else {
    // Employer
    totalFields += 5;
    if (data.companyInfo?.companyName) completedFields++;
    if (data.companyInfo?.companySize) completedFields++;
    if (data.companyInfo?.industry) completedFields++;
    if (data.companyInfo?.headquarters) completedFields++;
    if (data.companyInfo?.description) completedFields++;

    totalFields += 3;
    if (data.hiringNeeds?.roles && data.hiringNeeds.roles.length > 0) completedFields++;
    if (data.hiringNeeds?.skills && data.hiringNeeds.skills.length > 0) completedFields++;
    if (data.hiringNeeds?.budgetMin || data.hiringNeeds?.budgetMax) completedFields++;
  }

  return Math.round((completedFields / totalFields) * 100);
};

// Pre-save hook to update completion percentage and lastSavedAt
onboardingDraftSchema.pre('save', function(next) {
  this.completionPercentage = this.calculateCompletion();
  this.lastSavedAt = new Date();
  next();
});

const OnboardingDraft = mongoose.model<IOnboardingDraft>('OnboardingDraft', onboardingDraftSchema);

export default OnboardingDraft;

