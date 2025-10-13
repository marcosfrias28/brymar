import { z } from 'zod';
import {
    CurrencySchema,
    SimplePriceSchema,
    ShortTextSchema,
    LongTextSchema,
    IdSchema,
    OptionalTagsSchema
} from '@/domain/shared/schemas';

// Land Type Schema
const LandTypeSchema = z.enum(['residential', 'commercial', 'agricultural', 'industrial', 'recreational', 'mixed-use']);

const UpdateLandInputSchema = z.object({
    id: IdSchema,
    name: ShortTextSchema.min(3, 'Name must be at least 3 characters').optional(),
    description: LongTextSchema.min(10, 'Description must be at least 10 characters').optional(),
    area: z.number().min(1, 'Area must be at least 1 square meter').max(1000000, 'Area cannot exceed 1,000,000 square meters').optional(),
    price: SimplePriceSchema.optional(),
    currency: CurrencySchema.optional(),
    location: z.string().min(1, 'Location is required').max(200, 'Location cannot exceed 200 characters').optional(),
    type: LandTypeSchema.optional(),
    features: OptionalTagsSchema,
    imagesToAdd: z.array(z.string()).optional(),
    imagesToRemove: z.array(z.string()).optional(),
    imageOrder: z.array(z.string()).optional(),
});

export type UpdateLandInputData = z.infer<typeof UpdateLandInputSchema>;

/**
 * Input DTO for updating an existing land
 */
export class UpdateLandInput {
    private constructor(
        public readonly id: string,
        public readonly name?: string,
        public readonly description?: string,
        public readonly area?: number,
        public readonly price?: number,
        public readonly currency?: string,
        public readonly location?: string,
        public readonly type?: string,
        public readonly features?: string[],
        public readonly imagesToAdd?: string[],
        public readonly imagesToRemove?: string[],
        public readonly imageOrder?: string[]
    ) { }

    /**
     * Creates and validates UpdateLandInput from raw data
     */
    static create(data: UpdateLandInputData): UpdateLandInput {
        const validated = UpdateLandInputSchema.parse(data);

        return new UpdateLandInput(
            validated.id,
            validated.name,
            validated.description,
            validated.area,
            validated.price,
            validated.currency,
            validated.location,
            validated.type,
            validated.features,
            validated.imagesToAdd,
            validated.imagesToRemove,
            validated.imageOrder
        );
    }
    /**
      * Creates UpdateLandInput from form data
      */
    static fromFormData(formData: FormData): UpdateLandInput {
        const id = formData.get('id') as string;

        // Parse optional basic fields
        const name = formData.get('name') as string || undefined;
        const description = formData.get('description') as string || undefined;
        const areaStr = formData.get('area') as string;
        const area = areaStr ? parseFloat(areaStr) : undefined;
        const priceStr = formData.get('price') as string;
        const price = priceStr ? parseFloat(priceStr) : undefined;
        const currency = formData.get('currency') as string || undefined;
        const location = formData.get('location') as string || undefined;
        const type = formData.get('type') as string || undefined;

        // Parse features array
        const featuresStr = formData.get('features') as string;
        const features = featuresStr ? featuresStr.split(',').map(f => f.trim()).filter(f => f.length > 0) : undefined;

        // Parse image operations
        const imagesToAddStr = formData.get('imagesToAdd') as string;
        const imagesToAdd = imagesToAddStr ? imagesToAddStr.split(',').map(i => i.trim()).filter(i => i.length > 0) : undefined;

        const imagesToRemoveStr = formData.get('imagesToRemove') as string;
        const imagesToRemove = imagesToRemoveStr ? imagesToRemoveStr.split(',').map(i => i.trim()).filter(i => i.length > 0) : undefined;

        const imageOrderStr = formData.get('imageOrder') as string;
        const imageOrder = imageOrderStr ? imageOrderStr.split(',').map(i => i.trim()).filter(i => i.length > 0) : undefined;

        const data: UpdateLandInputData = {
            id,
            name,
            description,
            area,
            price,
            currency,
            location,
            type,
            features,
            imagesToAdd,
            imagesToRemove,
            imageOrder,
        };

        return UpdateLandInput.create(data);
    }

    /**
     * Validates the input data
     */
    static validate(data: any): UpdateLandInputData {
        return UpdateLandInputSchema.parse(data);
    }

    /**
     * Checks if any field is being updated
     */
    hasUpdates(): boolean {
        return !!(
            this.name ||
            this.description ||
            this.area !== undefined ||
            this.price !== undefined ||
            this.currency ||
            this.location ||
            this.type ||
            this.features?.length ||
            this.imagesToAdd?.length ||
            this.imagesToRemove?.length ||
            this.imageOrder?.length
        );
    }
}