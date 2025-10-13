import { Land } from '@/domain/land/entities/Land';
import { ILandRepository } from '@/domain/land/repositories/ILandRepository';
import { LandDomainService } from '@/domain/land/services/LandDomainService';
import { CreateLandInput } from '../../dto/land/CreateLandInput';
import { CreateLandOutput } from '../../dto/land/CreateLandOutput';
import { IImageService, INotificationService } from '../../services/interfaces';
import { BusinessRuleViolationError, EntityValidationError } from '@/domain/shared/errors/DomainError';

/**
 * Use case for creating a new land
 */
export class CreateLandUseCase {
    constructor(
        private readonly landRepository: ILandRepository,
        private readonly imageService: IImageService,
        private readonly notificationService: INotificationService
    ) { }

    /**
     * Executes the land creation use case
     */
    async execute(input: CreateLandInput): Promise<CreateLandOutput> {
        try {
            // 1. Validate business rules using domain service
            // Note: We'll validate after creating the entity since domain service works with Land entities

            // 2. Process images if provided
            let processedImageUrls: string[] = [];
            if (input.images && input.images.length > 0) {
                const processedImages = await this.imageService.processImages(input.images);
                processedImageUrls = processedImages.map(img => img.url);
            }

            // 3. Create land entity with processed image URLs
            const landData = {
                name: input.name,
                description: input.description,
                area: input.area,
                price: input.price,
                currency: input.currency,
                location: input.location,
                type: input.type,
                features: input.features || [],
                images: processedImageUrls,
            };

            const land = Land.create(landData);

            // 4. Validate land completeness
            if (!land.isComplete()) {
                throw new EntityValidationError('Land data is incomplete');
            }

            // 5. Validate business rules using domain service
            const domainService = new LandDomainService();
            domainService.validatePricing(land);

            // 6. Validate for duplicates
            await this.validateLandCreation(input);

            // 7. Save land to repository
            await this.landRepository.save(land);

            // 8. Send notifications
            try {
                await this.notificationService.notifyPropertyCreated(land);
            } catch (notificationError) {
                // Log notification error but don't fail the use case
                console.error('Failed to send land creation notification:', notificationError);
            }

            // 9. Return success result
            return CreateLandOutput.from(land);

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
                throw new Error(`Failed to save land: ${error.message}`);
            }

            // Re-throw unknown errors
            throw new Error(`Land creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
         * Validates that the land can be created
         */
    private async validateLandCreation(input: CreateLandInput): Promise<void> {
        // Check for duplicate lands (same location and similar area)
        const existingLands = await this.landRepository.findByLocation(input.location);

        const duplicateLand = existingLands.find(land => {
            const existingArea = land.getArea().getValue();
            const areaDeviation = Math.abs(existingArea - input.area) / input.area;

            return (
                land.getLocation().address.toLowerCase() === input.location.toLowerCase() &&
                areaDeviation < 0.1 && // Within 10% area difference
                Math.abs(land.getPrice().amount - input.price) < 10000 // Within $10,000
            );
        });

        if (duplicateLand) {
            throw new BusinessRuleViolationError(
                `A similar land already exists at this location (ID: ${duplicateLand.getLandId().value})`
            );
        }

        // Validate price reasonableness for the area
        const areaLands = await this.landRepository.findByLocation(input.location);
        if (areaLands.length > 0) {
            const averagePrice = areaLands.reduce((sum, l) => sum + l.getPrice().amount, 0) / areaLands.length;
            const priceDeviation = Math.abs(input.price - averagePrice) / averagePrice;

            // Warn if price is significantly different from area average (more than 200% deviation)
            if (priceDeviation > 2.0) {
                console.warn(
                    `Land price (${input.price}) is significantly different from area average (${averagePrice}). ` +
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

        if (images.length > 15) {
            throw new EntityValidationError('Cannot upload more than 15 images per land');
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