import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getUserContracts,
  getContractById,
  completeContract,
  terminateContract
} from '../controllers/contractController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's contracts (employer or employee)
router.get('/', getUserContracts as any);

// Get contract by ID
router.get('/:id', getContractById as any);

// Complete contract (employer only)
router.post('/:id/complete', completeContract as any);

// Terminate contract (Employer or Employee)
router.post('/:id/terminate', terminateContract as any);

export default router;

