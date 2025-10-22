import { Server as SocketIOServer } from 'socket.io';
import { EnhancedNotification, IEnhancedNotification } from '../models/EnhancedNotification';
import { NotificationPreferences } from '../models/NotificationPreferences';
import User from '../models/User';
import Job from '../models/Job';
import { CommunityPost } from '../models/CommunityPost';
import Message from '../models/Message';
import { Connection } from '../models/Connection';
import mongoose from 'mongoose';

export interface CreateNotificationData {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: IEnhancedNotification['type'];
  title: string;
  message: string;
  richContent?: IEnhancedNotification['richContent'];
  context?: IEnhancedNotification['context'];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  channels?: Array<'push' | 'email' | 'sms' | 'inApp'>;
  expiresAt?: Date;
  autoDeleteAt?: Date;
}

export interface NotificationDeliveryResult {
  success: boolean;
  channels: {
    push?: { success: boolean; error?: string };
    email?: { success: boolean; error?: string };
    sms?: { success: boolean; error?: string };
    inApp?: { success: boolean; error?: string };
  };
}

export class EnhancedNotificationService {
  private io: SocketIOServer;
  private static instance: EnhancedNotificationService;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  static getInstance(io?: SocketIOServer): EnhancedNotificationService {
    if (!EnhancedNotificationService.instance) {
      if (!io) {
        throw new Error('SocketIO server required for first initialization');
      }
      EnhancedNotificationService.instance = new EnhancedNotificationService(io);
    }
    return EnhancedNotificationService.instance;
  }

  /**
   * Create and send a notification with smart features
   */
  async createNotification(data: CreateNotificationData): Promise<IEnhancedNotification> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(data.recipient);
      
      // Calculate relevance score
      const relevanceScore = await this.calculateRelevanceScore(data);
      
      // Determine priority
      const priority = data.priority || this.determinePriority(data.type, relevanceScore);
      
      // Get delivery channels based on preferences
      const channels = data.channels || this.getPreferredChannels(data.type, preferences);
      
      // Generate rich content
      const richContent = await this.generateRichContent(data);
      
      // Create notification
      const notification = new EnhancedNotification({
        recipient: data.recipient,
        sender: data.sender,
        type: data.type,
        title: data.title,
        message: data.message,
        richContent,
        context: data.context,
        delivery: {
          channels,
          status: this.initializeDeliveryStatus(channels)
        },
        smart: {
          priority,
          relevanceScore,
          aiGenerated: false
        },
        expiresAt: data.expiresAt,
        autoDeleteAt: data.autoDeleteAt
      });

      await notification.save();

      // Send notification through all channels
      await this.deliverNotification(notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Deliver notification through all configured channels
   */
  private async deliverNotification(notification: IEnhancedNotification): Promise<NotificationDeliveryResult> {
    const result: NotificationDeliveryResult = {
      success: true,
      channels: {}
    };

    for (const channel of notification.delivery.channels) {
      try {
        switch (channel) {
          case 'inApp':
            await this.deliverInApp(notification);
            result.channels.inApp = { success: true };
            break;
          case 'push':
            await this.deliverPush(notification);
            result.channels.push = { success: true };
            break;
          case 'email':
            await this.deliverEmail(notification);
            result.channels.email = { success: true };
            break;
          case 'sms':
            await this.deliverSMS(notification);
            result.channels.sms = { success: true };
            break;
        }
      } catch (error) {
        console.error(`Failed to deliver ${channel} notification:`, error);
        result.channels[channel] = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        result.success = false;
      }
    }

    // Update delivery status
    await this.updateDeliveryStatus(notification, result);

    return result;
  }

  /**
   * Deliver in-app notification via Socket.IO
   */
  private async deliverInApp(notification: IEnhancedNotification): Promise<void> {
    this.io.to(`user_${notification.recipient}`).emit('notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      richContent: notification.richContent,
      context: notification.context,
      priority: notification.smart.priority,
      relevanceScore: notification.smart.relevanceScore,
      timestamp: notification.createdAt,
      timeAgo: notification.timeAgo
    });
  }

