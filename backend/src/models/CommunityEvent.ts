import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityEvent extends Document {
  _id: string;
  title: string;
  description: string;
  host: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  type: 'discussion' | 'workshop' | 'networking' | 'challenge' | 'qna';
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  maxParticipants?: number;
  participants: mongoose.Types.ObjectId[];
  tags: string[];
  isPublic: boolean;
  requirements?: {
    minReputation?: number;
    requiredSkills?: string[];
    maxParticipants?: number;
  };
  location?: {
    type: 'online' | 'physical';
    address?: string;
    meetingLink?: string;
  };
  agenda?: Array<{
    time: string;
    title: string;
    description?: string;
    speaker?: mongoose.Types.ObjectId;
  }>;
  resources?: Array<{
    title: string;
    url: string;
    type: 'document' | 'video' | 'link';
  }>;
  feedback: Array<{
    participant: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
  }>;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

const communityEventSchema = new Schema<ICommunityEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Event title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters'],
    trim: true
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'CommunityCategory',
    required: true
  },
  type: {
    type: String,
    enum: ['discussion', 'workshop', 'networking', 'challenge', 'qna'],
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  maxParticipants: {
    type: Number,
    min: 1
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  requirements: {
    minReputation: {
      type: Number,
      min: 0
    },
    requiredSkills: [{
      type: String,
      trim: true
    }],
    maxParticipants: {
      type: Number,
      min: 1
    }
  },
  location: {
    type: {
      type: String,
      enum: ['online', 'physical'],
      default: 'online'
    },
    address: {
      type: String,
      trim: true
    },
    meetingLink: {
      type: String,
      trim: true
    }
  },
  agenda: [{
    time: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    speaker: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  resources: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['document', 'video', 'link'],
      required: true
    }
  }],
  feedback: [{
    participant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Feedback comment cannot be more than 500 characters'],
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
communityEventSchema.index({ host: 1 });
communityEventSchema.index({ category: 1 });
communityEventSchema.index({ type: 1 });
communityEventSchema.index({ status: 1 });
communityEventSchema.index({ startDate: 1 });
communityEventSchema.index({ participants: 1 });
communityEventSchema.index({ tags: 1 });

// Virtual for participant count
communityEventSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for is full
communityEventSchema.virtual('isFull').get(function() {
  return this.maxParticipants ? this.participants.length >= this.maxParticipants : false;
});

// Method for can join
communityEventSchema.methods.canJoin = function() {
  return this.status === 'upcoming' && !this.isFull;
};

// Virtual for time until start
communityEventSchema.virtual('timeUntilStart').get(function() {
  const now = new Date();
  const diff = this.startDate.getTime() - now.getTime();
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
});

// Pre-save hook to calculate average rating
communityEventSchema.pre('save', function(next) {
  if (this.isModified('feedback')) {
    if (this.feedback.length > 0) {
      const totalRating = this.feedback.reduce((sum, feedback) => sum + feedback.rating, 0);
      this.averageRating = totalRating / this.feedback.length;
    } else {
      this.averageRating = 0;
    }
  }
  next();
});

// Method to add participant
communityEventSchema.methods.addParticipant = function(userId: mongoose.Types.ObjectId) {
  if (!this.participants.includes(userId) && this.canJoin) {
    this.participants.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove participant
communityEventSchema.methods.removeParticipant = function(id: mongoose.Types.ObjectId) {
  this.participants = this.participants.filter((participantId: mongoose.Types.ObjectId) => !participantId.equals(id));
  return this.save();
};

export const CommunityEvent = mongoose.model<ICommunityEvent>('CommunityEvent', communityEventSchema);

