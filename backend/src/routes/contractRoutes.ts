import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getUserContracts,
  getContractById,
  completeContract
} from '../controllers/contractController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's contracts (employer or employee)
router.get('/', getUserContracts);

// Get contract by ID
router.get('/:id', getContractById);

// Complete contract (employer only)
router.post('/:id/complete', completeContract);

export default router;

