import { Notification, INotification } from '../models/Notification';
import { Server as SocketIOServer } from 'socket.io';

export interface CreateNotificationData {
  recipient: string;
  sender?: string;
  type: INotification['type'];
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
}

export class NotificationService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Create and send a notification
   */
  async createNotification(data: CreateNotificationData): Promise<INotification> {
    const notification = new Notification({
      recipient: data.recipient,
      sender: data.sender,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      priority: data.priority || 'medium',
      expiresAt: data.expiresAt
    });

    await notification.save();

    // Populate sender data for real-time notification
    await notification.populate('sender', 'fullName profilePhoto');

    // Send real-time notification
    this.sendRealTimeNotification(notification);

    return notification;
  }

  /**
   * Send real-time notification via Socket.IO
   */
  private sendRealTimeNotification(notification: INotification): void {
    this.io.to(`user_${notification.recipient}`).emit('new_notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      sender: notification.sender,
      createdAt: notification.createdAt
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return false;
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return true;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return result.modifiedCount;
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const skip = (page - 1) * limit;
    const filter: any = { recipient: userId };
    
    if (unreadOnly) {
      filter.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('sender', 'fullName profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: userId, isRead: false })
    ]);

    return { notifications, total, unreadCount };
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await Notification.deleteOne({
      _id: notificationId,
      recipient: userId
    });

    return result.deletedCount > 0;
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<number> {
    const result = await Notification.deleteMany({ recipient: userId });
    return result.deletedCount;
  }

  /**
   * Get notification statistics for a user
   */
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const [total, unread, byType, byPriority] = await Promise.all([
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
      Notification.aggregate([
        { $match: { recipient: userId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Notification.aggregate([
        { $match: { recipient: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    return {
      total,
      unread,
      byType: byType.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
    };
  }

  /**
   * Create system notification
   */
  async createSystemNotification(
    recipientId: string,
    title: string,
    message: string,
    data?: any,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<INotification> {
    return this.createNotification({
      recipient: recipientId,
      type: 'system',
      title,
      message,
      data,
      priority
    });
  }

  /**
   * Create connection request notification
   */
  async createConnectionRequestNotification(
    recipientId: string,
    senderId: string,
    senderName: string
  ): Promise<INotification> {
    return this.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${senderName} wants to connect with you`,
      data: { senderId, senderName }
    });
  }

  /**
   * Create connection accepted notification
   */
  async createConnectionAcceptedNotification(
    recipientId: string,
    senderId: string,
    senderName: string
  ): Promise<INotification> {
    return this.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `${senderName} accepted your connection request`,
      data: { senderId, senderName }
    });
  }

  /**
   * Create job application notification
   */
  async createJobApplicationNotification(
    employerId: string,
    applicantId: string,
    applicantName: string,
    jobTitle: string,
    jobId: string,
    applicationId: string
  ): Promise<INotification> {
    return this.createNotification({
      recipient: employerId,
      sender: applicantId,
      type: 'job_application',
      title: 'New Job Application',
      message: `${applicantName} applied for "${jobTitle}"`,
      data: { jobId, applicationId, applicantId, applicantName, jobTitle }
    });
  }

  /**
   * Create job status notification
   */
  async createJobStatusNotification(
    applicantId: string,
    employerId: string,
    employerName: string,
    jobTitle: string,
    jobId: string,
    applicationId: string,
    status: 'approved' | 'rejected'
  ): Promise<INotification> {
    const type = status === 'approved' ? 'job_approved' : 'job_rejected';
    const title = status === 'approved' ? 'Job Application Approved' : 'Job Application Rejected';
    const message = status === 'approved' 
      ? `Congratulations! Your application for "${jobTitle}" has been approved`
      : `Your application for "${jobTitle}" was not selected`;

    return this.createNotification({
      recipient: applicantId,
      sender: employerId,
      type,
      title,
      message,
      data: { jobId, applicationId, employerId, employerName, jobTitle, status }
    });
  }

  /**
   * Create message notification
   */
  async createMessageNotification(
    recipientId: string,
    senderId: string,
    senderName: string,
    messagePreview: string,
    conversationId: string
  ): Promise<INotification> {
    return this.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'message',
      title: `New message from ${senderName}`,
      message: messagePreview,
      data: { conversationId, senderId, senderName },
      priority: 'medium'
    });
  }

  /**
   * Create verification notification
   */
  async createVerificationNotification(
    userId: string,
    type: 'approved' | 'rejected',
    verificationType: string,
    reason?: string
  ): Promise<INotification> {
    const notificationType = type === 'approved' ? 'verification_approved' : 'verification_rejected';
    const title = type === 'approved' ? 'Verification Approved' : 'Verification Rejected';
    const message = type === 'approved' 
      ? `Your ${verificationType} verification has been approved`
      : `Your ${verificationType} verification was rejected${reason ? `: ${reason}` : ''}`;

    return this.createNotification({
      recipient: userId,
      type: notificationType,
      title,
      message,
      data: { verificationType, reason },
      priority: 'high'
    });
  }

  /**
   * Create payment notification
   */
  async createPaymentNotification(
    recipientId: string,
    senderId: string,
    senderName: string,
    amount: number,
    type: 'received' | 'sent',
    transactionId: string,
    description?: string
  ): Promise<INotification> {
    const notificationType = type === 'received' ? 'payment_received' : 'payment_sent';
    const title = type === 'received' ? 'Payment Received' : 'Payment Sent';
    const message = type === 'received'
      ? `You received ₹${amount} from ${senderName}${description ? ` - ${description}` : ''}`
      : `You sent ₹${amount} to ${senderName}${description ? ` - ${description}` : ''}`;

    return this.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: notificationType,
      title,
      message,
      data: { amount, transactionId, description, senderName },
      priority: 'high'
    });
  }

  /**
   * Create community interaction notification
   */
  async createCommunityNotification(
    recipientId: string,
    senderId: string,
    senderName: string,
    type: 'like' | 'comment' | 'mention',
    postId: string,
    postTitle: string,
    commentContent?: string
  ): Promise<INotification> {
    const notificationType = type === 'like' ? 'community_like' : 
                           type === 'comment' ? 'community_comment' : 'community_mention';
    
    let title: string;
    let message: string;

    switch (type) {
      case 'like':
        title = 'Post Liked';
        message = `${senderName} liked your post "${postTitle}"`;
        break;
      case 'comment':
        title = 'New Comment';
        message = `${senderName} commented on your post "${postTitle}"`;
        break;
      case 'mention':
        title = 'You were mentioned';
        message = `${senderName} mentioned you in a comment`;
        break;
    }

    return this.createNotification({
      recipient: recipientId,
      sender: senderId,
      type: notificationType,
      title,
      message,
      data: { postId, postTitle, commentContent, senderName },
      priority: 'low'
    });
  }
}

// Export singleton instance
let notificationServiceInstance: NotificationService | null = null;

export const getNotificationService = (io?: SocketIOServer): NotificationService => {
  if (!notificationServiceInstance && io) {
    notificationServiceInstance = new NotificationService(io);
  }
  return notificationServiceInstance!;
};
