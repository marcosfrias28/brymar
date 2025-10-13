import { Property } from '@/domain/property/entities/Property';
import { IPropertyRepository } from '@/domain/property/repositories/IPropertyRepository';
import { PropertyDomainService } from '@/domain/property/services/PropertyDomainService';
import { CreatePropertyInput } from '../../dto/property/CreatePropertyInput';
import { CreatePropertyOutput } from '../../dto/property/CreatePropertyOutput';
import { IImageService, INotificationService } from '../../services/interfaces';
import { BusinessRuleViolationError, EntityValidationError } from '@/domain/shared/errors/DomainError';

/**
 * Use case for creating a new property
 */
export class CreatePropertyUseCase {
    constructor(
        private readonly propertyRepository: IPropertyRepository,
        private readonly imageService: IImageService,
        private readonly notificationService: INotificationService
    ) { }

    /**
     * Executes the property creation use case
     */
    async execute(input: CreatePropertyInput): Promise<CreatePropertyOutput> {
        try {
            // 1. Validate business rules using domain service
            PropertyDomainService.validatePropertyCreation(
                input.type,
                input.features,
                input.price
            );

            // 2. Process images if provided
            let processedImageUrls: string[] = [];
            if (input.images && input.images.length > 0) {
                const processedImages = await this.imageService.processImages(input.images);
                processedImageUrls = processedImages.map(img => img.url);
            }

            // 3. Create property entity with processed image URLs
            const propertyData = {
                title: input.title,
                description: input.description,
                price: input.price,
                currency: input.currency,
                address: input.address,
                type: input.type,
                features: input.features,
                images: processedImageUrls,
                featured: input.featured,
            };

            const property = Property.create(propertyData);

            // 4. Validate property completeness
            if (!property.isComplete()) {
                throw new EntityValidationError('Property data is incomplete');
            }

            // 5. Save property to repository
            await this.propertyRepository.save(property);

            // 6. Send notifications
            try {
                await this.notificationService.notifyPropertyCreated(property);
            } catch (notificationError) {
                // Log notification error but don't fail the use case
                console.error('Failed to send property creation notification:', notificationError);
            }

            // 7. Return success result
            return CreatePropertyOutput.from(property);

        } catch (error) {
            if (error instanceof BusinessRuleViolationError || error instanceof EntityValidationError) {
                throw error;
            }

            // Handle image processing errors
            if (error instanceof Error && error.message.includes('image')) {
                throw new EntityValidationError(`Image processing failed: ${error.message}`);
            }

            // Handle repository errors
            if (error instanceof Error && error.message.includes('database')) {
                throw new Error(`Failed to save property: ${error.message}`);
            }

            // Re-throw unknown errors
            throw new Error(`Property creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validates that the property can be created
     */
    private async validatePropertyCreation(input: CreatePropertyInput): Promise<void> {
        // Check for duplicate properties (same address and similar features)
        const existingProperties = await this.propertyRepository.findByLocation(
            `${input.address.street}, ${input.address.city}`
        );

        const duplicateProperty = existingProperties.find(property => {
            const existingAddress = property.getAddress();
            const existingFeatures = property.getFeatures();

            return (
                existingAddress.street.toLowerCase() === input.address.street.toLowerCase() &&
                existingAddress.city.toLowerCase() === input.address.city.toLowerCase() &&
                existingFeatures.area === input.features.area &&
                Math.abs(property.getPrice().amount - input.price) < 1000 // Within $1000
            );
        });

        if (duplicateProperty) {
            throw new BusinessRuleViolationError(
                `A similar property already exists at this address (ID: ${duplicateProperty.getId().value})`
            );
        }

        // Validate price reasonableness for the area
        const areaProperties = await this.propertyRepository.findByLocation(input.address.city);
        if (areaProperties.length > 0) {
            const averagePrice = areaProperties.reduce((sum, p) => sum + p.getPrice().amount, 0) / areaProperties.length;
            const priceDeviation = Math.abs(input.price - averagePrice) / averagePrice;

            // Warn if price is significantly different from area average (more than 300% deviation)
            if (priceDeviation > 3.0) {
                console.warn(
                    `Property price (${input.price}) is significantly different from area average (${averagePrice}). ` +
                    `Deviation: ${(priceDeviation * 100).toFixed(1)}%`
                );
            }
        }
    }

    /**
     * Validates image requirements
     */
    private validateImages(images?: any[]): void {
        if (!images || images.length === 0) {
            return; // Images are optional for creation
        }

        if (images.length > 20) {
            throw new EntityValidationError('Cannot upload more than 20 images per property');
        }

        // Validate each image
        for (const image of images) {
            if (!image.file || !image.filename || !image.mimeType) {
                throw new EntityValidationError('Invalid image data provided');
            }

            if (!image.mimeType.startsWith('image/')) {
                throw new EntityValidationError(`Invalid file type: ${image.mimeType}. Only images are allowed.`);
            }

            // Check file size (assuming file has size property)
            if (image.file.size && image.file.size > 10 * 1024 * 1024) { // 10MB limit
                throw new EntityValidationError(`Image ${image.filename} is too large. Maximum size is 10MB.`);
            }
        }
    }
}