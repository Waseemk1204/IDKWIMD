import mongoose, { Document, Schema } from 'mongoose';

export interface IUnifiedUserContext extends Document {
  userId: mongoose.Types.ObjectId;
  crossModuleProfile: {
    totalEngagement: number;
    moduleActivity: {
      jobs: {
        applicationsCount: number;
        lastApplication: Date;
        averageResponseTime: number;
        successRate: number;
      };
      community: {
        postsCount: number;
        lastPost: Date;
        likesReceived: number;
        commentsReceived: number;
      };
      gang: {
        connectionsCount: number;
        lastConnection: Date;
        averageConnectionStrength: number;
        mutualConnectionsCount: number;
      };
      messaging: {
        messagesSent: number;
        lastMessage: Date;
        activeConversations: number;
        responseRate: number;
      };
      wallet: {
        transactionsCount: number;
        lastTransaction: Date;
        totalEarned: number;
        totalSpent: number;
      };
    };
    networkMetrics: {
      influenceScore: number; // 0-100
      reachScore: number; // 0-100
      engagementScore: number; // 0-100
      crossModuleActivity: number; // 0-100
    };
    preferences: {
      notificationSettings: {
        crossModuleAlerts: boolean;
        gangActivityAlerts: boolean;
        communityEngagementAlerts: boolean;
        jobRecommendationAlerts: boolean;
        unifiedActivitySummary: boolean;
      };
      privacySettings: {
        showCrossModuleActivity: boolean;
        showGangActivityToCommunity: boolean;
        showJobActivityToGang: boolean;
        showCommunityActivityToGang: boolean;
      };
      integrationSettings: {
        autoConnectOnJobApplication: boolean;
        autoShareJobToGang: boolean;
        autoNotifyGangOnCommunityPost: boolean;
        enableCrossModuleRecommendations: boolean;
      };
    };
  };
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const unifiedUserContextSchema = new Schema<IUnifiedUserContext>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  crossModuleProfile: {
    totalEngagement: {
      type: Number,
      default: 0
    },
    moduleActivity: {
      jobs: {
        applicationsCount: {
          type: Number,
          default: 0
        },
        lastApplication: {
          type: Date
        },
        averageResponseTime: {
          type: Number,
          default: 0
        },
        successRate: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        }
      },
      community: {
        postsCount: {
          type: Number,
          default: 0
        },
        lastPost: {
          type: Date
        },
        likesReceived: {
          type: Number,
          default: 0
        },
        commentsReceived: {
          type: Number,
          default: 0
        }
      },
      gang: {
        connectionsCount: {
          type: Number,
          default: 0
        },
        lastConnection: {
          type: Date
        },
        averageConnectionStrength: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        },
        mutualConnectionsCount: {
          type: Number,
          default: 0
        }
      },
      messaging: {
        messagesSent: {
          type: Number,
          default: 0
        },
        lastMessage: {
          type: Date
        },
        activeConversations: {
          type: Number,
          default: 0
        },
        responseRate: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        }
      },
      wallet: {
        transactionsCount: {
          type: Number,
          default: 0
        },
        lastTransaction: {
          type: Date
        },
        totalEarned: {
          type: Number,
          default: 0
        },
        totalSpent: {
          type: Number,
          default: 0
        }
      }
    },
    networkMetrics: {
      influenceScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      reachScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      engagementScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      crossModuleActivity: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },
    preferences: {
      notificationSettings: {
        crossModuleAlerts: {
          type: Boolean,
          default: true
        },
        gangActivityAlerts: {
          type: Boolean,
          default: true
        },
        communityEngagementAlerts: {
          type: Boolean,
          default: true
        },
        jobRecommendationAlerts: {
          type: Boolean,
          default: true
        },
        unifiedActivitySummary: {
          type: Boolean,
          default: true
        }
      },
      privacySettings: {
        showCrossModuleActivity: {
          type: Boolean,
          default: true
        },
        showGangActivityToCommunity: {
          type: Boolean,
          default: true
        },
        showJobActivityToGang: {
          type: Boolean,
          default: true
        },
        showCommunityActivityToGang: {
          type: Boolean,
          default: true
        }
      },
      integrationSettings: {
        autoConnectOnJobApplication: {
          type: Boolean,
          default: false
        },
        autoShareJobToGang: {
          type: Boolean,
          default: false
        },
        autoNotifyGangOnCommunityPost: {
          type: Boolean,
          default: false
        },
        enableCrossModuleRecommendations: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
unifiedUserContextSchema.index({ userId: 1 });
unifiedUserContextSchema.index({ 'crossModuleProfile.networkMetrics.influenceScore': -1 });
unifiedUserContextSchema.index({ 'crossModuleProfile.totalEngagement': -1 });
unifiedUserContextSchema.index({ lastUpdated: -1 });

// Method to calculate network metrics
unifiedUserContextSchema.methods.calculateNetworkMetrics = function() {
  const profile = this.crossModuleProfile;
  
  // Calculate influence score based on cross-module activity
  let influenceScore = 0;
  influenceScore += profile.moduleActivity.jobs.successRate * 0.3;
  influenceScore += profile.moduleActivity.community.likesReceived * 0.2;
  influenceScore += profile.moduleActivity.gang.averageConnectionStrength * 0.3;
  influenceScore += profile.moduleActivity.messaging.responseRate * 0.2;
  
  // Calculate reach score based on network size
  let reachScore = 0;
  reachScore += Math.min(profile.moduleActivity.gang.connectionsCount * 2, 50);
  reachScore += Math.min(profile.moduleActivity.community.postsCount * 1, 30);
  reachScore += Math.min(profile.moduleActivity.messaging.activeConversations * 2, 20);
  
  // Calculate engagement score based on activity frequency
  let engagementScore = 0;
  const now = new Date();
  const daysSinceLastJob = profile.moduleActivity.jobs.lastApplication ? 
    (now.getTime() - profile.moduleActivity.jobs.lastApplication.getTime()) / (1000 * 60 * 60 * 24) : 365;
  const daysSinceLastPost = profile.moduleActivity.community.lastPost ? 
    (now.getTime() - profile.moduleActivity.community.lastPost.getTime()) / (1000 * 60 * 60 * 24) : 365;
  const daysSinceLastMessage = profile.moduleActivity.messaging.lastMessage ? 
    (now.getTime() - profile.moduleActivity.messaging.lastMessage.getTime()) / (1000 * 60 * 60 * 24) : 365;
  
  engagementScore += Math.max(0, 100 - daysSinceLastJob * 2);
  engagementScore += Math.max(0, 100 - daysSinceLastPost * 3);
  engagementScore += Math.max(0, 100 - daysSinceLastMessage * 1);
  engagementScore = Math.min(engagementScore, 100);
  
  // Calculate cross-module activity score
  let crossModuleActivity = 0;
  const moduleCount = Object.keys(profile.moduleActivity).filter(key => {
    const module = profile.moduleActivity[key];
    return module.applicationsCount > 0 || module.postsCount > 0 || 
           module.connectionsCount > 0 || module.messagesSent > 0 || 
           module.transactionsCount > 0;
  }).length;
  
  crossModuleActivity = (moduleCount / 5) * 100;
  
  this.crossModuleProfile.networkMetrics = {
    influenceScore: Math.min(influenceScore, 100),
    reachScore: Math.min(reachScore, 100),
    engagementScore: Math.min(engagementScore, 100),
    crossModuleActivity: Math.min(crossModuleActivity, 100)
  };
  
  // Calculate total engagement
  this.crossModuleProfile.totalEngagement = 
    this.crossModuleProfile.networkMetrics.influenceScore * 0.4 +
    this.crossModuleProfile.networkMetrics.reachScore * 0.3 +
    this.crossModuleProfile.networkMetrics.engagementScore * 0.3;
};

// Pre-save hook to calculate metrics
unifiedUserContextSchema.pre('save', function(next) {
  this.calculateNetworkMetrics();
  this.lastUpdated = new Date();
  next();
});

export const UnifiedUserContext = mongoose.model<IUnifiedUserContext>('UnifiedUserContext', unifiedUserContextSchema);

