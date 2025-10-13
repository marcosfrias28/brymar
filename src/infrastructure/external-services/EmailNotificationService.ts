import { INotificationService } from '../../application/services/interfaces';
import { Property } from '@/domain/property/entities/Property';

/**
 * Email notification service implementation
 */
export class EmailNotificationService implements INotificationService {

    /**
     * Send notification when a property is created
     */
    async notifyPropertyCreated(property: Property): Promise<void> {
        try {
            // In a real implementation, you would:
            // 1. Get admin/agent email addresses
            // 2. Format email template with property details
            // 3. Send email using service like Resend, SendGrid, etc.

            console.log(`Sending property creation notification for: ${property.getTitle().value}`);

            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 200));

            console.log(`Property creation notification sent successfully`);
        } catch (error) {
            console.error('Failed to send property creation notification:', error);
            throw new Error('Notification service unavailable');
        }
    }

    /**
     * Send notification when a property is updated
     */
    async notifyPropertyUpdated(property: Property, changes: string[]): Promise<void> {
        try {
            console.log(`Sending property update notification for: ${property.getTitle().value}`);
            console.log(`Changes: ${changes.join(', ')}`);

            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 200));

            console.log(`Property update notification sent successfully`);
        } catch (error) {
            console.error('Failed to send property update notification:', error);
            throw new Error('Notification service unavailable');
        }
    }

    /**
     * Send notification when a user registers
     */
    async notifyUserRegistered(userEmail: string, userName: string): Promise<void> {
        try {
            console.log(`Sending user registration notification for: ${userName} (${userEmail})`);

            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 200));

            console.log(`User registration notification sent successfully`);
        } catch (error) {
            console.error('Failed to send user registration notification:', error);
            throw new Error('Notification service unavailable');
        }
    }
}