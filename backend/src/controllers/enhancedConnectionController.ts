import { Request, Response } from 'express';
import { Connection, IConnection } from '../models/Connection';
import { Follow, IFollow } from '../models/Follow';
import { ConnectionAnalytics, IConnectionAnalytics } from '../models/ConnectionAnalytics';
import { ConnectionRecommendation, IConnectionRecommendation } from '../models/ConnectionRecommendation';
import { IUser } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';
import User from '../models/User';

// Enhanced connection controller with analytics and recommendations

// Get connection recommendations for a user
export const getConnectionRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { limit = 10, page = 1 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get active recommendations
    const recommendations = await ConnectionRecommendation.find({
      userId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    })
    .populate('recommendedUserId', 'fullName username email profilePhoto headline skills location companyInfo')
    .sort({ score: -1 })
    .skip(skip)
    .limit(limitNum);

    // If no recommendations exist, generate them
    if (recommendations.length === 0) {
      await generateConnectionRecommendations(userId);
      const newRecommendations = await ConnectionRecommendation.find({
        userId,
        status: 'active',
        expiresAt: { $gt: new Date() }
      })
      .populate('recommendedUserId', 'fullName username email profilePhoto headline skills location companyInfo')
      .sort({ score: -1 })
      .skip(skip)
      .limit(limitNum);

      return res.json({
        success: true,
        data: {
          recommendations: newRecommendations,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(newRecommendations.length / limitNum),
            hasNext: skip + limitNum < newRecommendations.length,
            hasPrev: pageNum > 1
          }
        }
      });
    }

    return res.json({
      success: true,
      data: {
        recommendations,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(recommendations.length / limitNum),
          hasNext: skip + limitNum < recommendations.length,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting connection recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get connection recommendations'
    });
  }
};

