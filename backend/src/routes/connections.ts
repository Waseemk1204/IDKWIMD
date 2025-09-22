import express, { RequestHandler } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import {
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
} from '../controllers/connectionController';
import { body, param, query } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Connection routes (Employee to Employee)
router.post('/request', [
  body('recipientId')
    .isMongoId()
    .withMessage('Valid recipient ID is required')
], sendConnectionRequest as any);

router.post('/accept/:connectionId', [
  param('connectionId')
    .isMongoId()
    .withMessage('Valid connection ID is required')
], acceptConnectionRequest as RequestHandler);

router.post('/reject/:connectionId', [
  param('connectionId')
    .isMongoId()
    .withMessage('Valid connection ID is required')
], rejectConnectionRequest as RequestHandler);

router.post('/cancel/:connectionId', [
  param('connectionId')
    .isMongoId()
    .withMessage('Valid connection ID is required')
], cancelConnectionRequest as RequestHandler);

router.delete('/:connectionId', [
  param('connectionId')
    .isMongoId()
    .withMessage('Valid connection ID is required')
], removeConnection as RequestHandler);

// Follow routes (Employee to Employer)
router.post('/follow', [
  body('employerId')
    .isMongoId()
    .withMessage('Valid employer ID is required')
], followEmployer as RequestHandler);

router.delete('/follow/:followId', [
  param('followId')
    .isMongoId()
    .withMessage('Valid follow ID is required')
], unfollowEmployer as RequestHandler);

// Get routes
router.get('/my-connections', [
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'rejected', 'cancelled'])
    .withMessage('Status must be pending, accepted, rejected, or cancelled')
], getUserConnections as RequestHandler);

router.get('/pending-requests', [
  query('type')
    .optional()
    .isIn(['sent', 'received'])
    .withMessage('Type must be sent or received')
], getPendingRequests as RequestHandler);

router.get('/my-follows', getUserFollows as RequestHandler);

router.get('/status/:userId', [
  param('userId')
    .isMongoId()
    .withMessage('Valid user ID is required')
], getConnectionStatus as RequestHandler);

router.get('/discover', [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], getAvailableEmployees as RequestHandler);

export default router;