  /**
   * Deliver push notification
   */
  private async deliverPush(notification: IEnhancedNotification): Promise<void> {
    // Get user's push subscription
    const user = await User.findById(notification.recipient).select('pushSubscriptions');
    
    if (!user?.pushSubscriptions?.length) {
      console.warn(`Push notification skipped: No push subscriptions found for user ${notification.recipient}`);
      return; // Gracefully skip push if no subscriptions
    }

    // Send push notification to all user's devices
    for (const subscription of user.pushSubscriptions) {
      try {
        await this.sendPushToDevice(subscription, notification);
      } catch (error) {
        console.error('Failed to send push to device:', error);
      }
    }
  }

  /**
   * Send push notification to specific device
   */
  private async sendPushToDevice(subscription: any, notification: IEnhancedNotification): Promise<void> {
    // This would integrate with Firebase Cloud Messaging or similar service
    // For now, we'll simulate the push notification
    console.log(`Sending push notification to device: ${subscription.endpoint}`);
    
    // In a real implementation, you would:
    // 1. Use web-push library or Firebase Admin SDK
    // 2. Send the notification payload
    // 3. Handle delivery receipts
  }

  /**
   * Deliver email notification
   */
  private async deliverEmail(notification: IEnhancedNotification): Promise<void> {
    const user = await User.findById(notification.recipient).select('email fullName');
    
    if (!user?.email) {
      console.warn(`Email notification skipped: No email found for user ${notification.recipient}`);
      return; // Gracefully skip email if no email address
    }

    // Generate email content
    const emailContent = this.generateEmailContent(notification, user);
    
    // Send email (integrate with your email service)
    console.log(`Sending email to ${user.email}: ${notification.title}`);
    
    // In a real implementation, you would:
    // 1. Use nodemailer, SendGrid, or similar
    // 2. Send HTML email with rich content
    // 3. Track email delivery status
  }

  /**
   * Deliver SMS notification
   */
  private async deliverSMS(notification: IEnhancedNotification): Promise<void> {
    const user = await User.findById(notification.recipient).select('phoneNumber phone');
    
    // Try both phoneNumber and phone fields
    const phoneNumber = user?.phoneNumber || user?.phone;
    
    if (!phoneNumber) {
      console.warn(`SMS notification skipped: No phone number found for user ${notification.recipient}`);
      return; // Gracefully skip SMS if no phone number
    }

    // Send SMS (integrate with Twilio, AWS SNS, or similar)
    console.log(`Sending SMS to ${phoneNumber}: ${notification.message}`);
    
    // In a real implementation, you would:
    // 1. Use Twilio, AWS SNS, or similar service
    // 2. Send SMS with notification content
    // 3. Track SMS delivery status
  }

  /**
   * Get user notification preferences
   */
  private async getUserPreferences(userId: mongoose.Types.ObjectId): Promise<any> {
    let preferences = await NotificationPreferences.findOne({ userId });
    
    if (!preferences) {
      // Create default preferences
      preferences = new NotificationPreferences({ userId });
      await preferences.save();
    }
    
    return preferences;
  }

