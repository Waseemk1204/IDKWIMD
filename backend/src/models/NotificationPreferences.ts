import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Channel preferences
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  
  // Notification type preferences
  types: {
    // Job-related notifications
    jobApplication: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    jobApproved: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    jobRejected: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    jobMatch: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    
    // Connection-related notifications
    connectionRequest: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    connectionAccepted: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    
    // Messaging notifications
    newMessage: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    messageReaction: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    
    // Community notifications
    communityMention: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    communityLike: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    communityComment: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    
    // Payment notifications
    paymentReceived: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    paymentSent: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    
    // System notifications
    systemUpdate: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    verificationUpdate: {
      enabled: boolean;
      channels: string[];
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
  };
  
  // Timing preferences
  timing: {
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM format
      end: string;   // HH:MM format
      timezone: string;
    };
    maxFrequency: {
      enabled: boolean;
      maxPerHour: number;
      maxPerDay: number;
    };
    digest: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string; // HH:MM format
    };
  };
  
  // Advanced preferences
  advanced: {
    smartGrouping: boolean;
    relevanceThreshold: number; // 0-100
    aiRecommendations: boolean;
    crossModuleIntegration: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferencesSchema = new Schema<INotificationPreferences>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  channels: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true }
  },
  
  types: {
    jobApplication: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
    },
    jobApproved: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'high' }
    },
    jobRejected: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
    },
    jobMatch: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
    },
    connectionRequest: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
    },
    connectionAccepted: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
    },
    newMessage: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'high' }
    },
    messageReaction: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'low' }
    },
    communityMention: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
    },
    communityLike: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'low' }
    },
    communityComment: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
    },
    paymentReceived: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'urgent' }
    },
    paymentSent: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'high' }
    },
    systemUpdate: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
    },
    verificationUpdate: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['push', 'email', 'sms', 'inApp'] }],
      priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'high' }
    }
  },
  
  timing: {
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '08:00' },
      timezone: { type: String, default: 'UTC' }
    },
    maxFrequency: {
      enabled: { type: Boolean, default: true },
      maxPerHour: { type: Number, default: 10 },
      maxPerDay: { type: Number, default: 50 }
    },
    digest: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
      time: { type: String, default: '09:00' }
    }
  },
  
  advanced: {
    smartGrouping: { type: Boolean, default: true },
    relevanceThreshold: { type: Number, min: 0, max: 100, default: 50 },
    aiRecommendations: { type: Boolean, default: true },
    crossModuleIntegration: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationPreferencesSchema.index({ userId: 1 });

export const NotificationPreferences = mongoose.model<INotificationPreferences>('NotificationPreferences', notificationPreferencesSchema);
