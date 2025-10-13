import { z } from 'zod';
import {
    AddressSchema,
    ImageInputSchema,
    CurrencySchema,
    SimplePriceSchema,
    ShortTextSchema,
    LongTextSchema,
    BooleanFlagSchema,
    OptionalTagsSchema
} from '@/domain/shared/schemas';

// Land Type Schema
const LandTypeSchema = z.enum(['residential', 'commercial', 'agricultural', 'industrial', 'recreational', 'mixed-use']);

// Land Features Schema
const LandFeaturesSchema = z.object({
    area: z.number().min(1, 'Area must be at least 1 square meter').max(1000000, 'Area cannot exceed 1,000,000 square meters'),
    zoning: z.string().max(100, 'Zoning cannot exceed 100 characters').optional(),
    topography: z.enum(['flat', 'sloped', 'hilly', 'mountainous']).optional(),
    soilType: z.string().max(100, 'Soil type cannot exceed 100 characters').optional(),
    waterAccess: z.boolean().default(false),
    electricityAccess: z.boolean().default(false),
    roadAccess: z.boolean().default(false),
    utilities: z.array(z.string()).optional(),
    restrictions: z.array(z.string()).optional(),
    developmentPotential: z.enum(['low', 'medium', 'high']).optional(),
});

const CreateLandInputSchema = z.object({
    name: ShortTextSchema.min(3, 'Name must be at least 3 characters'),
    description: LongTextSchema.min(10, 'Description must be at least 10 characters'),
    area: z.number().min(1, 'Area must be at least 1 square meter').max(1000000, 'Area cannot exceed 1,000,000 square meters'),
    price: SimplePriceSchema,
    currency: CurrencySchema,
    location: z.string().min(1, 'Location is required').max(200, 'Location cannot exceed 200 characters'),
    type: LandTypeSchema,
    features: OptionalTagsSchema,
    images: z.array(ImageInputSchema).optional(),
});

export type CreateLandInputData = z.infer<typeof CreateLandInputSchema>;
export type LandFeaturesInputData = z.infer<typeof LandFeaturesSchema>;
export type ImageInputData = z.infer<typeof ImageInputSchema>;

/**
 * Input DTO for creating a new land
 */
export class CreateLandInput {
    private constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly area: number,
        public readonly price: number,
        public readonly currency: string,
        public readonly location: string,
        public readonly type: string,
        public readonly features?: string[],
        public readonly images?: ImageInputData[]
    ) { }

    /**
     * Creates and validates CreateLandInput from raw data
     */
    static create(data: CreateLandInputData): CreateLandInput {
        const validated = CreateLandInputSchema.parse(data);

        return new CreateLandInput(
            validated.name,
            validated.description,
            validated.area,
            validated.price,
            validated.currency,
            validated.location,
            validated.type,
            validated.features,
            validated.images
        );
    }

    /**
     * Creates CreateLandInput from form data
     */
    static fromFormData(formData: FormData): CreateLandInput {
        // Parse basic fields
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const area = parseFloat(formData.get('area') as string);
        const price = parseFloat(formData.get('price') as string);
        const currency = (formData.get('currency') as string) || 'USD';
        const location = formData.get('location') as string;
        const type = formData.get('type') as string;

        // Parse features array
        const featuresStr = formData.get('features') as string;
        const features = featuresStr ? featuresStr.split(',').map(f => f.trim()).filter(f => f.length > 0) : undefined;

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

        const data: CreateLandInputData = {
            name,
            description,
            area,
            price,
            currency,
            location,
            type,
            features,
            images: images.length > 0 ? images : undefined,
        };

        return CreateLandInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): CreateLandInputData {
        return CreateLandInputSchema.parse(data);
    }
}