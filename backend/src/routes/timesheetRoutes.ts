import express from 'express';
import { auth } from '../middlewares/auth';
import { submitTimesheet, getPendingTimesheets, approveTimesheet, getEmployeeTimesheets } from '../controllers/timesheetController';

const router = express.Router();

router.post('/submit', auth, submitTimesheet);
router.get('/pending', auth, getPendingTimesheets);
router.post('/approve/:timesheetId', auth, approveTimesheet);
router.get('/employee', auth, getEmployeeTimesheets);

export default router;