  /**
   * Calculate relevance score for notification
   */
  private async calculateRelevanceScore(data: CreateNotificationData): Promise<number> {
    let score = 50; // Base score

    // Increase score based on user interaction history
    if (data.sender) {
      const connection = await Connection.findOne({
        $or: [
          { requester: data.recipient, recipient: data.sender },
          { requester: data.sender, recipient: data.recipient }
        ],
        status: 'accepted'
      });

      if (connection) {
        score += 20; // Connected users get higher relevance
      }
    }

    // Increase score for high-priority notification types
    const highPriorityTypes = ['payment_received', 'job_approved', 'connection_request'];
    if (highPriorityTypes.includes(data.type)) {
      score += 30;
    }

    // Increase score for recent activity
    const recentActivity = await EnhancedNotification.countDocuments({
      recipient: data.recipient,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recentActivity < 10) {
      score += 10; // Less notification fatigue = higher relevance
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine notification priority
   */
  private determinePriority(type: string, relevanceScore: number): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentTypes = ['payment_received', 'verification_rejected'];
    const highTypes = ['job_approved', 'connection_request', 'new_message'];
    const mediumTypes = ['job_application', 'community_mention', 'connection_accepted'];

    if (urgentTypes.includes(type)) return 'urgent';
    if (highTypes.includes(type)) return 'high';
    if (mediumTypes.includes(type)) return 'medium';
    if (relevanceScore > 80) return 'high';
    if (relevanceScore > 60) return 'medium';
    return 'low';
  }

  /**
   * Get preferred delivery channels based on user preferences
   */
  private getPreferredChannels(type: string, preferences: any): Array<'push' | 'email' | 'sms' | 'inApp'> {
    const channels: Array<'push' | 'email' | 'sms' | 'inApp'> = ['inApp']; // Always include in-app

    // Get channels from preferences based on notification type
    const typePreferences = preferences.types[type];
    if (typePreferences?.enabled) {
      channels.push(...typePreferences.channels);
    }

    // Add global channel preferences
    if (preferences.channels.push) channels.push('push');
    if (preferences.channels.email) channels.push('email');
    if (preferences.channels.sms) channels.push('sms');

    return [...new Set(channels)]; // Remove duplicates
  }

  /**
   * Generate rich content for notification
   */
  private async generateRichContent(data: CreateNotificationData): Promise<IEnhancedNotification['richContent']> {
    const richContent: IEnhancedNotification['richContent'] = {};

    // Add avatar for sender
    if (data.sender) {
      const sender = await User.findById(data.sender).select('profilePhoto fullName');
      if (sender) {
        richContent.avatar = sender.profilePhoto;
        richContent.metadata = {
          ...richContent.metadata,
          senderName: sender.fullName
        };
      }
    }

    // Add context-specific content
    if (data.context?.relatedEntity) {
      const { type, id } = data.context.relatedEntity;
      
      switch (type) {
        case 'job':
          const job = await Job.findById(id).select('title company');
          if (job) {
            richContent.metadata = {
              ...richContent.metadata,
              jobTitle: job.title,
              companyName: job.company
            };
          }
          break;
        case 'post':
          const post = await CommunityPost.findById(id).select('title');
          if (post) {
            richContent.metadata = {
              ...richContent.metadata,
              postTitle: post.title
            };
          }
          break;
      }
    }

    // Add action buttons based on notification type
    richContent.actionButtons = this.generateActionButtons(data.type, data.context);

    return richContent;
  }

  /**
   * Generate action buttons for notification
   */
  private generateActionButtons(type: string, context?: any): Array<{label: string; action: string; url?: string; style?: 'primary' | 'secondary' | 'danger'}> {
    const buttons = [];

    switch (type) {
      case 'connection_request':
        buttons.push(
          { label: 'Accept', action: 'accept_connection', style: 'primary' as const },
          { label: 'Decline', action: 'decline_connection', style: 'secondary' as const }
        );
        break;
      case 'job_application':
        buttons.push(
          { label: 'Review', action: 'view_application', url: '/employer/jobs' },
          { label: 'Message', action: 'start_conversation', style: 'secondary' as const }
        );
        break;
      case 'job_approved':
        buttons.push(
          { label: 'View Job', action: 'view_job', url: '/employee/jobs' },
          { label: 'Start Work', action: 'start_work', style: 'primary' as const }
        );
        break;
      case 'payment_received':
        buttons.push(
          { label: 'View Details', action: 'view_payment', url: '/employee/wallet' },
          { label: 'Withdraw', action: 'withdraw_funds', style: 'primary' as const }
        );
        break;
      case 'new_message':
        buttons.push(
          { label: 'Reply', action: 'reply_message', url: '/messaging' },
          { label: 'View Chat', action: 'view_chat', style: 'secondary' as const }
        );
        break;
    }

    return buttons;
  }

  /**
   * Initialize delivery status for channels
   */
  private initializeDeliveryStatus(channels: string[]): any {
    const status: any = {};
    channels.forEach(channel => {
      status[channel] = 'pending';
    });
    return status;
  }

  /**
   * Update delivery status based on results
   */
  private async updateDeliveryStatus(notification: IEnhancedNotification, result: NotificationDeliveryResult): Promise<void> {
    const updateData: any = {
      'delivery.sentAt': new Date()
    };

    // Update status for each channel
    Object.entries(result.channels).forEach(([channel, channelResult]) => {
      if (channelResult) {
        updateData[`delivery.status.${channel}`] = channelResult.success ? 'delivered' : 'failed';
        
        if (!channelResult.success) {
          updateData['delivery.failedAt'] = new Date();
          updateData['delivery.failureReason'] = channelResult.error;
        }
      }
    });

    await EnhancedNotification.findByIdAndUpdate(notification._id, updateData);
  }

  /**
   * Generate email content
   */
  private generateEmailContent(notification: IEnhancedNotification, user: any): string {
    return `
      <html>
        <body>
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          ${notification.richContent?.actionButtons?.map(button => 
            `<a href="${button.url || '#'}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">${button.label}</a>`
          ).join('') || ''}
        </body>
      </html>
    `;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: mongoose.Types.ObjectId): Promise<void> {
    await EnhancedNotification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { 
        'interaction.isRead': true,
        'interaction.readAt': new Date()
      }
    );
  }

  /**
   * Track notification interaction
   */
  async trackInteraction(notificationId: string, userId: mongoose.Types.ObjectId, action: string): Promise<void> {
    await EnhancedNotification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { 
        'interaction.clickedAt': new Date(),
        'interaction.actionTaken': action
      }
    );
  }

