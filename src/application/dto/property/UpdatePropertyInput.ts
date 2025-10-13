import { z } from 'zod';
import {
    AddressSchema,
    PropertyFeaturesSchema,
    CurrencySchema,
    SimplePriceSchema,
    ShortTextSchema,
    LongTextSchema,
    IdSchema
} from '@/domain/shared/schemas';

const UpdatePropertyInputSchema = z.object({
    id: IdSchema,
    title: ShortTextSchema.min(3, 'Title must be at least 3 characters').optional(),
    description: LongTextSchema.min(10, 'Description must be at least 10 characters').optional(),
    price: SimplePriceSchema.optional(),
    currency: CurrencySchema.optional(),
    address: AddressSchema.optional(),
    features: PropertyFeaturesSchema.optional(),
    featured: z.boolean().optional(),
    imagesToAdd: z.array(z.string()).optional(),
    imagesToRemove: z.array(z.string()).optional(),
    imageOrder: z.array(z.string()).optional(),
});

export type UpdatePropertyInputData = z.infer<typeof UpdatePropertyInputSchema>;
export type AddressInputData = z.infer<typeof AddressSchema>;
export type PropertyFeaturesInputData = z.infer<typeof PropertyFeaturesSchema>;

/**
 * Input DTO for updating an existing property
 */
export class UpdatePropertyInput {
    private constructor(
        public readonly id: string,
        public readonly title?: string,
        public readonly description?: string,
        public readonly price?: number,
        public readonly currency?: string,
        public readonly address?: AddressInputData,
        public readonly features?: PropertyFeaturesInputData,
        public readonly featured?: boolean,
        public readonly imagesToAdd?: string[],
        public readonly imagesToRemove?: string[],
        public readonly imageOrder?: string[]
    ) { }

    /**
     * Creates and validates UpdatePropertyInput from raw data
     */
    static create(data: UpdatePropertyInputData): UpdatePropertyInput {
        const validated = UpdatePropertyInputSchema.parse(data);

        return new UpdatePropertyInput(
            validated.id,
            validated.title,
            validated.description,
            validated.price,
            validated.currency,
            validated.address,
            validated.features,
            validated.featured,
            validated.imagesToAdd,
            validated.imagesToRemove,
            validated.imageOrder
        );
    }

    /**
     * Creates UpdatePropertyInput from form data
     */
    static fromFormData(formData: FormData): UpdatePropertyInput {
        const id = formData.get('id') as string;

        // Parse optional basic fields
        const title = formData.get('title') as string || undefined;
        const description = formData.get('description') as string || undefined;
        const priceStr = formData.get('price') as string;
        const price = priceStr ? parseFloat(priceStr) : undefined;
        const currency = formData.get('currency') as string || undefined;
        const featuredStr = formData.get('featured') as string;
        const featured = featuredStr ? featuredStr === 'true' : undefined;

        // Parse address if provided
        let address: AddressInputData | undefined;
        const street = formData.get('address.street') as string;
        if (street) {
            address = {
                street,
                city: formData.get('address.city') as string,
                state: formData.get('address.state') as string,
                country: formData.get('address.country') as string,
                postalCode: formData.get('address.postalCode') as string || undefined,
            };

            // Parse coordinates if provided
            const latitude = formData.get('address.coordinates.latitude');
            const longitude = formData.get('address.coordinates.longitude');
            if (latitude && longitude) {
                address.coordinates = {
                    latitude: parseFloat(latitude as string),
                    longitude: parseFloat(longitude as string),
                };
            }
        }

        // Parse features if provided
        let features: PropertyFeaturesInputData | undefined;
        const areaStr = formData.get('features.area') as string;
        if (areaStr) {
            features = {
                bedrooms: parseInt(formData.get('features.bedrooms') as string) || 0,
                bathrooms: parseInt(formData.get('features.bathrooms') as string) || 0,
                area: parseFloat(areaStr),
            };

            // Parse optional features
            const yearBuilt = formData.get('features.yearBuilt');
            if (yearBuilt) {
                features.yearBuilt = parseInt(yearBuilt as string);
            }

            const lotSize = formData.get('features.lotSize');
            if (lotSize) {
                features.lotSize = parseFloat(lotSize as string);
            }

            // Parse amenities and features arrays
            const amenitiesStr = formData.get('features.amenities') as string;
            if (amenitiesStr) {
                features.amenities = amenitiesStr.split(',').map(a => a.trim()).filter(a => a.length > 0);
            }

            const featuresStr = formData.get('features.features') as string;
            if (featuresStr) {
                features.features = featuresStr.split(',').map(f => f.trim()).filter(f => f.length > 0);
            }

            // Parse parking
            const parkingSpaces = formData.get('features.parking.spaces');
            const parkingType = formData.get('features.parking.type');
            if (parkingSpaces && parkingType) {
                features.parking = {
                    spaces: parseInt(parkingSpaces as string),
                    type: parkingType as 'garage' | 'carport' | 'street' | 'covered',
                };
            }
        }

        // Parse image operations
        const imagesToAddStr = formData.get('imagesToAdd') as string;
        const imagesToAdd = imagesToAddStr ? imagesToAddStr.split(',').map(i => i.trim()).filter(i => i.length > 0) : undefined;

        const imagesToRemoveStr = formData.get('imagesToRemove') as string;
        const imagesToRemove = imagesToRemoveStr ? imagesToRemoveStr.split(',').map(i => i.trim()).filter(i => i.length > 0) : undefined;

        const imageOrderStr = formData.get('imageOrder') as string;
        const imageOrder = imageOrderStr ? imageOrderStr.split(',').map(i => i.trim()).filter(i => i.length > 0) : undefined;

        const data: UpdatePropertyInputData = {
            id,
            title,
            description,
            price,
            currency,
            address,
            features,
            featured,
            imagesToAdd,
            imagesToRemove,
            imageOrder,
        };

        return UpdatePropertyInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): UpdatePropertyInputData {
        return UpdatePropertyInputSchema.parse(data);
    }

    /**
     * Checks if any field is being updated
     */
    hasUpdates(): boolean {
        return !!(
            this.title ||
            this.description ||
            this.price !== undefined ||
            this.currency ||
            this.address ||
            this.features ||
            this.featured !== undefined ||
            this.imagesToAdd?.length ||
            this.imagesToRemove?.length ||
            this.imageOrder?.length
        );
    }
}