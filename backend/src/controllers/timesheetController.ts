import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Timesheet from '../models/Timesheet';
import Job from '../models/Job';
import Contract from '../models/Contract';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';

export const submitTimesheet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }
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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }
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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }
    const { timesheetId } = req.params;
    const employerId = req.user._id;
    
    const timesheet = await Timesheet.findById(timesheetId).populate('jobId');
    if (!timesheet) { 
      res.status(404).json({ success: false, message: 'Timesheet not found' }); 
      return; 
    }
    
    const job: any = timesheet.jobId;
    if (job.employer.toString() !== employerId.toString()) { 
      res.status(403).json({ success: false, message: 'Not authorized' }); 
      return; 
    }
    
    if (timesheet.status === 'approved') {
      res.status(400).json({ success: false, message: 'Timesheet already approved' });
      return;
    }
    
    // Find the related contract
    const contract = await Contract.findOne({ 
      job: job._id, 
      employee: timesheet.freelancerId,
      status: 'active'
    });
    
    if (!contract) {
      res.status(404).json({ success: false, message: 'Active contract not found' });
      return;
    }
    
    // Calculate payment amount
    const paymentAmount = timesheet.hoursWorked * contract.hourlyRate;
    
    // Check if contract has enough remaining funds
    if (contract.remainingAmount < paymentAmount) {
      res.status(400).json({ 
        success: false, 
        message: `Insufficient locked funds. Need ₹${paymentAmount} but only ₹${contract.remainingAmount} remaining` 
      });
      return;
    }
    
    // Get employee wallet
    let employeeWallet = await Wallet.findOne({ userId: timesheet.freelancerId, isActive: true });
    if (!employeeWallet) {
      employeeWallet = new Wallet({
        userId: timesheet.freelancerId,
        balance: 0,
        currency: 'INR'
      });
      await employeeWallet.save();
    }
    
    // Transfer payment from locked funds to employee
    employeeWallet.balance += paymentAmount;
    await employeeWallet.save();
    
    // Update contract
    contract.paidAmount += paymentAmount;
    contract.remainingAmount -= paymentAmount;
    contract.approvedTimesheets += 1;
    contract.totalHoursWorked += timesheet.hoursWorked;
    await contract.save();
    
    // Create payment transaction for employee
    const paymentTransaction = new Transaction({
      userId: timesheet.freelancerId,
      walletId: employeeWallet._id,
      type: 'credit',
      amount: paymentAmount,
      currency: 'INR',
      status: 'completed',
      description: `Payment for ${timesheet.hoursWorked} hours - Week ${timesheet.weekNumber}`,
      relatedJobId: job._id,
      metadata: {
        transactionType: 'timesheet_payment',
        timesheetId: timesheet._id,
        contractId: contract._id,
        hoursWorked: timesheet.hoursWorked,
        hourlyRate: contract.hourlyRate
      }
    });
    await paymentTransaction.save();
    
    // Mark timesheet as approved
    timesheet.status = 'approved';
    timesheet.approvedAt = new Date();
    timesheet.paidAmount = paymentAmount;
    await timesheet.save();
    
    res.json({ 
      success: true, 
      message: `Timesheet approved and ₹${paymentAmount.toLocaleString()} paid to employee`, 
      data: { 
        timesheet,
        paymentAmount,
        contract: {
          paidAmount: contract.paidAmount,
          remainingAmount: contract.remainingAmount
        }
      } 
    });
  } catch (error: any) {
    console.error('Approve timesheet error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to approve timesheet' });
  }
};

export const getEmployeeTimesheets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }
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