// Generate connection recommendations for a user
const generateConnectionRecommendations = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'employee') return;

    // Get user's existing connections
    const existingConnections = await Connection.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });

    const connectedUserIds = existingConnections.map(conn => 
      conn.requester.toString() === userId ? conn.recipient.toString() : conn.requester.toString()
    );

    // Get user's pending requests
    const pendingRequests = await Connection.find({
      $or: [
        { requester: userId, status: 'pending' },
        { recipient: userId, status: 'pending' }
      ]
    });

    const pendingUserIds = pendingRequests.map(conn => 
      conn.requester.toString() === userId ? conn.recipient.toString() : conn.requester.toString()
    );

    // Get dismissed recommendations
    const dismissedRecommendations = await ConnectionRecommendation.find({
      userId,
      status: 'dismissed'
    });

    const dismissedUserIds = dismissedRecommendations.map(rec => rec.recommendedUserId.toString());

    // Find potential connections (employees not already connected/pending/dismissed)
    const potentialConnections = await User.find({
      _id: { 
        $nin: [...connectedUserIds, ...pendingUserIds, ...dismissedUserIds, userId].map(id => new mongoose.Types.ObjectId(id))
      },
      role: 'employee',
      isActive: true
    }).select('fullName username email profilePhoto headline skills location companyInfo experiences education');

    // Generate recommendations for each potential connection
    const recommendations = [];
    
    for (const potentialUser of potentialConnections) {
      const reasons = [];
      let score = 0;

      // Check for mutual connections
      const mutualConnections = await getMutualConnections(userId, potentialUser._id.toString());
      if (mutualConnections.length > 0) {
        reasons.push({
          type: 'mutual_connections',
          weight: Math.min(30, mutualConnections.length * 5),
          details: `${mutualConnections.length} mutual connection${mutualConnections.length > 1 ? 's' : ''}`
        });
        score += Math.min(30, mutualConnections.length * 5);
      }

      // Check for shared skills
      const sharedSkills = user.skills.filter(skill => 
        potentialUser.skills.some(potentialSkill => 
          potentialSkill.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(potentialSkill.toLowerCase())
        )
      );
      if (sharedSkills.length > 0) {
        reasons.push({
          type: 'shared_skills',
          weight: Math.min(25, sharedSkills.length * 5),
          details: `${sharedSkills.length} shared skill${sharedSkills.length > 1 ? 's' : ''}: ${sharedSkills.slice(0, 3).join(', ')}`
        });
        score += Math.min(25, sharedSkills.length * 5);
      }

      // Check for same location
      if (user.location && potentialUser.location && 
          user.location.toLowerCase() === potentialUser.location.toLowerCase()) {
        reasons.push({
          type: 'same_location',
          weight: 15,
          details: `Both located in ${user.location}`
        });
        score += 15;
      }

      // Check for same company (current or past)
      const userCompanies = [
        ...user.experiences.map(exp => exp.company.toLowerCase()),
        ...(user.companyInfo?.companyName ? [user.companyInfo.companyName.toLowerCase()] : [])
      ];
      const potentialCompanies = [
        ...potentialUser.experiences.map(exp => exp.company.toLowerCase()),
        ...(potentialUser.companyInfo?.companyName ? [potentialUser.companyInfo.companyName.toLowerCase()] : [])
      ];
      
      const sharedCompanies = userCompanies.filter(company => 
        potentialCompanies.some(potentialCompany => 
          company.includes(potentialCompany) || potentialCompany.includes(company)
        )
      );
      
      if (sharedCompanies.length > 0) {
        reasons.push({
          type: 'same_company',
          weight: 20,
          details: `Shared company experience: ${sharedCompanies[0]}`
        });
        score += 20;
      }

      // Check for similar experience level
      const userExperienceYears = calculateExperienceYears(user.experiences);
      const potentialExperienceYears = calculateExperienceYears(potentialUser.experiences);
      const experienceDiff = Math.abs(userExperienceYears - potentialExperienceYears);
      
      if (experienceDiff <= 2) {
        reasons.push({
          type: 'similar_experience',
          weight: 10,
          details: `Similar experience level (${userExperienceYears} vs ${potentialExperienceYears} years)`
        });
        score += 10;
      }

      // Only create recommendation if score is above threshold
      if (score >= 20 && reasons.length > 0) {
        recommendations.push({
          userId: new mongoose.Types.ObjectId(userId),
          recommendedUserId: potentialUser._id,
          reasons,
          score: Math.min(100, score),
          algorithmVersion: '1.0',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'active'
        });
      }
    }

    // Sort by score and limit to top 50
    recommendations.sort((a, b) => b.score - a.score);
    const topRecommendations = recommendations.slice(0, 50);

    // Bulk insert recommendations
    if (topRecommendations.length > 0) {
      await ConnectionRecommendation.insertMany(topRecommendations);
    }

  } catch (error) {
    console.error('Error generating connection recommendations:', error);
  }
};

// Get mutual connections between two users
const getMutualConnections = async (userId1: string, userId2: string) => {
  try {
    // Get connections for user1
    const user1Connections = await Connection.find({
      $or: [
        { requester: userId1, status: 'accepted' },
        { recipient: userId1, status: 'accepted' }
      ]
    });

    const user1ConnectedIds = user1Connections.map(conn => 
      conn.requester.toString() === userId1 ? conn.recipient.toString() : conn.requester.toString()
    );

    // Get connections for user2
    const user2Connections = await Connection.find({
      $or: [
        { requester: userId2, status: 'accepted' },
        { recipient: userId2, status: 'accepted' }
      ]
    });

    const user2ConnectedIds = user2Connections.map(conn => 
      conn.requester.toString() === userId2 ? conn.recipient.toString() : conn.requester.toString()
    );

    // Find mutual connections
    const mutualIds = user1ConnectedIds.filter(id => user2ConnectedIds.includes(id));

    // Get user details for mutual connections
    const mutualConnections = await User.find({
      _id: { $in: mutualIds }
    }).select('fullName username profilePhoto');

    return mutualConnections;
  } catch (error) {
    console.error('Error getting mutual connections:', error);
    return [];
  }
};

