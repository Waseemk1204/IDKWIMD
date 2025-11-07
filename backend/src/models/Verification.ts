import mongoose, { Document, Schema } from 'mongoose';

export interface IVerification extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  type: 'identity' | 'employment' | 'education' | 'company';
  status: 'pending' | 'approved' | 'rejected';
  
  // Document details
  documents: Array<{
    type: string; // 'passport', 'drivers_license', 'utility_bill', 'employment_letter', 'degree_certificate', 'company_registration'
    url: string;
    filename: string;
    uploadedAt: Date;
  }>;
  
  // Verification details
  verifiedBy?: mongoose.Types.ObjectId; // Admin who verified
  verifiedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  
  // Additional data based on type
  additionalData?: {
    // For employment verification
    companyName?: string;
    position?: string;
    startDate?: Date;
    endDate?: Date;
    
    // For education verification
    institutionName?: string;
    degree?: string;
    graduationDate?: Date;
    
    // For company verification
    businessRegistration?: string;
    taxId?: string;
    businessAddress?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const verificationSchema = new Schema<IVerification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['identity', 'employment', 'education', 'company'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Document details
  documents: [{
    type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Verification details
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot be more than 500 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  
  // Additional data
  additionalData: {
    // Employment verification
    companyName: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters']
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position cannot be more than 100 characters']
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    
    // Education verification
    institutionName: {
      type: String,
      trim: true,
      maxlength: [100, 'Institution name cannot be more than 100 characters']
    },
    degree: {
      type: String,
      trim: true,
      maxlength: [100, 'Degree cannot be more than 100 characters']
    },
    graduationDate: {
      type: Date
    },
    
    // Company verification
    businessRegistration: {
      type: String,
      trim: true,
      maxlength: [50, 'Business registration cannot be more than 50 characters']
    },
    taxId: {
      type: String,
      trim: true,
      maxlength: [50, 'Tax ID cannot be more than 50 characters']
    },
    businessAddress: {
      type: String,
      trim: true,
      maxlength: [200, 'Business address cannot be more than 200 characters']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
verificationSchema.index({ userId: 1, type: 1 });
verificationSchema.index({ status: 1 });
verificationSchema.index({ type: 1 });
verificationSchema.index({ verifiedBy: 1 });
verificationSchema.index({ createdAt: -1 });

// Virtual for time ago
verificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - this.createdAt.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return this.createdAt.toLocaleDateString();
});

export const Verification = mongoose.model<IVerification>('Verification', verificationSchema);
