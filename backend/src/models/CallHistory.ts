import mongoose, { Document, Schema } from 'mongoose';

export interface ICallHistory extends Document {
  _id: string;
  callId: string;
  participants: {
    user: mongoose.Types.ObjectId;
    joinedAt: Date;
    leftAt?: Date;
    duration?: number;
    status: 'joined' | 'left' | 'missed' | 'declined';
  }[];
  conversation?: mongoose.Types.ObjectId;
  channel?: mongoose.Types.ObjectId;
  callType: 'audio' | 'video';
  status: 'initiated' | 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  initiatedBy: mongoose.Types.ObjectId;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  jitsiRoomUrl?: string;
  recordingUrl?: string;
  screenShareEnabled: boolean;
  screenShareParticipants?: mongoose.Types.ObjectId[];
  metadata?: {
    quality?: 'high' | 'medium' | 'low';
    connectionType?: 'wifi' | 'cellular' | 'ethernet';
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    browserInfo?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const callHistorySchema = new Schema<ICallHistory>({
  callId: {
    type: String,
    required: true
  },
  participants: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: {
      type: Date
    },
    duration: {
      type: Number // in seconds
    },
    status: {
      type: String,
      enum: ['joined', 'left', 'missed', 'declined'],
      default: 'joined'
    }
  }],
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: 'Channel'
  },
  callType: {
    type: String,
    enum: ['audio', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['initiated', 'ringing', 'active', 'ended', 'missed', 'declined'],
    default: 'initiated'
  },
  initiatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number // in seconds
  },
  jitsiRoomUrl: {
    type: String
  },
  recordingUrl: {
    type: String
  },
  screenShareEnabled: {
    type: Boolean,
    default: false
  },
  screenShareParticipants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  metadata: {
    quality: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    connectionType: {
      type: String,
      enum: ['wifi', 'cellular', 'ethernet']
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet']
    },
    browserInfo: {
      type: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
callHistorySchema.index({ callId: 1 }, { unique: true });
callHistorySchema.index({ 'participants.user': 1 });
callHistorySchema.index({ conversation: 1 });
callHistorySchema.index({ channel: 1 });
callHistorySchema.index({ initiatedBy: 1 });
callHistorySchema.index({ status: 1 });
callHistorySchema.index({ startedAt: -1 });

// Virtual for participant count
callHistorySchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for active participants
callHistorySchema.virtual('activeParticipants').get(function() {
  return this.participants.filter(p => p.status === 'joined').length;
});

// Pre-save middleware to calculate duration
callHistorySchema.pre('save', function(next) {
  if (this.startedAt && this.endedAt) {
    this.duration = Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
  }
  next();
});

export default mongoose.model<ICallHistory>('CallHistory', callHistorySchema);
