import express from 'express';
import { authenticate } from '../middlewares/auth';
import { submitTimesheet, getPendingTimesheets, approveTimesheet, getEmployeeTimesheets } from '../controllers/timesheetController';

const router = express.Router();

router.post('/submit', authenticate, submitTimesheet as any);
router.get('/pending', authenticate, getPendingTimesheets as any);
router.post('/approve/:timesheetId', authenticate, approveTimesheet as any);
router.get('/employee', authenticate, getEmployeeTimesheets as any);

export default router;