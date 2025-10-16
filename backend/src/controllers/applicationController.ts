import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Application, { IApplication } from '../models/Application';
import Job from '../models/Job';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { EnhancedNotificationService } from '../services/EnhancedNotificationService';

// Get user's applications
export const getUserApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter: any = { applicant: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const applications = await Application.find(filter)
      .populate('job', 'title company location hourlyRate status')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalApplications: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Submit job application
export const submitApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { jobId } = req.params;
    const { coverLetter, salaryExpectation, availability, portfolio, linkedinProfile, githubProfile } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    if (job.status !== 'active') {
      res.status(400).json({
        success: false,
        message: 'Job is not accepting applications'
      });
      return;
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
      return;
    }

    // Check if job has reached max applications
    if (job.maxApplications && job.applications.length >= job.maxApplications) {
      res.status(400).json({
        success: false,
        message: 'Job has reached maximum number of applications'
      });
      return;
    }

    // Create application
    const application = new Application({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
      salaryExpectation,
      availability,
      portfolio,
      linkedinProfile,
      githubProfile
    });

    await application.save();

    // Add application to job
    await Job.findByIdAndUpdate(jobId, {
      $push: { applications: application._id }
    });

    // Populate application data
    await application.populate([
      { path: 'job', select: 'title company location hourlyRate employer' },
      { path: 'applicant', select: 'fullName email profilePhoto' }
    ]);

    // Send notification to employer about new job application
    try {
      const notificationService = EnhancedNotificationService.getInstance();
      
      // Get applicant details for the notification
      const applicant = await User.findById(req.user._id).select('fullName email profilePhoto');
      
      if (notificationService && job.employer && applicant) {
        await notificationService.createNotification({
          recipientId: job.employer,
          senderId: req.user._id,
          type: 'job_application',
          title: 'New Job Application Received',
          message: `${applicant.fullName} has applied for your "${job.title}" position.`,
          richContent: {
            image: null,
            avatar: applicant.profilePhoto || null,
            preview: `${applicant.fullName} applied for "${job.title}" at ${job.company}`,
            actionButtons: [
              { 
                label: 'View Application', 
                action: 'view_application', 
                url: `/employer/applications/${application._id}`,
                style: 'primary' as const
              },
              { 
                label: 'View All Applications', 
                action: 'view_all_applications', 
                url: `/employer/jobs/${jobId}/applications`,
                style: 'secondary' as const
              }
            ]
          },
          context: {
            module: 'jobs',
            entityId: jobId,
            entityType: 'Job',
            metadata: {
              jobTitle: job.title,
              companyName: job.company,
              applicantName: applicant.fullName,
              applicantEmail: applicant.email,
              applicationId: application._id.toString()
            }
          },
          smart: {
            priority: job.urgency === 'high' ? 'high' : 'medium',
            relevanceScore: 0.9,
            category: 'job_management',
            tags: ['urgent', 'application', job.category.toLowerCase()]
          }
        });
        
        console.log(`Job application notification sent to employer ${job.employer} for job ${jobId}`);
      }
    } catch (notificationError) {
      console.error('Failed to send job application notification:', notificationError);
      // Don't fail the application submission if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get application by ID
export const getApplicationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate({
        path: 'job',
        select: 'title company location hourlyRate employer',
        populate: {
          path: 'employer',
          select: 'name email'
        }
      })
      .populate('applicant', 'name email profileImage phone location skills experience')
      .lean();

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }

    // Check if user can view this application
    const employerId = typeof (application.job as any).employer === 'object' && (application.job as any).employer._id 
      ? (application.job as any).employer._id.toString()
      : (application.job as any).employer.toString();
    
    const canView = 
      application.applicant._id.toString() === req.user._id.toString() ||
      employerId === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canView) {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update application status (employer only)
export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, employerNotes, interviewScheduled, interviewNotes } = req.body;

    const application = await Application.findById(id)
      .populate({
        path: 'job',
        select: 'employer title',
        populate: {
          path: 'employer',
          select: 'name email'
        }
      });

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }

    // Check if user is the employer or admin
    const employerId = typeof (application.job as any).employer === 'object' && (application.job as any).employer._id 
      ? (application.job as any).employer._id.toString()
      : (application.job as any).employer.toString();
    
    if (employerId !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Only the employer can update application status.'
      });
      return;
    }

    const updateData: any = { status };
    if (employerNotes) updateData.employerNotes = employerNotes;
    if (interviewScheduled) updateData.interviewScheduled = interviewScheduled;
    if (interviewNotes) updateData.interviewNotes = interviewNotes;

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'job', select: 'title company location hourlyRate' },
      { path: 'applicant', select: 'name email profileImage' }
    ]);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application: updatedApplication }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Withdraw application
export const withdrawApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }

    // Check if user owns the application
    if (application.applicant.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only withdraw your own applications.'
      });
      return;
    }

    // Check if application can be withdrawn
    if (['accepted', 'rejected'].includes(application.status)) {
      res.status(400).json({
        success: false,
        message: 'Cannot withdraw application with current status'
      });
      return;
    }

    // Remove application from job
    await Job.findByIdAndUpdate(application.job, {
      $pull: { applications: application._id }
    });

    // Delete application
    await Application.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get applications for a job (employer only)
export const getJobApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Check if job exists and user owns it
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only view applications for your own jobs.'
      });
      return;
    }

    const filter: any = { job: jobId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const applications = await Application.find(filter)
      .populate('applicant', 'name email profileImage phone location skills experience')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalApplications: total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
