import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Contract from '../models/Contract';
import Application from '../models/Application';
import Job from '../models/Job';
import User from '../models/User';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { generateContractTemplate } from '../utils/contractTemplate';
import { EnhancedNotificationService } from '../services/EnhancedNotificationService';

// Helper function to parse duration string to weeks
const parseDurationToWeeks = (duration: string): number => {
  const match = duration.match(/(\d+)\s*(week|month|day)/i);
  if (!match) return 12; // Default to 12 weeks
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  if (unit.includes('day')) return Math.ceil(value / 7);
  if (unit.includes('week')) return value;
  if (unit.includes('month')) return value * 4;
  
  return 12;
};

// Create contract when application is accepted
export const createContractFromApplication = async (
  applicationId: string,
  employerId: string
): Promise<{ success: boolean; message: string; contract?: any; error?: string }> => {
  try {
    // Get application with job details
    const application = await Application.findById(applicationId)
      .populate('job')
      .populate('applicant');
    
    if (!application) {
      return { success: false, message: 'Application not found' };
    }
    
    const job: any = application.job;
    const employee: any = application.applicant;
    
    // Verify employer is the job owner
    if (job.employer.toString() !== employerId.toString()) {
      return { success: false, message: 'Unauthorized' };
    }
    
    // Check if contract already exists
    const existingContract = await Contract.findOne({ 
      job: job._id, 
      employee: employee._id 
    });
    
    if (existingContract) {
      return { success: false, message: 'Contract already exists for this job and employee' };
    }
    
    // Parse hours per week
    const hoursPerWeek = parseInt(job.hoursPerWeek) || 20;
    const durationWeeks = parseDurationToWeeks(job.duration);
    
    // Calculate costs
    const hourlyRate = job.hourlyRate;
    const weeklyPayment = hourlyRate * hoursPerWeek;
    const totalEstimatedCost = weeklyPayment * durationWeeks;
    
    // Check employer wallet balance
    const employerWallet = await Wallet.findOne({ userId: employerId, isActive: true });
    if (!employerWallet) {
      return { success: false, message: 'Employer wallet not found' };
    }
    
    if (employerWallet.balance < totalEstimatedCost) {
      return { 
        success: false, 
        message: `Insufficient funds. Need ₹${totalEstimatedCost.toLocaleString()} but only have ₹${employerWallet.balance.toLocaleString()}` 
      };
    }
    
    // Lock funds in employer wallet
    employerWallet.balance -= totalEstimatedCost;
    await employerWallet.save();
    
    // Create lock transaction
    const lockTransaction = new Transaction({
      userId: employerId,
      walletId: employerWallet._id,
      type: 'debit',
      amount: totalEstimatedCost,
      currency: 'INR',
      status: 'completed',
      description: `Funds locked for job: ${job.title}`,
      relatedJobId: job._id,
      relatedApplicationId: application._id,
      metadata: {
        transactionType: 'job_fund_lock',
        lockReason: 'contract_creation'
      }
    });
    await lockTransaction.save();
    
    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (durationWeeks * 7));
    
    // Create contract
    const contract = new Contract({
      job: job._id,
      employer: employerId,
      employee: employee._id,
      application: application._id,
      hourlyRate,
      hoursPerWeek,
      duration: job.duration,
      totalEstimatedCost,
      weeklyPayment,
      lockedAmount: totalEstimatedCost,
      paidAmount: 0,
      remainingAmount: totalEstimatedCost,
      status: 'active',
      startDate,
      endDate
    });
    
    await contract.save();
    
    // Generate contract template
    const contractTemplate = generateContractTemplate({
      jobTitle: job.title,
      companyName: job.company,
      employeeName: employee.fullName,
      hourlyRate,
      hoursPerWeek,
      duration: job.duration,
      startDate,
      endDate,
      location: job.location,
      isRemote: job.isRemote,
      jobDescription: job.description,
      responsibilities: job.responsibilities || [],
      requirements: job.requirements || []
    });
    
    // Store contract template in contract metadata (optional - can be stored separately)
    // For now, the template can be generated on-demand when viewing contract details
    
    // Update application status
    application.status = 'accepted';
    await application.save();
    
    // Update job status to closed (or handle multiple hires differently)
    job.status = 'closed';
    await job.save();
    
    // Auto-add experience to employee profile
    await addExperienceToProfile(employee._id, contract._id, job);
    
    // Send notification to employee about contract creation
    try {
      const notificationService = EnhancedNotificationService.getInstance();
      if (notificationService && employee._id) {
        await notificationService.createNotification({
          recipient: employee._id as any,
          sender: employerId as any,
          type: 'system',
          title: 'New Contract Created',
          message: `A contract has been created for your position as "${job.title}" at ${job.company}.`,
          richContent: {
            image: undefined,
            avatar: undefined,
            preview: `Contract created for "${job.title}" at ${job.company}`,
            actionButtons: [
              { 
                label: 'View Contract', 
                action: 'view_contract', 
                url: `/employee/contracts/${contract._id}`,
                style: 'primary' as const
              }
            ]
          },
          context: {
            module: 'jobs',
            relatedEntity: {
              type: 'application',
              id: contract._id as any,
              title: job.title,
              url: `/employee/contracts/${contract._id}`
            }
          }
        });
      }
    } catch (notificationError) {
      console.error('Failed to send contract creation notification:', notificationError);
      // Don't fail contract creation if notification fails
    }
    
    return {
      success: true,
      message: 'Contract created successfully',
      contract: {
        ...contract.toObject(),
        contractTemplate // Include template in response
      }
    };
  } catch (error: any) {
    console.error('Create contract error:', error);
    return {
      success: false,
      message: 'Failed to create contract',
      error: error.message
    };
  }
};

