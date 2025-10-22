import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Verification } from '../models/Verification';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// Get user's verification requests
export const getUserVerifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const verifications = await Verification.find({ userId: req.user._id })
      .populate('verifiedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { verifications }
    });
  } catch (error) {
    console.error('Get user verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create verification request
export const createVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { type, documents, additionalData } = req.body;

    // Check if user already has a pending verification of this type
    const existingVerification = await Verification.findOne({
      userId: req.user._id,
      type,
      status: 'pending'
    });

    if (existingVerification) {
      res.status(400).json({
        success: false,
        message: `You already have a pending ${type} verification request`
      });
      return;
    }

    const verification = new Verification({
      userId: req.user._id,
      type,
      documents,
      additionalData
    });

    await verification.save();

    // Populate user data
    await verification.populate('userId', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully',
      data: { verification }
    });
  } catch (error) {
    console.error('Create verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get verification by ID
export const getVerificationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const verification = await Verification.findById(id)
      .populate('userId', 'fullName email profilePhoto')
      .populate('verifiedBy', 'fullName email');

    if (!verification) {
      res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
      return;
    }

    // Check if user can access this verification
    if (verification.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    res.json({
      success: true,
      data: { verification }
    });
  } catch (error) {
    console.error('Get verification by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update verification (admin only)
export const updateVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const { status, rejectionReason, notes } = req.body;

    const verification = await Verification.findById(id);
    if (!verification) {
      res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
      return;
    }

    // Update verification
    verification.status = status;
    verification.verifiedBy = req.user._id as any;
    verification.verifiedAt = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      verification.rejectionReason = rejectionReason;
    }
    
    if (notes) {
      verification.notes = notes;
    }

    await verification.save();

    // Update user verification status if approved
    if (status === 'approved') {
      const user = await User.findById(verification.userId);
      if (user) {
        user.isVerified = true;
        user.verificationStatus = 'verified';
        user.verifiedAt = new Date();
        await user.save();
      }
    }

    // Populate data
    await verification.populate('userId', 'fullName email');
    await verification.populate('verifiedBy', 'fullName email');

    res.json({
      success: true,
      message: 'Verification updated successfully',
      data: { verification }
    });
  } catch (error) {
    console.error('Update verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all verifications (admin only)
export const getAllVerifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
      return;
    }

    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const verifications = await Verification.find(filter)
      .populate('userId', 'fullName email profilePhoto')
      .populate('verifiedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Verification.countDocuments(filter);

    res.json({
      success: true,
      data: {
        verifications,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete verification request
export const deleteVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const verification = await Verification.findById(id);
    if (!verification) {
      res.status(404).json({
        success: false,
        message: 'Verification not found'
      });
      return;
    }

    // Check if user can delete this verification
    if (verification.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }

    // Only allow deletion of pending verifications
    if (verification.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Only pending verification requests can be deleted'
      });
      return;
    }

    await Verification.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Verification request deleted successfully'
    });
  } catch (error) {
    console.error('Delete verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get verification statistics (admin only)
export const getVerificationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
      return;
    }

    const stats = await Verification.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Verification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentVerifications = await Verification.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        typeStats,
        recentVerifications
      }
    });
  } catch (error) {
    console.error('Get verification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
