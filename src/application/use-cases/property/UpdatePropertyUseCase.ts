import { Property } from '@/domain/property/entities/Property';
import { PropertyId } from '@/domain/property/value-objects/PropertyId';
import { IPropertyRepository } from '@/domain/property/repositories/IPropertyRepository';
import { PropertyDomainService } from '@/domain/property/services/PropertyDomainService';
import { UpdatePropertyInput } from '../../dto/property/UpdatePropertyInput';
import { UpdatePropertyOutput } from '../../dto/property/UpdatePropertyOutput';
import { IImageService, INotificationService } from '../../services/interfaces';
import { BusinessRuleViolationError, EntityValidationError, EntityNotFoundError } from '@/domain/shared/errors/DomainError';

/**
 * Use case for updating an existing property
 */
export class UpdatePropertyUseCase {
    constructor(
        private readonly propertyRepository: IPropertyRepository,
        private readonly imageService: IImageService,
        private readonly notificationService: INotificationService
    ) { }

    /**
     * Executes the property update use case
     */
    async execute(input: UpdatePropertyInput): Promise<UpdatePropertyOutput> {
        try {
            // 1. Validate input has updates
            if (!input.hasUpdates()) {
                throw new EntityValidationError('No updates provided');
            }

            // 2. Find existing property
            const propertyId = PropertyId.create(input.id);
            const property = await this.propertyRepository.findById(propertyId);

            if (!property) {
                throw new EntityNotFoundError('Property', input.id);
            }

            // 3. Track changes for output
            const changes: string[] = [];

            // 4. Apply updates to property entity
            await this.applyUpdates(property, input, changes);

            // 5. Validate business rules after updates
            PropertyDomainService.validatePropertyUpdate(property);

            // 6. Save updated property
            await this.propertyRepository.save(property);

            // 7. Send notifications if significant changes were made
            if (this.hasSignificantChanges(changes)) {
                try {
                    await this.notificationService.notifyPropertyCreated(property); // Reuse notification
                } catch (notificationError) {
                    console.error('Failed to send property update notification:', notificationError);
                }
            }

            // 8. Return success result
            return UpdatePropertyOutput.from(property, changes);

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
                throw new Error(`Failed to update property: ${error.message}`);
            }

            // Re-throw unknown errors
            throw new Error(`Property update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Applies updates to the property entity
     */
    private async applyUpdates(property: Property, input: UpdatePropertyInput, changes: string[]): Promise<void> {
        // Update title
        if (input.title) {
            const oldTitle = property.getTitle().value;
            property.updateTitle(input.title);
            changes.push(`Title changed from "${oldTitle}" to "${input.title}"`);
        }

        // Update description
        if (input.description) {
            const oldDescription = property.getDescription().value;
            property.updateDescription(input.description);
            changes.push(`Description updated`);
        }

        // Update price
        if (input.price !== undefined) {
            const oldPrice = property.getPrice();
            property.updatePrice(input.price, input.currency);
            const newPrice = property.getPrice();
            changes.push(`Price changed from ${oldPrice.format()} to ${newPrice.format()}`);
        }

        // Update address
        if (input.address) {
            const oldAddress = property.getAddress();
            property.updateAddress(input.address);
            changes.push(`Address updated from "${oldAddress.getFullAddress()}" to "${property.getAddress().getFullAddress()}"`);
        }

        // Update features
        if (input.features) {
            const oldFeatures = property.getFeatures();
            property.updateFeatures(input.features);
            changes.push(`Property features updated`);
        }

        // Update featured status
        if (input.featured !== undefined) {
            const oldFeatured = property.isFeatured();
            property.setFeatured(input.featured);
            changes.push(`Featured status changed from ${oldFeatured} to ${input.featured}`);
        }

        // Handle image operations
        await this.handleImageOperations(property, input, changes);
    }

    /**
     * Handles image add, remove, and reorder operations
     */
    private async handleImageOperations(property: Property, input: UpdatePropertyInput, changes: string[]): Promise<void> {
        // Add new images
        if (input.imagesToAdd && input.imagesToAdd.length > 0) {
            for (const imageUrl of input.imagesToAdd) {
                property.addImage(imageUrl);
            }
            changes.push(`Added ${input.imagesToAdd.length} image(s)`);
        }

        // Remove images
        if (input.imagesToRemove && input.imagesToRemove.length > 0) {
            for (const imageUrl of input.imagesToRemove) {
                property.removeImage(imageUrl);

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

        // Reorder images
        if (input.imageOrder && input.imageOrder.length > 0) {
            const currentImages = property.getImages();

            // Validate that all images in the new order exist
            const missingImages = input.imageOrder.filter(img => !currentImages.includes(img));
            if (missingImages.length > 0) {
                throw new EntityValidationError(`Cannot reorder: images not found: ${missingImages.join(', ')}`);
            }

            property.reorderImages(input.imageOrder);
            changes.push(`Reordered images`);
        }
    }

    /**
     * Validates that the property can be updated
     */
    private validatePropertyUpdate(property: Property, input: UpdatePropertyInput): void {
        // Check if property can be edited
        if (!property.getStatus().canBeEdited()) {
            throw new BusinessRuleViolationError(
                `Cannot update property with status: ${property.getStatus().getDisplayName()}`,
                'PROPERTY_STATUS_NOT_EDITABLE'
            );
        }

        // Validate price changes for published properties
        if (input.price !== undefined && property.getStatus().isPublished()) {
            const currentPrice = property.getPrice().amount;
            const priceChangePercentage = Math.abs(input.price - currentPrice) / currentPrice;

            if (priceChangePercentage > 0.15) { // 15% threshold
                throw new BusinessRuleViolationError(
                    'Price changes greater than 15% on published properties require approval',
                    'SIGNIFICANT_PRICE_CHANGE_REQUIRES_APPROVAL'
                );
            }
        }

        // Validate image limits
        const currentImageCount = property.getImages().length;
        const imagesToAdd = input.imagesToAdd?.length || 0;
        const imagesToRemove = input.imagesToRemove?.length || 0;
        const finalImageCount = currentImageCount + imagesToAdd - imagesToRemove;

        if (finalImageCount > 20) {
            throw new EntityValidationError('Cannot have more than 20 images per property');
        }

        if (finalImageCount < 0) {
            throw new EntityValidationError('Cannot remove more images than currently exist');
        }
    }

    /**
     * Determines if changes are significant enough to warrant notifications
     */
    private hasSignificantChanges(changes: string[]): boolean {
        const significantKeywords = ['price', 'address', 'featured', 'status'];

        return changes.some(change =>
            significantKeywords.some(keyword =>
                change.toLowerCase().includes(keyword)
            )
        );
    }

    /**
     * Validates image URLs
     */
    private validateImageUrls(imageUrls: string[]): void {
        for (const url of imageUrls) {
            if (!url || url.trim().length === 0) {
                throw new EntityValidationError('Image URL cannot be empty');
            }

            // Basic URL validation
            try {
                new URL(url);
            } catch {
                throw new EntityValidationError(`Invalid image URL: ${url}`);
            }

            // Check if it's an image URL (basic check)
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
            const hasImageExtension = imageExtensions.some(ext =>
                url.toLowerCase().includes(ext)
            );

            if (!hasImageExtension && !url.includes('blob') && !url.includes('cloudinary')) {
                console.warn(`URL may not be an image: ${url}`);
            }
        }
    }
}