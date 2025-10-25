import express from 'express';
import { authenticate } from '../middlewares/auth';
import { submitTimesheet, getPendingTimesheets, approveTimesheet, getEmployeeTimesheets } from '../controllers/timesheetController';

const router = express.Router();

router.post('/submit', authenticate, submitTimesheet);
router.get('/pending', authenticate, getPendingTimesheets);
router.post('/approve/:timesheetId', authenticate, approveTimesheet);
router.get('/employee', authenticate, getEmployeeTimesheets);

export default router;