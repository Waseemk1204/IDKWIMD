import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Timesheet from '../models/Timesheet';
import Job from '../models/Job';
import blockchainService from '../services/blockchainService';

export const submitTimesheet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId, weekNumber, hoursWorked, description } = req.body;
    const freelancerId = req.user._id;
    const job = await Job.findById(jobId);
    if (!job) { res.status(404).json({ success: false, message: 'Job not found' }); return; }
    const timesheet = new Timesheet({ jobId, freelancerId, weekNumber, date: new Date(), hoursWorked, description, status: 'pending' });
    await timesheet.save();
    res.status(201).json({ success: true, data: { timesheet } });
  } catch (error: any) {
    console.error('Submit timesheet error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit timesheet' });
  }
};

export const getPendingTimesheets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employerId = req.user._id;
    const jobs = await Job.find({ employer: employerId });
    const jobIds = jobs.map(j => j._id);
    const timesheets = await Timesheet.find({ jobId: { $in: jobIds }, status: 'pending' })
      .populate('jobId', 'title paymentMethod weeklyUSDCAmount')
      .populate('freelancerId', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { timesheets } });
  } catch (error: any) {
    console.error('Get pending timesheets error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get timesheets' });
  }
};

export const approveTimesheet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { timesheetId } = req.params;
    const employerId = req.user._id;
    const timesheet = await Timesheet.findById(timesheetId).populate('jobId');
    if (!timesheet) { res.status(404).json({ success: false, message: 'Timesheet not found' }); return; }
    const job: any = timesheet.jobId;
    if (job.employer.toString() !== employerId.toString()) { res.status(403).json({ success: false, message: 'Not authorized' }); return; }
    if (job.paymentMethod === 'crypto') {
      const txHash = await blockchainService.approveTimesheetOnChain(job._id.toString(), timesheet.weekNumber);
      timesheet.blockchainTxHash = txHash;
      timesheet.paidAmount = job.weeklyUSDCAmount;
    }
    timesheet.status = 'approved';
    await timesheet.save();
    res.json({ success: true, message: 'Timesheet approved', data: { timesheet } });
  } catch (error: any) {
    console.error('Approve timesheet error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to approve timesheet' });
  }
};

export const getEmployeeTimesheets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const freelancerId = req.user._id;
    const timesheets = await Timesheet.find({ freelancerId })
      .populate('jobId', 'title company paymentMethod')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { timesheets } });
  } catch (error: any) {
    console.error('Get employee timesheets error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get timesheets' });
  }
};