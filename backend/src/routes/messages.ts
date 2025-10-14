import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
// import {
//   getConversations,
//   createConversation,
//   getMessages,
//   sendMessage,
//   markMessagesAsRead,
//   deleteConversation,
//   getUnreadCount,
//   editMessage,
//   deleteMessage,
//   getConversationParticipants,
//   addReaction,
//   createThread,
//   searchMessages
// } from '../controllers/enhancedMessageController';
import {
  validateCreateMessage,
  validateEditMessage,
  validatePagination
} from '../utils/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Conversation routes
// router.get('/conversations', validatePagination, getConversations as any);
// router.post('/conversations', createConversation as any);
// router.delete('/conversations/:conversationId', deleteConversation as any);

// Message routes
// router.get('/conversations/:conversationId/messages', validatePagination, getMessages as any);
// router.post('/conversations/:conversationId/messages', validateCreateMessage, sendMessage as any);
// router.put('/conversations/:conversationId/read', markMessagesAsRead as any);
// router.put('/messages/:messageId', validateEditMessage, editMessage as any);
// router.delete('/messages/:messageId', deleteMessage as any);

// Enhanced features
// router.post('/messages/:messageId/reactions', addReaction as any);
// router.post('/conversations/:conversationId/threads', createThread as any);
// router.get('/search', searchMessages as any);

// Conversation routes
// router.get('/conversations/:conversationId/participants', getConversationParticipants as any);

// Utility routes
// router.get('/unread-count', getUnreadCount as any);

export default router;