// Calculate years of experience from experiences array
const calculateExperienceYears = (experiences: any[]) => {
  let totalMonths = 0;
  
  experiences.forEach(exp => {
    const startDate = new Date(exp.from);
    const endDate = exp.current ? new Date() : new Date(exp.to);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                  (endDate.getMonth() - startDate.getMonth());
    totalMonths += months;
  });
  
  return Math.round(totalMonths / 12);
};

// Dismiss a connection recommendation
export const dismissRecommendation = async (req: AuthRequest, res: Response) => {
  try {
    const { recommendationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const recommendation = await ConnectionRecommendation.findOne({
      _id: recommendationId,
      userId
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    await recommendation.dismiss();

    return res.json({
      success: true,
      message: 'Recommendation dismissed'
    });
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to dismiss recommendation'
    });
  }
};

// Get connection analytics for a user
export const getConnectionAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user's connections
    const connections = await Connection.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    });

    const connectionIds = connections.map(conn => conn._id);

    // Get analytics for connections
    const analytics = await ConnectionAnalytics.find({
      connectionId: { $in: connectionIds }
    }).populate('connectionId');

    // Calculate summary statistics
    const totalConnections = connections.length;
    const strongConnections = analytics.filter(a => a.strength >= 80).length;
    const totalMessages = analytics.reduce((sum, a) => sum + a.messageCount, 0);
    const avgStrength = analytics.length > 0 ? 
      analytics.reduce((sum, a) => sum + a.strength, 0) / analytics.length : 0;

    // Get connection growth over time
    const connectionGrowth = await Connection.aggregate([
      {
        $match: {
          $or: [
            { requester: new mongoose.Types.ObjectId(userId), status: 'accepted' },
            { recipient: new mongoose.Types.ObjectId(userId), status: 'accepted' }
          ]
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    return res.json({
      success: true,
      data: {
        summary: {
          totalConnections,
          strongConnections,
          totalMessages,
          avgStrength: Math.round(avgStrength)
        },
        connectionGrowth,
        analytics: analytics.map(a => ({
          connectionId: a.connectionId,
          strength: a.strength,
          strengthCategory: a.strengthCategory,
          messageCount: a.messageCount,
          lastInteraction: a.lastInteraction,
          mutualConnections: a.mutualConnections,
          sharedJobApplications: a.sharedJobApplications
        }))
      }
    });
  } catch (error) {
    console.error('Error getting connection analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get connection analytics'
    });
  }
};

// Get mutual connections for a specific user
export const getMutualConnectionsWithUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const mutualConnections = await getMutualConnections(currentUserId, targetUserId);

    return res.json({
      success: true,
      data: {
        mutualConnections,
        count: mutualConnections.length
      }
    });
  } catch (error) {
    console.error('Error getting mutual connections:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get mutual connections'
    });
  }
};

// Bulk connection actions
export const bulkConnectionActions = async (req: AuthRequest, res: Response) => {
  try {
    const { action, userIds } = req.body;
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        let response;
        
        switch (action) {
          case 'connect':
            response = await sendConnectionRequest({
              body: { recipientId: userId },
              user: { _id: currentUserId }
            } as any, {} as Response);
            break;
          case 'follow':
            response = await followEmployer({
              body: { employerId: userId },
              user: { _id: currentUserId }
            } as any, {} as Response);
            break;
          default:
            errors.push({ userId, error: 'Invalid action' });
            continue;
        }

        if (response?.success) {
          results.push({ userId, success: true });
        } else {
          errors.push({ userId, error: response?.message || 'Action failed' });
        }
      } catch (error) {
        errors.push({ userId, error: 'Action failed' });
      }
    }

    return res.json({
      success: true,
      data: {
        results,
        errors,
        summary: {
          total: userIds.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
  } catch (error) {
    console.error('Error performing bulk connection actions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform bulk actions'
    });
  }
};

// Re-export existing functions
export {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  removeConnection,
  getUserConnections,
  getPendingRequests,
  followEmployer,
  unfollowEmployer,
  getUserFollows,
  getConnectionStatus,
  getAvailableEmployees
} from './connectionController';

