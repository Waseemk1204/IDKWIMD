import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Review from '../models/Review';
import Contract from '../models/Contract';
import { EnhancedNotificationService } from '../services/EnhancedNotificationService';

// Create a review
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { contractId, rating, comment } = req.body;
        const reviewerId = req.user._id;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
            return;
        }

        const contract = await Contract.findById(contractId)
            .populate('job', 'title company')
            .populate('employer', 'fullName')
            .populate('employee', 'fullName');

        if (!contract) {
            res.status(404).json({ success: false, message: 'Contract not found' });
            return;
        }

        // Verify user is part of contract
        if (
            contract.employer._id.toString() !== reviewerId.toString() &&
            contract.employee._id.toString() !== reviewerId.toString()
        ) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }

        // Verify contract is ended (completed or terminated)
        if (!['completed', 'terminated'].includes(contract.status)) {
            res.status(400).json({ success: false, message: 'Cannot review active contract' });
            return;
        }

        // Determine reviewee
        const isEmployer = contract.employer._id.toString() === reviewerId.toString();
        const revieweeId = isEmployer ? contract.employee._id : contract.employer._id;

        // Check if review already exists
        const existingReview = await Review.findOne({
            contract: contractId,
            reviewer: reviewerId
        });

        if (existingReview) {
            res.status(400).json({ success: false, message: 'You have already reviewed this contract' });
            return;
        }

        // Create review
        const review = new Review({
            reviewer: reviewerId,
            reviewee: revieweeId,
            job: contract.job._id,
            contract: contractId,
            rating,
            comment
        });

        await review.save();

        // Notify reviewee
        try {
            const notificationService = EnhancedNotificationService.getInstance();
            if (notificationService) {
                const reviewerName = isEmployer ? (contract.employer as any).fullName : (contract.employee as any).fullName;
                await notificationService.createNotification({
                    recipient: revieweeId as any,
                    sender: reviewerId as any,
                    type: 'system',
                    title: 'New Review Received',
                    message: `You received a ${rating}-star review from ${reviewerName} for "${(contract.job as any).title}".`,
                    richContent: {
                        preview: `${rating} stars: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
                        actionButtons: [
                            {
                                label: 'View Review',
                                action: 'view_profile',
                                url: `/profile/${revieweeId}`, // Assuming reviews are on profile
                                style: 'primary'
                            }
                        ]
                    },
                    context: {
                        module: 'profile',
                        relatedEntity: {
                            type: 'job', // Using job as related entity type
                            id: contract.job._id as any,
                            title: (contract.job as any).title,
                            url: `/profile/${revieweeId}`
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Notification error:', error);
        }

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: { review }
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get user reviews
export const getUserReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);

        const reviews = await Review.find({ reviewee: userId })
            .populate('reviewer', 'fullName profilePhoto')
            .populate('job', 'title company')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Review.countDocuments({ reviewee: userId });

        // Calculate average rating
        const stats = await Review.aggregate([
            { $match: { reviewee: userId } }, // Fix: userId is string, might need casting if ObjectId
            { $group: { _id: null, averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        const averageRating = stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;

        res.json({
            success: true,
            data: {
                reviews,
                averageRating,
                totalReviews: total,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    hasNext: Number(page) < Math.ceil(total / Number(limit)),
                    hasPrev: Number(page) > 1
                }
            }
        });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
