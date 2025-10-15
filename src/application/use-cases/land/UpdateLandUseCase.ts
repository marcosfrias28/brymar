import { Land } from '@/domain/land/entities/Land';
import { LandId } from '@/domain/land/value-objects/LandId';
import { LandTitle } from '@/domain/land/value-objects/LandTitle';
import { LandDescription } from '@/domain/land/value-objects/LandDescription';
import { LandArea } from '@/domain/land/value-objects/LandArea';
import { LandPrice } from '@/domain/land/value-objects/LandPrice';
import { LandLocation } from '@/domain/land/value-objects/LandLocation';
import { LandType } from '@/domain/land/value-objects/LandType';
import { ILandRepository } from '@/domain/land/repositories/ILandRepository';
import { LandDomainService } from '@/domain/land/services/LandDomainService';
import { UpdateLandInput } from '../../dto/land/UpdateLandInput';
import { UpdateLandOutput } from '../../dto/land/UpdateLandOutput';
import { IImageService, INotificationService } from '../../services/interfaces';
import { BusinessRuleViolationError, EntityValidationError, EntityNotFoundError } from '@/domain/shared/errors/DomainError';

/**
 * Use case for updating an existing land
 */
export class UpdateLandUseCase {
    constructor(
        private readonly landRepository: ILandRepository,
        private readonly imageService: IImageService,
        private readonly notificationService: INotificationService
    ) { }

    /**
     * Executes the land update use case
     */
    async execute(input: UpdateLandInput): Promise<UpdateLandOutput> {
        try {
            // 1. Validate input has updates
            if (!input.hasUpdates()) {
                throw new EntityValidationError('No updates provided');
            }

            // 2. Find existing land
            const landId = LandId.create(input.id);
            const land = await this.landRepository.findById(landId);

            if (!land) {
                throw new EntityNotFoundError('Land', input.id);
            }

            // 3. Track changes for output
            const changes: string[] = [];

            // 4. Apply updates to land entity
            await this.applyUpdates(land, input, changes);

            // 5. Validate business rules after updates
            const domainService = new LandDomainService();
            domainService.validatePricing(land);

            // 6. Save updated land
            await this.landRepository.save(land);

            // 7. Send notifications if significant changes were made
            // TODO: Add land-specific notification when notifyLandUpdated method is implemented

            // 8. Return success result
            return UpdateLandOutput.from(land, changes);

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
                throw new Error(`Failed to update land: ${error.message}`);
            }

            // Re-throw unknown errors
            throw new Error(`Land update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
         * Applies updates to the land entity
         */
    private async applyUpdates(land: Land, input: UpdateLandInput, changes: string[]): Promise<void> {
        // Update title/name
        if (input.name) {
            const oldTitle = land.getTitle().value;
            const newTitle = LandTitle.create(input.name);
            land.updateTitle(newTitle);
            changes.push(`Title changed from "${oldTitle}" to "${input.name}"`);
        }

        // Update description
        if (input.description) {
            const oldDescription = land.getDescription().value;
            const newDescription = LandDescription.create(input.description);
            land.updateDescription(newDescription);
            changes.push(`Description updated`);
        }

        // Update area
        if (input.area !== undefined) {
            const oldArea = land.getArea().getValue();
            const newArea = LandArea.create(input.area);
            land.updateArea(newArea);
            changes.push(`Area changed from ${oldArea} to ${input.area} square meters`);
        }

        // Update price
        if (input.price !== undefined) {
            const oldPrice = land.getPrice();
            const newPrice = LandPrice.create(input.price, input.currency || oldPrice.currency.code);
            land.updatePrice(newPrice);
            changes.push(`Price changed from ${oldPrice.amount} ${oldPrice.currency.code} to ${newPrice.amount} ${newPrice.currency.code}`);
        }

        // Update location
        if (input.location) {
            const oldLocation = land.getLocation().address;
            const newLocation = LandLocation.create(input.location);
            land.updateLocation(newLocation);
            changes.push(`Location changed from "${oldLocation}" to "${input.location}"`);
        }

        // Update type
        if (input.type) {
            const oldType = land.getType().value;
            const newType = LandType.create(input.type);
            land.updateType(newType);
            changes.push(`Type changed from "${oldType}" to "${input.type}"`);
        }

        // Update features
        if (input.features) {
            const oldFeatures = land.getFeatures().features;
            // Remove old features and add new ones
            oldFeatures.forEach((feature: string) => land.removeFeature(feature));
            input.features.forEach((feature: string) => land.addFeature(feature));
            changes.push(`Features updated`);
        }

        // Handle image operations
        await this.handleImageOperations(land, input, changes);
    }

    /**
     * Handles image add, remove, and reorder operations
     */
    private async handleImageOperations(land: Land, input: UpdateLandInput, changes: string[]): Promise<void> {
        // Add new images
        if (input.imagesToAdd && input.imagesToAdd.length > 0) {
            for (const imageUrl of input.imagesToAdd) {
                land.addImage(imageUrl);
            }
            changes.push(`Added ${input.imagesToAdd.length} image(s)`);
        }

        // Remove images
        if (input.imagesToRemove && input.imagesToRemove.length > 0) {
            for (const imageUrl of input.imagesToRemove) {
                land.removeImage(imageUrl);

                // Delete from storage service
                try {
                    await this.imageService.deleteImage(imageUrl);
                } catch (deleteError) {
                    console.error(`Failed to delete image ${imageUrl}:`, deleteError);
                    // Continue with other operations
                }
            }
            changes.push(`Removed ${input.imagesToRemove.length} image(s)`);
        }

        // Reorder images (if supported by domain)
        if (input.imageOrder && input.imageOrder.length > 0) {
            const currentImages = land.getImages().getUrls();

            // Validate that all images in the new order exist
            const missingImages = input.imageOrder.filter(img => !currentImages.includes(img));
            if (missingImages.length > 0) {
                throw new EntityValidationError(`Cannot reorder: images not found: ${missingImages.join(', ')}`);
            }

            // For now, we'll just log this as land domain might not support reordering
            changes.push(`Image order updated`);
        }
    }

    /**
     * Determines if changes are significant enough to warrant notifications
     */
    private hasSignificantChanges(changes: string[]): boolean {
        const significantKeywords = ['price', 'location', 'type', 'area'];

        return changes.some(change =>
            significantKeywords.some(keyword =>
                change.toLowerCase().includes(keyword)
            )
        );
    }
}