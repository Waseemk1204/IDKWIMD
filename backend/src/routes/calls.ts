import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import {
  getCallHistory,
  getCallDetails,
  createMeetingRoom,
  startCall,
  endCall,
  joinCall,
  leaveCall,
  getActiveCalls
} from '../controllers/callController';
import {
  validatePagination
} from '../utils/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Call history routes
router.get('/history', validatePagination, getCallHistory as any);
router.get('/history/:callId', getCallDetails as any);

// Call management routes
router.post('/meeting-room', createMeetingRoom as any);
router.post('/:callId/start', startCall as any);
router.post('/:callId/end', endCall as any);
router.post('/:callId/join', joinCall as any);
router.post('/:callId/leave', leaveCall as any);

// Active calls
router.get('/active', getActiveCalls as any);

export default router;
