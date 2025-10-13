import { Property } from '@/domain/property/entities/Property';

/**
 * Interface for notification services
 */
export interface INotificationService {
    /**
     * Send notification when a property is created
     */
    notifyPropertyCreated(property: Property): Promise<void>;

    /**
     * Send notification when a property is updated
     */
    notifyPropertyUpdated(property: Property, changes: string[]): Promise<void>;

    /**
     * Send notification when a user registers
     */
    notifyUserRegistered(userEmail: string, userName: string): Promise<void>;
}