  /**
   * Get user notifications with smart grouping
   */
  async getUserNotifications(
    userId: mongoose.Types.ObjectId,
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      type?: string;
      priority?: string;
    } = {}
  ): Promise<{
    notifications: IEnhancedNotification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  }> {
    const { page = 1, limit = 20, unreadOnly = false, type, priority } = options;
    
    const query: any = { recipient: userId };
    
    if (unreadOnly) {
      query['interaction.isRead'] = false;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query['smart.priority'] = priority;
    }

    const notifications = await EnhancedNotification.find(query)
      .populate('sender', 'fullName profilePhoto')
      .sort({ 'smart.priority': -1, 'smart.relevanceScore': -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await EnhancedNotification.countDocuments(query);
    const unreadCount = await EnhancedNotification.countDocuments({
      recipient: userId,
      'interaction.isRead': false
    });

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  }

  /**
   * Create digest notification
   */
  async createDigestNotification(userId: mongoose.Types.ObjectId): Promise<void> {
    const preferences = await this.getUserPreferences(userId);
    
    if (!preferences.timing.digest.enabled) {
      return;
    }

    // Get unread notifications from the last period
    const period = preferences.timing.digest.frequency === 'daily' ? 24 : 
                  preferences.timing.digest.frequency === 'weekly' ? 168 : 720; // hours
    
    const unreadNotifications = await EnhancedNotification.find({
      recipient: userId,
      'interaction.isRead': false,
      createdAt: { $gte: new Date(Date.now() - period * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    if (unreadNotifications.length === 0) {
      return;
    }

    // Create digest notification
    const digestId = `digest_${userId}_${Date.now()}`;
    
    await this.createNotification({
      recipient: userId,
      type: 'unified_activity_summary',
      title: `Your ${preferences.timing.digest.frequency} digest`,
      message: `You have ${unreadNotifications.length} unread notifications`,
      richContent: {
        metadata: {
          notificationCount: unreadNotifications.length,
          period: preferences.timing.digest.frequency
        }
      },
      context: {
        module: 'profile'
      },
      priority: 'medium'
    });

    // Mark original notifications as grouped
    await EnhancedNotification.updateMany(
      { _id: { $in: unreadNotifications.map(n => n._id) } },
      { 'smart.digestId': digestId }
    );
  }
}
