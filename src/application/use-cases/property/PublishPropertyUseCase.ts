import { Property } from '@/domain/property/entities/Property';
import { PropertyId } from '@/domain/property/value-objects/PropertyId';
import { IPropertyRepository } from '@/domain/property/repositories/IPropertyRepository';
import { PropertyDomainService } from '@/domain/property/services/PropertyDomainService';
import { PublishPropertyInput } from '../../dto/property/PublishPropertyInput';
import { PublishPropertyOutput } from '../../dto/property/PublishPropertyOutput';
import { INotificationService, IAnalyticsService } from '../../services/interfaces';
import { BusinessRuleViolationError, EntityValidationError, EntityNotFoundError } from '@/domain/shared/errors/DomainError';

/**
 * Use case for publishing a property
 */
export class PublishPropertyUseCase {
    constructor(
        private readonly propertyRepository: IPropertyRepository,
        private readonly notificationService: INotificationService,
        private readonly analyticsService: IAnalyticsService
    ) { }

    /**
     * Executes the property publishing use case
     */
    async execute(input: PublishPropertyInput): Promise<PublishPropertyOutput> {
        try {
            // 1. Find the property
            const propertyId = PropertyId.create(input.id);
            const property = await this.propertyRepository.findById(propertyId);

            if (!property) {
                throw new EntityNotFoundError('Property', input.id);
            }

            // 2. Validate property can be published
            this.validatePropertyForPublishing(property, input);

            // 3. Handle scheduled publishing
            if (input.isScheduled()) {
                return this.handleScheduledPublishing(property, input);
            }

            // 4. Set featured status if requested
            if (input.shouldBeFeatured()) {
                property.setFeatured(true);
            }

            // 5. Publish the property
            property.publish();

            // 6. Save the updated property
            await this.propertyRepository.save(property);

            // 7. Send notifications if requested
            let notificationsSent = false;
            if (input.notifySubscribers) {
                try {
                    await this.sendPublishNotifications(property, input);
                    notificationsSent = true;
                } catch (notificationError) {
                    console.error('Failed to send publish notifications:', notificationError);
                    // Don't fail the use case for notification errors
                }
            }

            // 8. Track analytics
            try {
                await this.trackPublishEvent(property, input);
            } catch (analyticsError) {
                console.error('Failed to track publish event:', analyticsError);
                // Don't fail the use case for analytics errors
            }

            // 9. Return success result
            return PublishPropertyOutput.from(
                property,
                input.publishedBy,
                input.publishNotes,
                input.scheduledPublishDate,
                input.featuredUntil,
                notificationsSent,
                this.getBaseUrl()
            );

        } catch (error) {
            if (
                error instanceof BusinessRuleViolationError ||
                error instanceof EntityValidationError ||
                error instanceof EntityNotFoundError
            ) {
                throw error;
            }

            // Handle repository errors
            if (error instanceof Error && error.message.includes('database')) {
                throw new Error(`Failed to publish property: ${error.message}`);
            }

            // Re-throw unknown errors
            throw new Error(`Property publishing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validates that the property can be published
     */
    private validatePropertyForPublishing(property: Property, input: PublishPropertyInput): void {
        // Check if property can be published using domain logic
        if (!property.canBePublished()) {
            const reasons: string[] = [];

            if (!property.isComplete()) {
                reasons.push('Property information is incomplete');
            }

            if (!property.hasRequiredImages()) {
                reasons.push('Property must have at least one image');
            }

            if (!property.getStatus().canBePublished()) {
                reasons.push(`Cannot publish property with status: ${property.getStatus().getDisplayName()}`);
            }

            throw new BusinessRuleViolationError(
                `Property cannot be published: ${reasons.join(', ')}`
            );
        }

        // Validate scheduled publish date
        if (input.scheduledPublishDate) {
            const now = new Date();
            if (input.scheduledPublishDate <= now) {
                throw new EntityValidationError('Scheduled publish date must be in the future');
            }

            // Don't allow scheduling too far in the future (e.g., more than 1 year)
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

            if (input.scheduledPublishDate > oneYearFromNow) {
                throw new EntityValidationError('Cannot schedule publishing more than 1 year in advance');
            }
        }

        // Validate featured until date
        if (input.featuredUntil) {
            const now = new Date();
            if (input.featuredUntil <= now) {
                throw new EntityValidationError('Featured until date must be in the future');
            }
        }

        // Business rule: Luxury properties should have multiple images
        if (property.isLuxury() && property.getImages().length < 3) {
            console.warn(`Luxury property ${property.getId().value} has fewer than 3 images`);
        }

        // Business rule: Commercial properties should have specific information
        if (property.getType().value === 'commercial' || property.getType().value === 'office') {
            const features = property.getFeatures();
            if (!features.features || features.features.length === 0) {
                throw new BusinessRuleViolationError(
                    'Commercial properties must have detailed features listed'
                );
            }
        }
    }

    /**
     * Handles scheduled publishing (saves for later processing)
     */
    private async handleScheduledPublishing(property: Property, input: PublishPropertyInput): Promise<PublishPropertyOutput> {
        // In a real implementation, this would save the scheduled publish job
        // For now, we'll just return the output indicating it's scheduled

        // Set featured status if requested
        if (input.shouldBeFeatured()) {
            property.setFeatured(true);
            await this.propertyRepository.save(property);
        }

        // Track scheduled publish event
        try {
            await this.analyticsService.trackEvent({
                name: 'property_publish_scheduled',
                properties: {
                    propertyId: property.getId().value,
                    scheduledDate: input.scheduledPublishDate!.toISOString(),
                    publishedBy: input.publishedBy,
                },
                timestamp: new Date(),
            });
        } catch (error) {
            console.error('Failed to track scheduled publish event:', error);
        }

        return PublishPropertyOutput.from(
            property,
            input.publishedBy,
            input.publishNotes,
            input.scheduledPublishDate,
            input.featuredUntil,
            false, // No notifications sent yet
            this.getBaseUrl()
        );
    }

    /**
     * Sends notifications about the published property
     */
    private async sendPublishNotifications(property: Property, input: PublishPropertyInput): Promise<void> {
        // Notify property creation (reuse existing notification)
        await this.notificationService.notifyPropertyCreated(property);

        // Additional notifications could be sent here:
        // - Email to subscribers in the area
        // - Push notifications to mobile app users
        // - Social media posts
        // - Real estate portals
    }

    /**
     * Tracks the publish event for analytics
     */
    private async trackPublishEvent(property: Property, input: PublishPropertyInput): Promise<void> {
        await this.analyticsService.trackEvent({
            name: 'property_published',
            properties: {
                propertyId: property.getId().value,
                propertyType: property.getType().value,
                price: property.getPrice().amount,
                currency: property.getPrice().currency.code,
                bedrooms: property.getFeatures().bedrooms,
                bathrooms: property.getFeatures().bathrooms,
                area: property.getFeatures().area,
                city: property.getAddress().city,
                state: property.getAddress().state,
                country: property.getAddress().country,
                featured: property.isFeatured(),
                publishedBy: input.publishedBy,
                hasImages: property.getImages().length > 0,
                imageCount: property.getImages().length,
                isLuxury: property.isLuxury(),
                isFamilyFriendly: property.isFamilyFriendly(),
            },
            timestamp: new Date(),
        });
    }

    /**
     * Gets the base URL for property links
     */
    private getBaseUrl(): string {
        // In a real implementation, this would come from configuration
        return process.env.BASE_URL || 'https://brymar.com';
    }

    /**
     * Validates publish permissions (if needed)
     */
    private validatePublishPermissions(publishedBy?: string): void {
        // In a real implementation, this would check user permissions
        // For now, we'll just validate that publishedBy is provided if required

        if (!publishedBy) {
            // This might be optional depending on business rules
            console.warn('Property published without specifying publisher');
        }
    }
}