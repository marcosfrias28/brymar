import { z } from 'zod';
import {
    AddressSchema,
    PropertyFeaturesSchema,
    ImageInputSchema,
    PropertyTypeSchema,
    CurrencySchema,
    SimplePriceSchema,
    ShortTextSchema,
    LongTextSchema,
    BooleanFlagSchema
} from '@/domain/shared/schemas';

const CreatePropertyInputSchema = z.object({
    title: ShortTextSchema.min(3, 'Title must be at least 3 characters'),
    description: LongTextSchema.min(10, 'Description must be at least 10 characters'),
    price: SimplePriceSchema,
    currency: CurrencySchema,
    address: AddressSchema,
    type: PropertyTypeSchema,
    features: PropertyFeaturesSchema,
    images: z.array(ImageInputSchema).optional(),
    featured: BooleanFlagSchema,
});

export type CreatePropertyInputData = z.infer<typeof CreatePropertyInputSchema>;
export type AddressInputData = z.infer<typeof AddressSchema>;
export type PropertyFeaturesInputData = z.infer<typeof PropertyFeaturesSchema>;
export type ImageInputData = z.infer<typeof ImageInputSchema>;

/**
 * Input DTO for creating a new property
 */
export class CreatePropertyInput {
    private constructor(
        public readonly title: string,
        public readonly description: string,
        public readonly price: number,
        public readonly currency: string,
        public readonly address: AddressInputData,
        public readonly type: string,
        public readonly features: PropertyFeaturesInputData,
        public readonly images?: ImageInputData[],
        public readonly featured: boolean = false
    ) { }

    /**
     * Creates and validates CreatePropertyInput from raw data
     */
    static create(data: CreatePropertyInputData): CreatePropertyInput {
        const validated = CreatePropertyInputSchema.parse(data);

        return new CreatePropertyInput(
            validated.title,
            validated.description,
            validated.price,
            validated.currency,
            validated.address,
            validated.type,
            validated.features,
            validated.images,
            validated.featured
        );
    }

    /**
     * Creates CreatePropertyInput from form data
     */
    static fromFormData(formData: FormData): CreatePropertyInput {
        // Parse basic fields
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);
        const currency = (formData.get('currency') as string) || 'USD';
        const type = formData.get('type') as 'house' | 'apartment' | 'condo' | 'townhouse' | 'villa' | 'studio' | 'penthouse' | 'duplex' | 'land' | 'commercial' | 'office' | 'warehouse';
        const featured = formData.get('featured') === 'true';

        // Parse address
        const address: AddressInputData = {
            street: formData.get('address.street') as string,
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

        // Parse features
        const features: PropertyFeaturesInputData = {
            bedrooms: parseInt(formData.get('features.bedrooms') as string) || 0,
            bathrooms: parseInt(formData.get('features.bathrooms') as string) || 0,
            area: parseFloat(formData.get('features.area') as string),
            amenities: [],
            features: [],
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

        // Handle images (files)
        const images: ImageInputData[] = [];
        const imageFiles = formData.getAll('images') as File[];
        for (const file of imageFiles) {
            if (file && file.size > 0) {
                images.push({
                    file,
                    filename: file.name,
                    mimeType: file.type,
                });
            }
        }

        const data: CreatePropertyInputData = {
            title,
            description,
            price,
            currency,
            address,
            type,
            features,
            images: images.length > 0 ? images : undefined,
            featured,
        };

        return CreatePropertyInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): CreatePropertyInputData {
        return CreatePropertyInputSchema.parse(data);
    }
}