import { INotificationService } from "@/application/services/interfaces/INotificationService";
import { Property } from "@/domain/property/entities/Property";

/**
 * Stub implementation of INotificationService for development/testing
 * In production, this would be replaced with actual email/SMS service
 */
export class StubNotificationService implements INotificationService {
    async notifyPropertyCreated(_property: Property): Promise<void> {
        // Stub implementation - in production would send actual notifications
        // Note: Would notify property created in production
    }

    async notifyPropertyUpdated(_property: Property, _changes: string[]): Promise<void> {
        // Stub implementation - in production would send actual notifications
        // Note: Would notify property updated in production
    }

    async notifyUserRegistered(_userEmail: string, _userName: string): Promise<void> {
        // Stub implementation - in production would send actual notifications
        // Note: Would notify user registered in production
    }
}