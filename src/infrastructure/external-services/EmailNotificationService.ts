import { INotificationService } from '../../application/services/interfaces';
import { Property } from '@/domain/property/entities/Property';

/**
 * Email notification service implementation
 */
export class EmailNotificationService implements INotificationService {

    /**
     * Send notification when a property is created
     */
    async notifyPropertyCreated(_property: Property): Promise<void> {
        try {
            // In a real implementation, you would:
            // 1. Get admin/agent email addresses
            // 2. Format email template with property details
            // 3. Send email using service like Resend, SendGrid, etc.

            // Note: In production, would send actual property creation notification

            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 200));

            // Note: Property creation notification sent successfully
        } catch (_error) {
            // Note: Failed to send property creation notification - would be logged in production
            throw new Error('Notification service unavailable');
        }
    }

    /**
     * Send notification when a property is updated
     */
    async notifyPropertyUpdated(_property: Property, _changes: string[]): Promise<void> {
        try {
            // Note: In production, would send actual property update notification

            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 200));

            // Note: Property update notification sent successfully
        } catch (_error) {
            // Note: Failed to send property update notification - would be logged in production
            throw new Error('Notification service unavailable');
        }
    }

    /**
     * Send notification when a user registers
     */
    async notifyUserRegistered(_userEmail: string, _userName: string): Promise<void> {
        try {
            // Note: In production, would send actual user registration notification

            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 200));

            // Note: User registration notification sent successfully
        } catch (_error) {
            // Note: Failed to send user registration notification - would be logged in production
            throw new Error('Notification service unavailable');
        }
    }
}