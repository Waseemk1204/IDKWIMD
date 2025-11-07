import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import {
  getChannels,
  createChannel,
  getChannel,
  updateChannel,
  addMember,
  removeMember,
  updateMemberRole,
  archiveChannel,
  getChannelMessages
} from '../controllers/channelController';
import {
  validatePagination
} from '../utils/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Channel routes
router.get('/', validatePagination, getChannels as any);
router.post('/', createChannel as any);
router.get('/:channelId', getChannel as any);
router.put('/:channelId', updateChannel as any);
router.post('/:channelId/members', addMember as any);
router.delete('/:channelId/members/:userId', removeMember as any);
router.put('/:channelId/members/:userId/role', updateMemberRole as any);
router.put('/:channelId/archive', archiveChannel as any);

// Channel messages
router.get('/:channelId/messages', validatePagination, getChannelMessages as any);

export default router;