// Auto-add experience to employee profile
const addExperienceToProfile = async (userId: string, contractId: string, job: any): Promise<void> => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    // Initialize experiences array if it doesn't exist
    if (!Array.isArray(user.experiences)) {
      user.experiences = [];
    }
    
    // Add new experience
    const newExperience = {
      company: job.company,
      title: job.title,
      description: job.description,
      from: new Date(),
      to: undefined,
      current: true
    };
    
    user.experiences.push(newExperience as any);
    await user.save();
    
    // Mark as added in contract
    await Contract.findByIdAndUpdate(contractId, {
      experienceAddedToProfile: true
    });
    
    console.log(`✅ Experience auto-added to profile for user ${userId}`);
  } catch (error) {
    console.error('Error adding experience to profile:', error);
  }
};

// Get contracts for user (employer or employee)
export const getUserContracts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { status } = req.query;
    
    const query: any = status ? { status } : {};
    
    if (userRole === 'employer') {
      query.employer = userId;
    } else {
      query.employee = userId;
    }
    
    const contracts = await Contract.find(query)
      .populate('job', 'title company location')
      .populate('employer', 'fullName email')
      .populate('employee', 'fullName email profilePhoto')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: { contracts }
    });
  } catch (error) {
    console.error('Get user contracts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contracts'
    });
  }
};

// Get contract by ID
export const getContractById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const contract = await Contract.findById(id)
      .populate('job')
      .populate('employer', 'fullName email phone')
      .populate('employee', 'fullName email phone profilePhoto')
      .populate('application')
      .lean();
    
    if (!contract) {
      res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
      return;
    }
    
    // Verify user is part of this contract
    if (
      contract.employer.toString() !== userId.toString() &&
      contract.employee.toString() !== userId.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }
    
    res.json({
      success: true,
      data: { contract }
    });
  } catch (error) {
    console.error('Get contract by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contract'
    });
  }
};

// Complete contract and unlock remaining funds
export const completeContract = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const contract = await Contract.findById(id)
      .populate('job', 'title')
      .populate('employee', 'fullName experiences');
    
    if (!contract) {
      res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
      return;
    }
    
    // Verify user is employer
    if (contract.employer.toString() !== userId.toString()) {
      res.status(403).json({
        success: false,
        message: 'Only employer can complete contract'
      });
      return;
    }
    
    if (contract.status !== 'active') {
      res.status(400).json({
        success: false,
        message: 'Contract is not active'
      });
      return;
    }
    
    // Unlock remaining funds
    const remainingAmount = contract.remainingAmount;
    
    if (remainingAmount > 0) {
      const employerWallet = await Wallet.findOne({ userId: contract.employer, isActive: true });
      if (employerWallet) {
        employerWallet.balance += remainingAmount;
        await employerWallet.save();
        
        // Create unlock transaction
        const unlockTransaction = new Transaction({
          userId: contract.employer,
          walletId: employerWallet._id,
          type: 'credit',
          amount: remainingAmount,
          currency: 'INR',
          status: 'completed',
          description: `Unlocked remaining funds from contract: ${(contract.job as any).title}`,
          relatedJobId: contract.job,
          metadata: {
            transactionType: 'job_fund_unlock',
            contractId: contract._id
          }
        });
        await unlockTransaction.save();
      }
    }
    
    // Update contract status
    contract.status = 'completed';
    contract.actualEndDate = new Date();
    await contract.save();
    
    // Update employee experience to mark as completed
    const employee: any = contract.employee;
    if (employee && Array.isArray(employee.experiences)) {
      const experienceIndex = employee.experiences.findIndex((exp: any) => 
        exp.company === (contract.job as any).company &&
        exp.title === (contract.job as any).title &&
        exp.current === true
      );
      
      if (experienceIndex !== -1) {
        employee.experiences[experienceIndex].current = false;
        employee.experiences[experienceIndex].to = new Date();
        await employee.save();
      }
    }
    
    res.json({
      success: true,
      message: 'Contract completed successfully',
      data: { 
        contract,
        unlockedAmount: remainingAmount
      }
    });
  } catch (error) {
    console.error('Complete contract error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete contract'
    });
  }
};

export { parseDurationToWeeks };

