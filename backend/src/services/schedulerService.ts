import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { EnhancedNotificationService } from './EnhancedNotificationService';

export class SchedulerService {
    private static instance: SchedulerService;

    private constructor() { }

    public static getInstance(): SchedulerService {
        if (!SchedulerService.instance) {
            SchedulerService.instance = new SchedulerService();
        }
        return SchedulerService.instance;
    }

    // Process weekly payouts (transfer from Wallet to Bank)
    public async processWeeklyPayouts(): Promise<{ success: boolean; message: string; processedCount: number }> {
        try {
            console.log('Starting weekly payout process...');

            // Find all active wallets with positive balance
            const wallets = await Wallet.find({
                isActive: true,
                balance: { $gt: 0 }
            }).populate('userId', 'fullName email bankDetails');

            let processedCount = 0;

            for (const wallet of wallets) {
                const user: any = wallet.userId;

                // Skip if no bank details (in a real app)
                // For now, we assume we can process it or just skip
                if (!user) continue;

                const amount = wallet.balance;

                // Create withdrawal transaction
                const transaction = new Transaction({
                    userId: user._id,
                    walletId: wallet._id,
                    type: 'withdrawal',
                    amount: amount,
                    currency: wallet.currency,
                    status: 'completed', // Auto-complete for demo
                    description: `Weekly auto-payout to bank`,
                    metadata: {
                        payoutType: 'weekly_auto',
                        processedAt: new Date()
                    }
                });

                await transaction.save();

                // Reset wallet balance
                wallet.balance = 0;
                await wallet.save();

                processedCount++;

                // Notify user
                try {
                    const notificationService = EnhancedNotificationService.getInstance();
                    if (notificationService) {
                        await notificationService.createNotification({
                            recipient: user._id,
                            sender: undefined, // System notification
                            type: 'payment_sent',
                            title: 'Weekly Payout Processed',
                            message: `Your weekly payout of ₹${amount.toLocaleString()} has been processed to your bank account.`,
                            richContent: {
                                preview: `₹${amount.toLocaleString()} transferred to bank`,
                                actionButtons: [
                                    {
                                        label: 'View Wallet',
                                        action: 'view_wallet',
                                        url: '/employee/wallet',
                                        style: 'primary'
                                    }
                                ]
                            },
                            context: {
                                module: 'wallet',
                                relatedEntity: {
                                    type: 'transaction',
                                    id: transaction._id as any,
                                    title: 'Weekly Payout',
                                    url: '/employee/wallet'
                                }
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Failed to notify user ${user._id} about payout:`, error);
                }
            }

            console.log(`Weekly payout completed. Processed ${processedCount} wallets.`);
            return { success: true, message: 'Weekly payouts processed successfully', processedCount };
        } catch (error: any) {
            console.error('Weekly payout error:', error);
            return { success: false, message: error.message || 'Failed to process payouts', processedCount: 0 };
        }
    }
}
