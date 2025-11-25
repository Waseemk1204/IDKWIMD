import express, { Request, Response } from 'express';
import { SchedulerService } from '../services/schedulerService';
import config from '../config';

const router = express.Router();

/**
 * Vercel Cron endpoint for weekly payouts
 * Scheduled to run every Sunday at 11:59 PM UTC
 * 
 * Security: Requires CRON_SECRET in Authorization header
 */
router.post('/weekly-payouts', async (req: Request, res: Response): Promise<void> => {
    try {
        // Verify authorization token from Vercel Cron
        const authHeader = req.headers.authorization;
        const expectedAuth = `Bearer ${config.CRON_SECRET || 'default-cron-secret'}`;

        if (authHeader !== expectedAuth) {
            console.warn('⚠️ Unauthorized cron request attempt');
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        console.log('🔄 Starting weekly payout cron job...');

        const scheduler = SchedulerService.getInstance();
        const result = await scheduler.processWeeklyPayouts();

        console.log('✅ Weekly payout cron completed:', result);

        res.status(200).json({
            success: true,
            message: 'Weekly payouts processed successfully',
            data: result
        });
    } catch (error) {
        console.error('❌ Weekly payout cron failed:', error);

        res.status(500).json({
            success: false,
            message: 'Weekly payout processing failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Health check endpoint for cron service
 */
router.get('/health', (_req: Request, res: Response): void => {
    res.status(200).json({
        success: true,
        message: 'Cron service is healthy',
        timestamp: new Date().toISOString()
    });
});

export default router;
