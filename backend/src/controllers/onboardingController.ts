import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import OnboardingDraft, { IOnboardingDraft } from '../models/OnboardingDraft';
import User from '../models/User';

/**
 * Save onboarding progress
 * POST /api/onboarding/save
 */
export const saveOnboardingProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { role, currentStep, data } = req.body;

    if (!role || !['employee', 'employer'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "employee" or "employer"'
      });
      return;
    }

    // Clean data: remove undefined values and empty nested objects
    console.log('📥 Raw data received:', JSON.stringify(data, null, 2));
    const cleanData = data ? JSON.parse(JSON.stringify(data, (key, value) => {
      // Filter out undefined, null, and "undefined" string
      if (value === undefined || value === null || value === "undefined") {
        return undefined;
      }
      return value;
    })) : {};
    console.log('✨ Cleaned data:', JSON.stringify(cleanData, null, 2));

    // Find existing draft or create new one
    let draft = await OnboardingDraft.findOne({ userId, role });

    if (draft) {
      // Update existing draft
      draft.currentStep = currentStep !== undefined ? currentStep : draft.currentStep;
      
      // Clean the EXISTING draft.data as well (to remove old "undefined" strings)
      const existingCleanData = draft.data ? JSON.parse(JSON.stringify(draft.data, (key, value) => {
        if (value === undefined || value === null || value === "undefined") {
          return undefined;
        }
        return value;
      })) : {};
      
      // Now merge cleaned existing data with new cleaned data
      draft.data = { ...existingCleanData, ...cleanData };
      await draft.save(); // Pre-save hook will update completion percentage
    } else {
      // Create new draft
      draft = new OnboardingDraft({
        userId,
        role,
        currentStep: currentStep || 0,
        data: cleanData
      });
      await draft.save();
    }

    res.json({
      success: true,
      message: 'Onboarding progress saved successfully',
      data: {
        draft: {
          id: draft._id,
          role: draft.role,
          currentStep: draft.currentStep,
          completionPercentage: draft.completionPercentage,
          lastSavedAt: draft.lastSavedAt
        }
      }
    });
  } catch (error) {
    console.error('Save onboarding progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Load onboarding progress
 * GET /api/onboarding/load/:role
 */
export const loadOnboardingProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { role } = req.params;

    if (!role || !['employee', 'employer'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "employee" or "employer"'
      });
      return;
    }

    const draft = await OnboardingDraft.findOne({ userId, role });

    if (!draft) {
      res.json({
        success: true,
        message: 'No saved progress found',
        data: {
          draft: null
        }
      });
      return;
    }

    res.json({
      success: true,
      message: 'Onboarding progress loaded successfully',
      data: {
        draft: {
          id: draft._id,
          role: draft.role,
          currentStep: draft.currentStep,
          data: draft.data,
          completionPercentage: draft.completionPercentage,
          isCompleted: draft.isCompleted,
          lastSavedAt: draft.lastSavedAt,
          createdAt: draft.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Load onboarding progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Complete onboarding and update user profile
 * POST /api/onboarding/complete
 */
export const completeOnboarding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { role, data } = req.body;

    if (!role || !['employee', 'employer'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "employee" or "employer"'
      });
      return;
    }

    // Validate required fields based on role
    if (role === 'employee') {
      if (!data.fullName || !data.email || !data.phone) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: fullName, email, phone'
        });
        return;
      }
      if (!data.skills || data.skills.length < 3) {
        res.status(400).json({
          success: false,
          message: 'At least 3 skills are required'
        });
        return;
      }
      if (!data.experiences || data.experiences.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one work experience is required'
        });
        return;
      }
      if (!data.education || data.education.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one education entry is required'
        });
        return;
      }
    } else {
      // Employer validation
      if (!data.companyInfo?.companyName || !data.companyInfo?.companySize || 
          !data.companyInfo?.industry || !data.companyInfo?.headquarters || 
          !data.companyInfo?.description) {
        res.status(400).json({
          success: false,
          message: 'Missing required company information'
        });
        return;
      }
      if (!data.hiringNeeds?.roles || data.hiringNeeds.roles.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one hiring role is required'
        });
        return;
      }
    }

    // Update user profile
    const updateData: any = {};

    if (role === 'employee') {
      updateData.fullName = data.fullName;
      updateData.email = data.email;
      updateData.phone = data.phone;
      updateData.headline = data.headline;
      updateData.location = data.location;
      updateData.about = data.about;
      updateData.profilePhoto = data.profilePhoto;
      updateData.skills = data.skills;
      updateData.experiences = data.experiences;
      updateData.education = data.education;
      updateData.jobPreferences = data.jobPreferences;
    } else {
      updateData.fullName = data.companyInfo.companyName; // Use company name as full name for employers
      updateData.companyInfo = data.companyInfo;
      updateData.hiringPreferences = data.hiringNeeds; // Store hiring needs as preferences
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Mark draft as completed
    await OnboardingDraft.findOneAndUpdate(
      { userId, role },
      { 
        $set: { 
          isCompleted: true,
          completionPercentage: 100,
          data 
        } 
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete onboarding draft
 * DELETE /api/onboarding/draft/:role
 */
export const deleteOnboardingDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { role } = req.params;

    if (!role || !['employee', 'employer'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "employee" or "employer"'
      });
      return;
    }

    await OnboardingDraft.findOneAndDelete({ userId, role });

    res.json({
      success: true,
      message: 'Onboarding draft deleted successfully'
    });
  } catch (error) {
    console.error('Delete onboarding draft error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get onboarding status
 * GET /api/onboarding/status
 */
export const getOnboardingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('role fullName email phone skills experiences education companyInfo');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const role = user.role === 'employer' ? 'employer' : 'employee';
    const draft = await OnboardingDraft.findOne({ userId, role });

    // Check if profile is complete based on role
    let isProfileComplete = false;
    
    if (role === 'employee') {
      isProfileComplete = !!(
        user.fullName &&
        user.email &&
        user.phone &&
        user.skills && user.skills.length >= 3 &&
        user.experiences && user.experiences.length > 0 &&
        user.education && user.education.length > 0
      );
    } else {
      isProfileComplete = !!(
        user.companyInfo?.companyName &&
        user.companyInfo?.companySize &&
        user.companyInfo?.industry &&
        user.companyInfo?.headquarters &&
        user.companyInfo?.description
      );
    }

    res.json({
      success: true,
      data: {
        isProfileComplete,
        hasDraft: !!draft,
        draft: draft ? {
          currentStep: draft.currentStep,
          completionPercentage: draft.completionPercentage,
          lastSavedAt: draft.lastSavedAt
        } : null
      }
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  saveOnboardingProgress,
  loadOnboardingProgress,
  completeOnboarding,
  deleteOnboardingDraft,
  getOnboardingStatus
};

