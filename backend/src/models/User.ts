import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  // Basic Info
  fullName: string;
  displayName?: string;
  username: string; // Unique username for @mentions
  email: string;
  password?: string;
  phone?: string;
  phoneNumber?: string; // Alternative field name for notifications
  profilePhoto?: string;
  
  // Role & Status
  role: 'employee' | 'employer' | 'admin';
  isActive: boolean;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocs?: string[]; // URLs to uploaded documents
  verifiedAt?: Date;
  
  // Profile Details
  headline?: string; // Professional headline
  about?: string; // Bio/about section
  location?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    portfolio?: string;
  };
  
  // Professional Info
  skills: string[];
  experiences: Array<{
    company: string;
    title: string;
    from: Date;
    to?: Date;
    description?: string;
    current: boolean;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    from: Date;
    to?: Date;
    current: boolean;
  }>;
  
  // Employer Specific
  companyInfo?: {
    companyName: string;
    companyWebsite?: string;
    companyLogo?: string;
    companySize?: string;
    industry?: string;
    headquarters?: string;
    description?: string;
  };
  
  // Files
  resumeUrl?: string;
  
  // OAuth
  googleId?: string;
  facebookId?: string;
  linkedInId?: string;
  
  // Security
  refreshToken?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  lastLogin?: Date;
  
  // Notification preferences
  pushSubscriptions?: Array<{
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
    userAgent?: string;
    createdAt: Date;
  }>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  
  // Virtual properties
  profile: any;
}

const userSchema = new Schema<IUser>({
  // Basic Info
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot be more than 100 characters']
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: [50, 'Display name cannot be more than 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot be more than 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function(this: IUser) {
      return !this.googleId && !this.facebookId;
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  
  // Role & Status
  role: {
    type: String,
    enum: ['employee', 'employer', 'admin'],
    default: 'employee',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocs: [{
    type: String // URLs to uploaded documents
  }],
  verifiedAt: {
    type: Date
  },
  
  // Profile Details
  headline: {
    type: String,
    trim: true,
    maxlength: [200, 'Headline cannot be more than 200 characters']
  },
  about: {
    type: String,
    maxlength: [2000, 'About section cannot be more than 2000 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/, 'Please enter a valid LinkedIn URL']
    },
    twitter: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?twitter\.com\/.+/, 'Please enter a valid Twitter URL']
    },
    github: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?github\.com\/.+/, 'Please enter a valid GitHub URL']
    },
    portfolio: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid portfolio URL']
    }
  },
  
  // Professional Info
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill name cannot be more than 50 characters']
  }],
  experiences: [{
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters']
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Job title cannot be more than 100 characters']
    },
    from: {
      type: Date,
      required: true
    },
    to: {
      type: Date
    },
    description: {
      type: String,
      maxlength: [1000, 'Experience description cannot be more than 1000 characters']
    },
    current: {
      type: Boolean,
      default: false
    }
  }],
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Institution name cannot be more than 100 characters']
    },
    degree: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Degree name cannot be more than 100 characters']
    },
    field: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Field of study cannot be more than 100 characters']
    },
    from: {
      type: Date,
      required: true
    },
    to: {
      type: Date
    },
    current: {
      type: Boolean,
      default: false
    }
  }],
  
  // Employer Specific
  companyInfo: {
    companyName: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters']
    },
    companyWebsite: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid company website URL']
    },
    companyLogo: {
      type: String
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [50, 'Industry cannot be more than 50 characters']
    },
    headquarters: {
      type: String,
      trim: true,
      maxlength: [100, 'Headquarters cannot be more than 100 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Company description cannot be more than 1000 characters']
    }
  },
  
  // Files
  resumeUrl: {
    type: String
  },
  
  // OAuth
  googleId: {
    type: String
  },
  facebookId: {
    type: String
  },
  linkedInId: {
    type: String
  },
  
  // Security
  refreshToken: {
    type: String,
    select: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  lastLogin: {
    type: Date
  },
  
  // Notification preferences
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  pushSubscriptions: [{
    endpoint: {
      type: String,
      required: true
    },
    keys: {
      p256dh: {
        type: String,
        required: true
      },
      auth: {
        type: String,
        required: true
      }
    },
    userAgent: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ facebookId: 1 }, { unique: true, sparse: true });
userSchema.index({ linkedInId: 1 }, { unique: true, sparse: true });
userSchema.index({ 'companyInfo.companyName': 1 });
userSchema.index({ skills: 1 });
userSchema.index({ location: 1 });
userSchema.index({ verificationStatus: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    fullName: this.fullName,
    displayName: this.displayName,
    username: this.username,
    email: this.email,
    role: this.role,
    profilePhoto: this.profilePhoto,
    phone: this.phone,
    location: this.location,
    headline: this.headline,
    about: this.about,
    website: this.website,
    socialLinks: this.socialLinks,
    skills: this.skills,
    experiences: this.experiences,
    education: this.education,
    companyInfo: this.companyInfo,
    resumeUrl: this.resumeUrl,
    isVerified: this.isVerified,
    verificationStatus: this.verificationStatus,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
});

export default mongoose.model<IUser>('User', userSchema);